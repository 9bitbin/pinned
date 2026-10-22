-- ============================================================
-- Stuck on You: v3 upgrade (switch, leave and delete boards)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- ============================================================

-- Delete a board and everything on it (notes, replies, reactions, answers, check-ins).
-- Allowed for the person who made it, or for whoever is the only one left on it.
create or replace function public.delete_board(b uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'Not signed in'; end if;
  if not exists (
    select 1 from boards x
     where x.id = b
       and (x.created_by = me
            or (exists (select 1 from board_members where board_id = b and user_id = me)
                and (select count(*) from board_members where board_id = b) = 1))
  ) then
    raise exception 'Only the person who made this board can delete it. You can leave it instead.';
  end if;
  delete from boards where id = b;
end $$;

revoke all on function public.delete_board(uuid) from public, anon;
grant execute on function public.delete_board(uuid) to authenticated;

-- Only the board's creator can remove the other person; anyone can remove themselves (leave).
drop policy if exists "members: members remove" on public.board_members;
create policy "members: members remove" on public.board_members
  for delete to authenticated
  using (user_id = auth.uid()
         or exists (select 1 from public.boards x where x.id = board_id and x.created_by = auth.uid()));
