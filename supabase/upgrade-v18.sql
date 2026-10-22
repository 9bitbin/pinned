-- ============================================================
-- Pinned: v18 upgrade (play together for Dots and Boxes, Reaction Duel and Hangman)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v17 first.
-- ============================================================

-- 1. Every game now starts with a board when it's accepted (v17 left Connect Four without one)
create or replace function public.duo_respond(p_game uuid, p_accept boolean)
returns public.duo_games language plpgsql security definer set search_path = public as $$
declare g duo_games;
begin
  select * into g from duo_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.b_id <> auth.uid() then raise exception 'Only the person challenged can answer'; end if;
  if g.status <> 'invited' then raise exception 'This challenge was already answered'; end if;
  update duo_games set
    status = case when p_accept then 'active' else 'declined' end,
    turn = case when p_accept then a_id else null end,
    state = case
      when not p_accept then state
      when game = 'connect4' then jsonb_build_object('b', repeat('-', 42))
      when game = 'dots' then jsonb_build_object('h', repeat('-', 12), 'v', repeat('-', 12), 'o', repeat('-', 9))
      when game = 'reaction' then jsonb_build_object('round', 0)
      else '{}'::jsonb end,
    updated_at = now()
  where id = p_game returning * into g;
  return g;
end $$;

-- 2. Moves: Connect Four and Dots and Boxes. In Dots a completed box keeps the turn, so the next player can be you.
create or replace function public.duo_move(p_game uuid, p_state jsonb, p_next uuid, p_done boolean, p_winner uuid)
returns public.duo_games language plpgsql security definer set search_path = public as $$
declare g duo_games; old_s text; new_s text; old_o text; new_o text; letter text;
begin
  select * into g from duo_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.status <> 'active' then raise exception 'This game is not being played'; end if;
  if g.turn is distinct from auth.uid() then raise exception 'Not your turn yet'; end if;
  if g.game = 'connect4' then
    old_s := g.state->>'b'; new_s := p_state->>'b';
    if old_s is null or new_s is null or length(old_s) <> 42 or length(new_s) <> 42 then raise exception 'Bad board'; end if;
    if length(replace(new_s, '-', '')) <> length(replace(old_s, '-', '')) + 1 then raise exception 'One disc per turn'; end if;
  elsif g.game = 'dots' then
    if length(coalesce(p_state->>'h', '')) <> 12 or length(coalesce(p_state->>'v', '')) <> 12 or length(coalesce(p_state->>'o', '')) <> 9 then
      raise exception 'Bad board';
    end if;
    old_s := coalesce(g.state->>'h', '') || coalesce(g.state->>'v', '');
    new_s := (p_state->>'h') || (p_state->>'v');
    if length(replace(new_s, '-', '')) - length(replace(old_s, '-', '')) <> 1 then raise exception 'One line per turn'; end if;
    letter := case when auth.uid() = g.a_id then 'a' else 'b' end;
    old_o := coalesce(g.state->>'o', repeat('-', 9)); new_o := p_state->>'o';
    if replace(new_o, letter, '') <> replace(old_o, letter, '') then raise exception 'Only your own boxes'; end if;
    if length(replace(new_o, '-', '')) - length(replace(old_o, '-', '')) > 2 then raise exception 'Too many boxes'; end if;
    if p_done and position('-' in new_o) > 0 then raise exception 'The board is not full yet'; end if;
  else
    raise exception 'This game does not use moves';
  end if;
  if p_winner is not null and p_winner not in (g.a_id, g.b_id) then raise exception 'Bad winner'; end if;
  if p_done then
    update duo_games set state = p_state, status = 'done', turn = null, winner = p_winner, updated_at = now()
     where id = p_game returning * into g;
  else
    if p_next is null or p_next not in (g.a_id, g.b_id) then raise exception 'Bad next player'; end if;
    if g.game = 'connect4' and p_next = auth.uid() then raise exception 'Bad next player'; end if;
    update duo_games set state = p_state, turn = p_next, updated_at = now() where id = p_game returning * into g;
  end if;
  return g;
end $$;

-- 3. Reaction Duel: the host starts each round ('round' and 'go1', 'go2'...),
--    each player writes their own time ('r<round>_<their id>', in ms, 99999 = too early)
create or replace function public.duo_set(p_game uuid, p_key text, p_val jsonb)
returns public.duo_games language plpgsql security definer set search_path = public as $$
declare g duo_games; r text;
begin
  select * into g from duo_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.game <> 'reaction' then raise exception 'Not a reaction game'; end if;
  if g.status <> 'active' then raise exception 'This game is not being played'; end if;
  if auth.uid() not in (g.a_id, g.b_id) then raise exception 'Not your game'; end if;
  r := coalesce(g.state->>'round', '0');
  if p_key = 'round' or p_key ~ '^go[0-9]+$' then
    if auth.uid() <> g.a_id then raise exception 'Only the host starts rounds'; end if;
  elsif p_key = 'r' || r || '_' || auth.uid()::text then
    if g.state->>p_key is not null then raise exception 'Already tapped'; end if;
    if p_val is null or jsonb_typeof(p_val) <> 'number' then raise exception 'Bad time'; end if;
  else
    raise exception 'Not allowed';
  end if;
  update duo_games set state = jsonb_set(state, array[p_key], p_val, true), updated_at = now()
   where id = p_game returning * into g;
  return g;
