-- ============================================================
-- Pinned: v4 upgrade (Phase 1: endless board)
-- Adds: up to 10 people per board, drawing directly on the board,
-- "last seen" for the people panel.
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v2 and v3 to have been run first.
-- ============================================================

-- ---------- Up to 10 people per board ----------
create or replace function public.join_board(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare
  clean text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  b record;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select id, code, created_by into b from boards where code = clean;
  if b.id is null then raise exception 'No board with that code'; end if;
  if exists (select 1 from board_members where board_id = b.id and user_id = auth.uid()) then
    return json_build_object('id', b.id, 'code', b.code, 'created_by', b.created_by);
  end if;
  if (select count(*) from board_members where board_id = b.id) >= 10 then
    raise exception 'That board is full (10 people max)';
  end if;
  insert into board_members (board_id, user_id) values (b.id, auth.uid());
  return json_build_object('id', b.id, 'code', b.code, 'created_by', b.created_by);
end $$;
revoke all on function public.join_board(text) from public, anon;
grant execute on function public.join_board(text) to authenticated;

-- ---------- Last seen ----------
alter table public.board_members add column if not exists last_seen timestamptz;

create or replace function public.touch_seen(b uuid)
returns void language sql security definer set search_path = public as $$
  update board_members set last_seen = now() where board_id = b and user_id = auth.uid();
$$;
revoke all on function public.touch_seen(uuid) from public, anon;
grant execute on function public.touch_seen(uuid) to authenticated;

-- ---------- Drawing on the board (vector lines) ----------
create table if not exists public.strokes (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards(id) on delete cascade,
  author_id  uuid references auth.users(id) on delete set null,
  color      text not null check (char_length(color) <= 20),
  width      real not null check (width > 0 and width <= 400),
  points     jsonb not null check (jsonb_typeof(points) = 'array' and jsonb_array_length(points) between 1 and 3000),
  created_at timestamptz not null default now()
);
create index if not exists strokes_board_idx on public.strokes(board_id, created_at);
alter table public.strokes enable row level security;
drop policy if exists "strokes: members read" on public.strokes;
drop policy if exists "strokes: add own" on public.strokes;
drop policy if exists "strokes: remove own" on public.strokes;
create policy "strokes: members read" on public.strokes for select to authenticated using (public.is_member(board_id));
create policy "strokes: add own" on public.strokes for insert to authenticated with check (public.is_member(board_id) and author_id = auth.uid());
create policy "strokes: remove own" on public.strokes for delete to authenticated using (author_id = auth.uid());

do $$
begin
  alter publication supabase_realtime add table public.strokes;
exception when duplicate_object then null;
end $$;
