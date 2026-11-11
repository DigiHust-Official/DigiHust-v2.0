-- =====================================================================
-- DigiHust Work Projects & Media Storage Schema (PROPOSAL ONLY)
-- DO NOT RUN OR APPLY TO PRODUCTION WITHOUT PRIOR SECURITY REVIEW.
-- This proposal schema defines dedicated persistence for work projects
-- and public storage for portfolio images.
-- =====================================================================

-- 1. Storage Bucket for Work & Case Study Media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'work-media',
  'work-media',
  true,
  5242880, -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Access Policies
CREATE POLICY "Public Read Work Media"
ON storage.objects FOR SELECT
USING (bucket_id = 'work-media');

CREATE POLICY "Authenticated CEO/Admin Upload Work Media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'work-media' AND
  (auth.jwt() ->> 'role' = 'authenticated')
);

CREATE POLICY "Authenticated CEO/Admin Delete Work Media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'work-media' AND
  (auth.jwt() ->> 'role' = 'authenticated')
);

-- 2. Dedicated Table for Work Projects (Alternative to site_content JSON)
CREATE TABLE IF NOT EXISTS public.work_projects (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  short_description VARCHAR(140) NOT NULL,
  card_image JSONB NOT NULL, -- { "src": "...", "alt": "..." }
  preview_url TEXT CHECK (preview_url IS NULL OR preview_url ~* '^https://'),
  published BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  case_study JSONB, -- { "summary": "...", "challenge": "...", "solution": "...", "results": "...", "gallery": [...] }
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_projects_slug ON public.work_projects(slug);
CREATE INDEX IF NOT EXISTS idx_work_projects_published_order ON public.work_projects(published, sort_order);

-- Row Level Security (RLS)
ALTER TABLE public.work_projects ENABLE ROW LEVEL SECURITY;

-- Anonymous public read for published projects
CREATE POLICY "Public read published work projects"
ON public.work_projects FOR SELECT
USING (published = true);

-- Authenticated admin management
CREATE POLICY "Admin manage work projects"
ON public.work_projects FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
