-- ============================================================
-- Pinned: remove the @ pings feature (run once, optional)
-- Paste into Supabase > SQL Editor > New query > Run.
-- Drops the small table that counted pings. Safe to run even if it's already gone.
-- ============================================================
drop table if exists public.mention_log;
