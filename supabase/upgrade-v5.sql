-- ============================================================
-- Pinned: v5 upgrade (Phase 1.5: resize, rotate, flip, edit)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v2, v3 and v4 first.
-- ============================================================

-- ---------- Size and flip for notes (rotation already exists) ----------
alter table public.notes add column if not exists scale  real    not null default 1;
alter table public.notes add column if not exists flip_x boolean not null default false;
alter table public.notes add column if not exists flip_y boolean not null default false;
alter table public.notes drop constraint if exists notes_scale_check;
alter table public.notes add constraint notes_scale_check check (scale between 0.2 and 5);

-- ---------- Who can change what on a note ----------
-- Anyone on the board can still move notes, pin them and mark them seen.
-- Changing what a note says or looks like (text, color, photo, size, rotation, flip...)
-- is only for the person who made it, or the board owner.
create or replace function public.notes_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;   -- server jobs (scheduled notes)
  if (new.body       is distinct from old.body
   or new.color      is distinct from old.color
   or new.media_path is distinct from old.media_path
   or new.meta       is distinct from old.meta
   or new.kind       is distinct from old.kind
   or new.scale      is distinct from old.scale
   or new.rot        is distinct from old.rot
   or new.flip_x     is distinct from old.flip_x
   or new.flip_y     is distinct from old.flip_y
   or new.show_at    is distinct from old.show_at
   or new.author_id  is distinct from old.author_id
   or new.board_id   is distinct from old.board_id)
   and old.author_id is distinct from auth.uid()
   and not exists (select 1 from boards where id = old.board_id and created_by = auth.uid())
  then
    raise exception 'Only the person who made this, or the board owner, can change it';
  end if;
  if new.author_id is distinct from old.author_id or new.board_id is distinct from old.board_id then
    raise exception 'That can''t be changed';
  end if;
  return new;
end $$;

drop trigger if exists notes_guard on public.notes;
create trigger notes_guard before update on public.notes
  for each row execute function public.notes_guard();

-- ---------- Board lines: let their owner move, resize, rotate and flip them ----------
drop policy if exists "strokes: edit own" on public.strokes;
create policy "strokes: edit own" on public.strokes for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid() and public.is_member(board_id));
