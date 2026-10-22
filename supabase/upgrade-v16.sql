-- ============================================================
-- Pinned: v16 upgrade (shared to-do and wish lists)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v6 first.
-- ============================================================
-- 1. Allow the new "list" note kind.
alter table public.notes drop constraint if exists notes_kind_check;
alter table public.notes add constraint notes_kind_check
  check (kind in ('text','emoji','image','drawing','voice','countdown','link','list'));

-- 2. Either of you can tick items and add them. Only the list's items can change this way;
--    the title, colour, position and everything else still belong to the author or board owner.
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
   and not (
     old.kind = 'list'
     and public.is_member(old.board_id)
     and new.body       is not distinct from old.body
     and new.color      is not distinct from old.color
     and new.media_path is not distinct from old.media_path
     and new.kind       is not distinct from old.kind
     and new.scale      is not distinct from old.scale
     and new.rot        is not distinct from old.rot
     and new.flip_x     is not distinct from old.flip_x
     and new.flip_y     is not distinct from old.flip_y
     and new.show_at    is not distinct from old.show_at
   )
  then
    raise exception 'Only the person who made this, or the board owner, can change it';
  end if;
  if new.author_id is distinct from old.author_id or new.board_id is distinct from old.board_id then
    raise exception 'That can''t be changed';
  end if;
  return new;
end $$;
