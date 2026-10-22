-- ============================================================
-- Pinned: v17 upgrade (play together: online two-player games)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v7 (ttt_games) and v8 first.
-- ============================================================
create table if not exists public.duo_games (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards(id) on delete cascade,
  game       text not null check (game in ('connect4','dots','reaction','hangman')),
  a_id       uuid not null references auth.users(id) on delete cascade,   -- the one who challenged
  b_id       uuid not null references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  turn       uuid,                                                        -- whose move it is
  status     text not null default 'invited' check (status in ('invited','active','done','declined','cancelled')),
  winner     uuid,                                                        -- null with status done = draw
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (a_id <> b_id)
);
create index if not exists duo_board_idx on public.duo_games(board_id, updated_at desc);
-- only one open game of a kind between the same two people on a board
create unique index if not exists duo_one_open on public.duo_games
  (board_id, game, least(a_id, b_id), greatest(a_id, b_id)) where status in ('invited','active');
alter table public.duo_games enable row level security;

drop policy if exists "duo: members read" on public.duo_games;
drop policy if exists "duo: challenge" on public.duo_games;
create policy "duo: members read" on public.duo_games for select to authenticated using (public.is_member(board_id));
create policy "duo: challenge" on public.duo_games for insert to authenticated
  with check (a_id = auth.uid() and public.is_member(board_id) and public.is_board_member(board_id, b_id)
              and status = 'invited' and turn is null and winner is null and state = '{}'::jsonb);
-- no update policy: moves only go through the functions below

create or replace function public.duo_respond(p_game uuid, p_accept boolean)
returns public.duo_games language plpgsql security definer set search_path = public as $$
declare g duo_games;
begin
  select * into g from duo_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.b_id <> auth.uid() then raise exception 'Only the person challenged can answer'; end if;
  if g.status <> 'invited' then raise exception 'This challenge was already answered'; end if;
  update duo_games set status = case when p_accept then 'active' else 'declined' end,
         turn = case when p_accept then a_id else null end, updated_at = now()
   where id = p_game returning * into g;
  return g;
end $$;

-- p_next is who moves after this one; when p_done is true the game ends with p_winner (null = draw)
create or replace function public.duo_move(p_game uuid, p_state jsonb, p_next uuid, p_done boolean, p_winner uuid)
returns public.duo_games language plpgsql security definer set search_path = public as $$
declare g duo_games; old_b text; new_b text;
begin
  select * into g from duo_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.status <> 'active' then raise exception 'This game is not being played'; end if;
  if g.turn is distinct from auth.uid() then raise exception 'Not your turn yet'; end if;
  if g.game = 'connect4' then
    -- a Connect Four board is 42 cells; a move adds exactly one disc
    old_b := g.state->>'b'; new_b := p_state->>'b';
    if old_b is null or new_b is null or length(old_b) <> 42 or length(new_b) <> 42 then raise exception 'Bad board'; end if;
    if length(replace(new_b, '-', '')) <> length(replace(old_b, '-', '')) + 1 then raise exception 'One disc per turn'; end if;
  end if;
  if p_winner is not null and p_winner not in (g.a_id, g.b_id) then raise exception 'Bad winner'; end if;
  if p_done then
    update duo_games set state = p_state, status = 'done', turn = null, winner = p_winner, updated_at = now()
     where id = p_game returning * into g;
  else
    if p_next is null or p_next not in (g.a_id, g.b_id) or p_next = auth.uid() then raise exception 'Bad next player'; end if;
    update duo_games set state = p_state, turn = p_next, updated_at = now() where id = p_game returning * into g;
  end if;
  return g;
end $$;

-- leave: an unanswered challenge is cancelled, a game in progress counts as a loss
create or replace function public.duo_quit(p_game uuid)
returns public.duo_games language plpgsql security definer set search_path = public as $$
declare g duo_games;
begin
  select * into g from duo_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if auth.uid() not in (g.a_id, g.b_id) then raise exception 'Not your game'; end if;
  if g.status = 'invited' then
    update duo_games set status = 'cancelled', updated_at = now() where id = p_game returning * into g;
  elsif g.status = 'active' then
    update duo_games set status = 'done', turn = null,
           winner = case when auth.uid() = g.a_id then g.b_id else g.a_id end, updated_at = now()
     where id = p_game returning * into g;
  end if;
  return g;
end $$;

grant execute on function public.duo_respond(uuid, boolean) to authenticated;
grant execute on function public.duo_move(uuid, jsonb, uuid, boolean, uuid) to authenticated;
grant execute on function public.duo_quit(uuid) to authenticated;

-- live updates for both phones
do $$ begin
  alter publication supabase_realtime add table public.duo_games;
exception when duplicate_object then null;
end $$;
