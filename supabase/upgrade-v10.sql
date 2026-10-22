-- ============================================================
-- Pinned: v10 upgrade (profile picture + bio)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v2+ first. No new tables.
-- ============================================================
alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles drop constraint if exists profiles_bio_len;
alter table public.profiles add constraint profiles_bio_len check (bio is null or char_length(bio) <= 300);

-- Avatars live in the existing board-media bucket under avatars/<user>-<ts>.jpg.
-- Members already read that bucket via signed URLs, so no storage policy change is needed.
