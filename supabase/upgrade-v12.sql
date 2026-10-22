-- Pinned upgrade v12: fix profile picture uploads.
-- The board photo rules read the first folder name as a board id, so "avatars/..." failed with
-- 'invalid input syntax for type uuid: "avatars"'. These versions only check board membership
-- when the folder really is a board id, and add rules for profile pictures.
-- Run once in Supabase (SQL Editor). Safe to run twice.

drop policy if exists "media: members read" on storage.objects;
drop policy if exists "media: members upload" on storage.objects;
drop policy if exists "media: members delete" on storage.objects;
drop policy if exists "media: avatar read" on storage.objects;
drop policy if exists "media: avatar upload" on storage.objects;
drop policy if exists "media: avatar update" on storage.objects;

create policy "media: members read" on storage.objects
  for select to authenticated
  using (bucket_id = 'board-media' and case when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then public.is_member(((storage.foldername(name))[1])::uuid) else false end);
create policy "media: members upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'board-media' and case when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then public.is_member(((storage.foldername(name))[1])::uuid) else false end);
create policy "media: members delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'board-media' and case when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then public.is_member(((storage.foldername(name))[1])::uuid) else false end);

-- profile pictures: anyone signed in can see them (they are shown to board members),
-- and you can only add or replace your own, named avatars/<your user id>-<time>.jpg
create policy "media: avatar read" on storage.objects
  for select to authenticated
  using (bucket_id = 'board-media' and (storage.foldername(name))[1] = 'avatars');
create policy "media: avatar upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'board-media' and name like 'avatars/' || auth.uid()::text || '-%');
create policy "media: avatar update" on storage.objects
  for update to authenticated
  using (bucket_id = 'board-media' and name like 'avatars/' || auth.uid()::text || '-%');
