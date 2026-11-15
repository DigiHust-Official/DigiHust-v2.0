-- ==============================================================================
-- site_content: ADMIN-ONLY WRITES  (Task 1 — case studies editable by admin only)
-- Status: READY FOR MANAGER REVIEW. NOT applied by the agent (CLAUDE.md rule 6).
--
-- WHAT IT DOES
--   * Everyone (anon + logged in) can READ site_content (public site needs it).
--   * Only a logged-in Supabase Auth user whose public.users row is an admin
--     can INSERT / UPDATE / DELETE it:
--       role_tier IN ('ceo','manager') OR role = 'management'
--     (same rule as the app: PERMISSIONS.canEditWebsiteContent in
--      src/lib/permissions.ts and PortalDashboard.tsx isManagement).
--   * site_content is ONE JSON row ('primary_cms') holding the whole CMS, so this
--     protects case studies AND every other CMS section.
--
-- WHY IT IS NEEDED
--   supabase/schema.sql has "Allow full access site_content" FOR ALL USING (true):
--   anyone with the public anon key (shipped in the site's JS) can overwrite the
--   whole site with one REST call. App-side checks cannot stop that.
--
-- BEFORE APPLYING (staging first!)
--   1. Every admin must sign in to the portal through Supabase Auth
--      (PortalLogin -> supabase.auth.signInWithPassword). Admins who only work via
--      the local fallback login have no Supabase session and will NOT be able to
--      save; the app now shows a "Save failed" toast in that case.
--   2. Run the PREFLIGHT query below and check every admin has auth_user_id.
--
-- The script aborts (no changes) if no admin is linked to a Supabase Auth
-- account, so it cannot lock every admin out.
-- ==============================================================================

-- ---------------------------------------------------------------------------
-- PREFLIGHT (read-only; run first and review the output)
-- ---------------------------------------------------------------------------
-- Current policies on the table:
--   SELECT policyname, cmd, roles, qual, with_check
--   FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_content';
--
-- Admins and whether they have a matching Supabase Auth account
-- (works before the column exists):
--   SELECT u.id, u.name, u.email, u.role, u.role_tier, a.id AS auth_id
--   FROM public.users u
--   LEFT JOIN auth.users a ON lower(trim(a.email)) = lower(trim(u.email))
--   WHERE u.role_tier IN ('ceo','manager') OR u.role = 'management';
--   -> every row should have auth_id. Rows with NULL auth_id cannot save the CMS
--      until that admin signs in once through the portal (Supabase Auth).

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Link portal users to Supabase Auth accounts
--    (column is referenced by migration 20261017_005 but never created in repo)
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID;
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

-- Backfill by email for users that already have a Supabase Auth account
UPDATE public.users u
SET auth_user_id = a.id
FROM auth.users a
WHERE u.auth_user_id IS NULL
  AND u.email IS NOT NULL
  AND lower(trim(a.email)) = lower(trim(u.email));

-- Safety: abort everything if no admin can authenticate (would lock CMS for all)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id IS NOT NULL
      AND (u.role_tier IN ('ceo', 'manager') OR u.role = 'management')
  ) THEN
    RAISE EXCEPTION 'Aborting: no admin user is linked to a Supabase Auth account. '
                    'Have an admin sign in through the portal first, then re-run.';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Admin check used by the policies
--    SECURITY DEFINER so it can read public.users even if users RLS blocks the caller.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_site_content_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role_tier IN ('ceo', 'manager') OR u.role = 'management')
  );
$$;

REVOKE ALL ON FUNCTION public.is_site_content_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_site_content_admin() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Replace ALL existing policies on site_content.
--    Permissive policies are OR-ed, so a single leftover "USING (true)" write
--    policy would defeat the admin rule; drop every policy, whatever its name.
-- ---------------------------------------------------------------------------
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_content'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.site_content', pol.policyname);
  END LOOP;
END $$;

-- Public read (home page and all public pages load the CMS as anon)
CREATE POLICY "site_content_public_read"
  ON public.site_content
  FOR SELECT
  USING (true);

-- Writes: logged-in admins only. upsert() needs both INSERT and UPDATE.
CREATE POLICY "site_content_admin_insert"
  ON public.site_content
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_site_content_admin());

CREATE POLICY "site_content_admin_update"
  ON public.site_content
  FOR UPDATE
  TO authenticated
  USING (public.is_site_content_admin())
  WITH CHECK (public.is_site_content_admin());

CREATE POLICY "site_content_admin_delete"
  ON public.site_content
  FOR DELETE
  TO authenticated
  USING (public.is_site_content_admin());

COMMIT;

-- ==============================================================================
-- VERIFY (after applying, on staging first)
--   1. Public site loads (anon read):        open the home page, case study pages.
--   2. Anon write blocked (REST, anon key):
--        curl -X PATCH "$SUPABASE_URL/rest/v1/site_content?id=eq.primary_cms" \
--          -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
--          -H "Content-Type: application/json" -d '{"updated_at":"2000-01-01"}'
--        -> no row updated / RLS error.
--   3. Intern (logged in via portal): cannot open /portal/cms; any write -> RLS error.
--   4. CEO/manager (logged in via portal): edit a case study in /portal/cms,
--      reload -> change persists; no "Save failed" toast.
--
-- ROLLBACK (restores the previous open behaviour — insecure, emergency only)
--   BEGIN;
--   DROP POLICY IF EXISTS "site_content_admin_insert" ON public.site_content;
--   DROP POLICY IF EXISTS "site_content_admin_update" ON public.site_content;
--   DROP POLICY IF EXISTS "site_content_admin_delete" ON public.site_content;
--   CREATE POLICY "Allow full access site_content" ON public.site_content
--     FOR ALL USING (true) WITH CHECK (true);
--   COMMIT;
--   (auth_user_id column and is_site_content_admin() can stay; they are harmless.)
-- ==============================================================================
