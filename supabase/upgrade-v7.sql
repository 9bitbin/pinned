-- ============================================================
-- Pinned: v7 upgrade (Phase 3, Round 1: games)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v2–v6 first.
-- ============================================================

-- ---------- Scores: one row per finished round (solo or race) ----------
create table if not exists public.game_scores (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  game       text not null check (game in ('kestrel','pindrop','plane','hop')),
  score      integer not null check (score between 0 and 100000),
  mode       text not null default 'solo' check (mode in ('solo','race')),
  round_id   text check (round_id is null or char_length(round_id) <= 40),
  created_at timestamptz not null default now()
);
create index if not exists game_scores_board_idx on public.game_scores(board_id, game, created_at desc);
create index if not exists game_scores_best_idx on public.game_scores(board_id, game, user_id, score desc);
alter table public.game_scores enable row level security;

drop policy if exists "scores: members read" on public.game_scores;
drop policy if exists "scores: add own" on public.game_scores;
create policy "scores: members read" on public.game_scores for select to authenticated using (public.is_member(board_id));
create policy "scores: add own" on public.game_scores for insert to authenticated
  with check (user_id = auth.uid() and public.is_member(board_id));
-- no update or delete: a score is a score

-- everyone's best, and the last 10 rounds, for one game on one board
create or replace function public.game_board(p_board uuid, p_game text)
returns json language sql stable set search_path = public as $$
  select json_build_object(
    'best', coalesce((
      select json_agg(b order by b.best desc, b.best_at)
      from (
        select user_id, max(score) as best, count(*) as plays,
               (array_agg(created_at order by score desc, created_at))[1] as best_at
        from game_scores where board_id = p_board and game = p_game
        group by user_id
      ) b), '[]'::json),
    'recent', coalesce((
      select json_agg(r order by r.created_at desc)
      from (
        select id, user_id, score, mode, round_id, created_at
        from game_scores where board_id = p_board and game = p_game
        order by created_at desc limit 10
      ) r), '[]'::json)
  );
$$;
grant execute on function public.game_board(uuid, text) to authenticated;

-- ---------- Tic-tac-toe ----------
create table if not exists public.ttt_games (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards(id) on delete cascade,
  x_id       uuid not null references auth.users(id) on delete cascade,   -- the one who challenged
  o_id       uuid not null references auth.users(id) on delete cascade,
  cells      text not null default '---------' check (cells ~ '^[-XO]{9}$'),
  turn       text not null default 'X' check (turn in ('X','O')),
  status     text not null default 'invited' check (status in ('invited','active','done','declined','cancelled')),
  winner     text check (winner in ('X','O','draw')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (x_id <> o_id)
);
create index if not exists ttt_board_idx on public.ttt_games(board_id, updated_at desc);
-- only one open game between the same two people on a board
create unique index if not exists ttt_one_open on public.ttt_games
  (board_id, least(x_id, o_id), greatest(x_id, o_id)) where status in ('invited','active');
alter table public.ttt_games enable row level security;

drop policy if exists "ttt: members read" on public.ttt_games;
drop policy if exists "ttt: challenge" on public.ttt_games;
create policy "ttt: members read" on public.ttt_games for select to authenticated using (public.is_member(board_id));
create policy "ttt: challenge" on public.ttt_games for insert to authenticated
  with check (x_id = auth.uid() and public.is_member(board_id) and public.is_board_member(board_id, o_id)
              and cells = '---------' and turn = 'X' and status = 'invited' and winner is null);
-- no update policy: moves only go through the functions below, which check every rule

create or replace function public.ttt_winner(c text)
returns text language plpgsql immutable as $$
declare
  l int[] := array[1,2,3, 4,5,6, 7,8,9, 1,4,7, 2,5,8, 3,6,9, 1,5,9, 3,5,7];
  i int; a text;
begin
  for i in 0..7 loop
    a := substr(c, l[i*3+1], 1);
    if a <> '-' and a = substr(c, l[i*3+2], 1) and a = substr(c, l[i*3+3], 1) then return a; end if;
  end loop;
  if position('-' in c) = 0 then return 'draw'; end if;
  return null;
end $$;

create or replace function public.ttt_respond(p_game uuid, p_accept boolean)
returns public.ttt_games language plpgsql security definer set search_path = public as $$
declare g ttt_games;
begin
  select * into g from ttt_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.o_id <> auth.uid() then raise exception 'Only the person challenged can answer'; end if;
  if g.status <> 'invited' then raise exception 'This challenge was already answered'; end if;
  update ttt_games set status = case when p_accept then 'active' else 'declined' end, updated_at = now()
   where id = p_game returning * into g;
  return g;
end $$;

create or replace function public.ttt_move(p_game uuid, p_cell int)
returns public.ttt_games language plpgsql security definer set search_path = public as $$
declare g ttt_games; mark text; c text; w text;
begin
  if p_cell is null or p_cell < 0 or p_cell > 8 then raise exception 'Pick a square from 0 to 8'; end if;
  select * into g from ttt_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.status <> 'active' then raise exception 'This game is not being played'; end if;
  mark := case when auth.uid() = g.x_id then 'X' when auth.uid() = g.o_id then 'O' else null end;
  if mark is null then raise exception 'You are watching this game, not playing'; end if;
  if g.turn <> mark then raise exception 'Not your turn yet'; end if;
  if substr(g.cells, p_cell + 1, 1) <> '-' then raise exception 'That square is taken'; end if;
  c := overlay(g.cells placing mark from p_cell + 1 for 1);
  w := public.ttt_winner(c);
  update ttt_games set cells = c,
         turn = case when mark = 'X' then 'O' else 'X' end,
         status = case when w is null then 'active' else 'done' end,
         winner = w, updated_at = now()
   where id = p_game returning * into g;
  return g;
end $$;

-- leave a game: an unanswered challenge is cancelled, a game in progress counts as a loss
create or replace function public.ttt_quit(p_game uuid)
returns public.ttt_games language plpgsql security definer set search_path = public as $$
declare g ttt_games;
begin
  select * into g from ttt_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if auth.uid() not in (g.x_id, g.o_id) then raise exception 'Not your game'; end if;
  if g.status = 'invited' then
    update ttt_games set status = 'cancelled', updated_at = now() where id = p_game returning * into g;
  elsif g.status = 'active' then
    update ttt_games set status = 'done', winner = case when auth.uid() = g.x_id then 'O' else 'X' end, updated_at = now()
     where id = p_game returning * into g;
  end if;
  return g;
end $$;

grant execute on function public.ttt_respond(uuid, boolean) to authenticated;
grant execute on function public.ttt_move(uuid, int) to authenticated;
grant execute on function public.ttt_quit(uuid) to authenticated;

-- ---------- Live updates ----------
do $$
declare t text;
begin
  foreach t in array array['game_scores','ttt_games'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
