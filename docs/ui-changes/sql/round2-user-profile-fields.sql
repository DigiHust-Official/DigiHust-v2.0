-- Round 2 / Task 5: profile short info + portfolio link
-- NOT applied by the agent. Hand to the manager to run in Supabase before merging.
-- Until applied, dbService.upsertUser retries saves without these columns (console warning).

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS short_info text,
  ADD COLUMN IF NOT EXISTS portfolio_url text;