end $$;

-- 4. Any player can end a game with a winner (null = draw). Used by Reaction Duel once the rounds are done.
create or replace function public.duo_finish(p_game uuid, p_winner uuid)
returns public.duo_games language plpgsql security definer set search_path = public as $$
declare g duo_games;
begin
  select * into g from duo_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if auth.uid() not in (g.a_id, g.b_id) then raise exception 'Not your game'; end if;
  if g.status <> 'active' then raise exception 'This game is not being played'; end if;
  if p_winner is not null and p_winner not in (g.a_id, g.b_id) then raise exception 'Bad winner'; end if;
  update duo_games set status = 'done', turn = null, winner = p_winner, updated_at = now()
   where id = p_game returning * into g;
  return g;
end $$;

-- 5. Hangman: the picker's word is kept in a table nobody can read directly.
--    Only the functions below look at it, and they only reveal the letters that have been guessed.
create table if not exists public.duo_secrets (
  game_id uuid primary key references public.duo_games(id) on delete cascade,
  word    text not null check (word ~ '^[A-Z]{3,12}$')
);
alter table public.duo_secrets enable row level security;   -- no policies on purpose

create or replace function public.duo_hangman_word(p_game uuid, p_word text)
returns public.duo_games language plpgsql security definer set search_path = public as $$
declare g duo_games; w text;
begin
  select * into g from duo_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.game <> 'hangman' then raise exception 'Not a hangman game'; end if;
  if g.status <> 'active' then raise exception 'This game is not being played'; end if;
  if g.turn is distinct from auth.uid() or auth.uid() <> g.a_id then raise exception 'Only the person picking the word can do this'; end if;
  w := upper(coalesce(p_word, ''));
  if w !~ '^[A-Z]{3,12}$' then raise exception 'Use 3 to 12 letters, no spaces'; end if;
  insert into duo_secrets (game_id, word) values (p_game, w);
  update duo_games set state = jsonb_build_object('mask', repeat('_', length(w)), 'guessed', '', 'wrong', 0),
         turn = b_id, updated_at = now()
   where id = p_game returning * into g;
  return g;
end $$;

create or replace function public.duo_hangman_guess(p_game uuid, p_letter text)
returns public.duo_games language plpgsql security definer set search_path = public as $$
declare g duo_games; w text; L text; guessed text; wrong int; solved boolean; mask text;
begin
  select * into g from duo_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.game <> 'hangman' then raise exception 'Not a hangman game'; end if;
  if g.status <> 'active' then raise exception 'This game is not being played'; end if;
  if g.turn is distinct from auth.uid() or auth.uid() <> g.b_id then raise exception 'Not your turn yet'; end if;
  select word into w from duo_secrets where game_id = p_game;
  if w is null then raise exception 'The word is not picked yet'; end if;
  L := upper(left(coalesce(p_letter, ''), 1));
  if L !~ '^[A-Z]$' then raise exception 'Pick a letter'; end if;
  guessed := coalesce(g.state->>'guessed', '');
  if position(L in guessed) > 0 then raise exception 'Already guessed'; end if;
  guessed := guessed || L;
  wrong := coalesce((g.state->>'wrong')::int, 0) + (case when position(L in w) > 0 then 0 else 1 end);
  select string_agg(case when position(c in guessed) > 0 then c else '_' end, '' order by i)
    into mask from regexp_split_to_table(w, '') with ordinality as t(c, i);
  solved := position('_' in mask) = 0;
  if solved or wrong >= 6 then
    update duo_games set state = jsonb_build_object('mask', mask, 'guessed', guessed, 'wrong', wrong, 'word', w),
           status = 'done', turn = null, winner = case when solved then b_id else a_id end, updated_at = now()
     where id = p_game returning * into g;
  else
    update duo_games set state = jsonb_build_object('mask', mask, 'guessed', guessed, 'wrong', wrong),
           turn = b_id, updated_at = now()
     where id = p_game returning * into g;
  end if;
  return g;
end $$;

grant execute on function public.duo_set(uuid, text, jsonb) to authenticated;
grant execute on function public.duo_finish(uuid, uuid) to authenticated;
grant execute on function public.duo_hangman_word(uuid, text) to authenticated;
grant execute on function public.duo_hangman_guess(uuid, text) to authenticated;
