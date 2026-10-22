-- ============================================================
-- Pinned: v8 upgrade (Phase 3, Round 2: Block Drop, Type Race, Crazy 8s)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v2–v7 first.
-- ============================================================

-- ---------- Block Drop + Type Race scores ----------
-- extend the allowed game list on the existing scores table
alter table public.game_scores drop constraint if exists game_scores_game_check;
alter table public.game_scores add constraint game_scores_game_check
  check (game in ('kestrel','pindrop','plane','hop','blocks','typerace'));

-- ============================================================
--  Crazy 8s  (2 players; cards dealt server-side so no peeking)
-- ============================================================

-- Public, realtime-safe state. Hands live in crazy8_secret (never published).
create table if not exists public.crazy8_games (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards(id) on delete cascade,
  x_id       uuid not null references auth.users(id) on delete cascade,   -- challenger
  o_id       uuid not null references auth.users(id) on delete cascade,
  status     text not null default 'invited' check (status in ('invited','active','done','declined','cancelled')),
  turn       text not null default 'x' check (turn in ('x','o')),
  top_card   text,                     -- e.g. '7H' ('T'=10)
  suit       text check (suit in ('H','D','C','S')),
  x_count    int not null default 0,
  o_count    int not null default 0,
  draw_count int not null default 0,
  winner     text check (winner in ('x','o')),
  last_note  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (x_id <> o_id)
);
create index if not exists c8_board_idx on public.crazy8_games(board_id, updated_at desc);
create unique index if not exists c8_one_open on public.crazy8_games
  (board_id, least(x_id, o_id), greatest(x_id, o_id)) where status in ('invited','active');
alter table public.crazy8_games enable row level security;

drop policy if exists "c8: members read" on public.crazy8_games;
drop policy if exists "c8: challenge" on public.crazy8_games;
create policy "c8: members read" on public.crazy8_games for select to authenticated using (public.is_member(board_id));
create policy "c8: challenge" on public.crazy8_games for insert to authenticated
  with check (x_id = auth.uid() and public.is_member(board_id) and public.is_board_member(board_id, o_id)
              and status = 'invited' and winner is null);
-- no update/delete policy: all moves go through the SECURITY DEFINER functions below

-- Hidden state. RLS on with NO policies => no direct access; only the definer functions (table owner) touch it.
create table if not exists public.crazy8_secret (
  game_id uuid primary key references public.crazy8_games(id) on delete cascade,
  deck    text[] not null default '{}',
  hand_x  text[] not null default '{}',
  hand_o  text[] not null default '{}',
  discard text[] not null default '{}'
);
alter table public.crazy8_secret enable row level security;

-- ---- helpers ----
create or replace function public.c8_playable(card text, top text, suit text)
returns boolean language sql immutable as $$
  select card is not null and (right(card,1) = suit or left(card,1) = left(top,1) or left(card,1) = '8');
$$;

create or replace function public.c8_has_play(hand text[], top text, suit text)
returns boolean language sql immutable as $$
  select exists (select 1 from unnest(hand) c where public.c8_playable(c, top, suit));
$$;

-- the caller's own view of a game (hand + public bits); never reveals the opponent's hand
create or replace function public.crazy8_view(p_game uuid)
returns json language plpgsql security definer set search_path = public as $$
declare g crazy8_games; sec crazy8_secret; mark text; myhand text[];
begin
  select * into g from crazy8_games where id = p_game;
  if not found then raise exception 'Game not found'; end if;
  if auth.uid() not in (g.x_id, g.o_id) and not is_member(g.board_id) then raise exception 'Not allowed'; end if;
  mark := case when auth.uid() = g.x_id then 'x' when auth.uid() = g.o_id then 'o' else null end;
  select * into sec from crazy8_secret where game_id = p_game;
  myhand := case when mark = 'x' then sec.hand_x when mark = 'o' then sec.hand_o else '{}' end;
  return json_build_object(
    'id', g.id, 'status', g.status, 'mark', mark,
    'your_turn', (mark is not null and g.turn = mark and g.status = 'active'),
    'turn', g.turn, 'top', g.top_card, 'suit', g.suit,
    'your_count', case when mark = 'x' then g.x_count when mark = 'o' then g.o_count else null end,
    'opp_count', case when mark = 'x' then g.o_count when mark = 'o' then g.x_count else null end,
    'x_count', g.x_count, 'o_count', g.o_count,
    'draw_count', g.draw_count, 'winner', g.winner, 'last_note', g.last_note,
    'can_pass', (mark is not null and g.turn = mark and g.status = 'active'
                 and not public.c8_has_play(myhand, g.top_card, g.suit) and g.draw_count = 0),
    'hand', coalesce((select json_agg(c order by right(c,1), left(c,1)) from unnest(myhand) c), '[]'::json)
  );
end $$;

-- accept or decline a challenge; accepting shuffles and deals
create or replace function public.crazy8_respond(p_game uuid, p_accept boolean)
returns json language plpgsql security definer set search_path = public as $$
declare g crazy8_games; deck text[]; rest text[]; top text; i int; starter_i int := 0;
begin
  select * into g from crazy8_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.o_id <> auth.uid() then raise exception 'Only the person challenged can answer'; end if;
  if g.status <> 'invited' then raise exception 'This challenge was already answered'; end if;
  if not p_accept then
    update crazy8_games set status = 'declined', updated_at = now() where id = p_game;
    return crazy8_view(p_game);
  end if;
  -- shuffled 52-card deck
  select array_agg((r || s) order by random()) into deck
  from unnest(array['A','2','3','4','5','6','7','8','9','T','J','Q','K']) r,
       unnest(array['H','D','C','S']) s;
  rest := deck[15:52];                              -- after dealing 7 + 7
  -- first non-8 becomes the starting discard
  for i in 1 .. array_length(rest,1) loop
    if left(rest[i],1) <> '8' then starter_i := i; exit; end if;
  end loop;
  if starter_i = 0 then starter_i := 1; end if;     -- absurd fallback
  top := rest[starter_i];
  rest := rest[1:starter_i-1] || rest[starter_i+1:array_length(rest,1)];
  insert into crazy8_secret(game_id, deck, hand_x, hand_o, discard)
    values (p_game, rest, deck[1:7], deck[8:14], array[top])
    on conflict (game_id) do update set deck = excluded.deck, hand_x = excluded.hand_x, hand_o = excluded.hand_o, discard = excluded.discard;
  update crazy8_games set status = 'active', turn = 'x', top_card = top, suit = right(top,1),
         x_count = 7, o_count = 7, draw_count = array_length(rest,1), last_note = null, updated_at = now()
   where id = p_game;
  return crazy8_view(p_game);
end $$;

-- play a card; p_suit required only when the card is an 8
create or replace function public.crazy8_play(p_game uuid, p_card text, p_suit text default null)
returns json language plpgsql security definer set search_path = public as $$
declare g crazy8_games; sec crazy8_secret; mark text; myhand text[]; newsuit text; pos int; nm text;
begin
  select * into g from crazy8_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.status <> 'active' then raise exception 'This game is not being played'; end if;
  mark := case when auth.uid() = g.x_id then 'x' when auth.uid() = g.o_id then 'o' else null end;
  if mark is null then raise exception 'You are watching this game, not playing'; end if;
  if g.turn <> mark then raise exception 'Not your turn yet'; end if;
  select * into sec from crazy8_secret where game_id = p_game for update;
  myhand := case when mark = 'x' then sec.hand_x else sec.hand_o end;
  pos := array_position(myhand, p_card);
  if pos is null then raise exception 'That card is not in your hand'; end if;
  if not public.c8_playable(p_card, g.top_card, g.suit) then raise exception 'That card does not match'; end if;
  if left(p_card,1) = '8' then
    if p_suit is null or p_suit not in ('H','D','C','S') then raise exception 'Pick a suit for your 8'; end if;
    newsuit := p_suit;
  else newsuit := right(p_card,1); end if;
  myhand := myhand[1:pos-1] || myhand[pos+1:array_length(myhand,1)];
  nm := (select name from profiles where id = auth.uid());
  update crazy8_secret set
    hand_x = case when mark = 'x' then myhand else sec.hand_x end,
    hand_o = case when mark = 'o' then myhand else sec.hand_o end,
    discard = array[p_card] || sec.discard
   where game_id = p_game;
  if coalesce(array_length(myhand,1),0) = 0 then
    update crazy8_games set status = 'done', winner = mark, top_card = p_card, suit = newsuit,
           x_count = case when mark='x' then 0 else x_count end, o_count = case when mark='o' then 0 else o_count end,
           last_note = coalesce(nm,'They') || ' played ' || p_card || ' and went out', updated_at = now()
     where id = p_game;
  else
    update crazy8_games set top_card = p_card, suit = newsuit, turn = case when mark='x' then 'o' else 'x' end,
           x_count = case when mark='x' then coalesce(array_length(myhand,1),0) else x_count end,
           o_count = case when mark='o' then coalesce(array_length(myhand,1),0) else o_count end,
           last_note = coalesce(nm,'They') || ' played ' || p_card || (case when left(p_card,1)='8' then ' → '||newsuit else '' end), updated_at = now()
     where id = p_game;
  end if;
  return crazy8_view(p_game);
end $$;

-- draw one card; keeps your turn if it's playable, otherwise passes. Also passes when nothing can be drawn.
create or replace function public.crazy8_draw(p_game uuid)
returns json language plpgsql security definer set search_path = public as $$
declare g crazy8_games; sec crazy8_secret; mark text; v_hand text[]; v_deck text[]; v_disc text[]; v_card text; v_keep boolean;
begin
  select * into g from crazy8_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if g.status <> 'active' then raise exception 'This game is not being played'; end if;
  mark := case when auth.uid() = g.x_id then 'x' when auth.uid() = g.o_id then 'o' else null end;
  if mark is null then raise exception 'You are watching this game, not playing'; end if;
  if g.turn <> mark then raise exception 'Not your turn yet'; end if;
  select * into sec from crazy8_secret where game_id = p_game for update;
  v_deck := sec.deck; v_disc := sec.discard;
  v_hand := case when mark = 'x' then sec.hand_x else sec.hand_o end;
  -- reshuffle the discard (keep the top) back into the deck when empty
  if coalesce(array_length(v_deck,1),0) = 0 and coalesce(array_length(v_disc,1),0) > 1 then
    select array_agg(c order by random()) into v_deck from unnest(v_disc[2:array_length(v_disc,1)]) c;
    v_disc := array[v_disc[1]];
  end if;
  if coalesce(array_length(v_deck,1),0) = 0 then
    -- nothing to draw: pass the turn
    update crazy8_games set turn = case when mark='x' then 'o' else 'x' end,
           draw_count = 0, last_note = 'No cards to draw — passed', updated_at = now() where id = p_game;
    return crazy8_view(p_game);
  end if;
  v_card := v_deck[1]; v_deck := v_deck[2:array_length(v_deck,1)];
  v_hand := v_hand || v_card;
  v_keep := public.c8_playable(v_card, g.top_card, g.suit);
  update crazy8_secret set deck = v_deck, discard = v_disc,
    hand_x = case when mark='x' then v_hand else sec.hand_x end,
    hand_o = case when mark='o' then v_hand else sec.hand_o end
   where game_id = p_game;
  update crazy8_games set
    x_count = case when mark='x' then coalesce(array_length(v_hand,1),0) else x_count end,
    o_count = case when mark='o' then coalesce(array_length(v_hand,1),0) else o_count end,
    draw_count = coalesce(array_length(v_deck,1),0),
    turn = case when v_keep then g.turn else (case when mark='x' then 'o' else 'x' end) end,
    last_note = case when v_keep then 'Drew a card' else 'Drew a card — passed' end, updated_at = now()
   where id = p_game;
  return crazy8_view(p_game);
end $$;

create or replace function public.crazy8_quit(p_game uuid)
returns json language plpgsql security definer set search_path = public as $$
declare g crazy8_games;
begin
  select * into g from crazy8_games where id = p_game for update;
  if not found then raise exception 'Game not found'; end if;
  if auth.uid() not in (g.x_id, g.o_id) then raise exception 'Not your game'; end if;
  if g.status = 'invited' then
    update crazy8_games set status = 'cancelled', updated_at = now() where id = p_game;
  elsif g.status = 'active' then
    update crazy8_games set status = 'done', winner = case when auth.uid() = g.x_id then 'o' else 'x' end,
           last_note = 'Resigned', updated_at = now() where id = p_game;
  end if;
  return crazy8_view(p_game);
end $$;

grant execute on function public.crazy8_view(uuid)          to authenticated;
grant execute on function public.crazy8_respond(uuid, boolean) to authenticated;
grant execute on function public.crazy8_play(uuid, text, text) to authenticated;
grant execute on function public.crazy8_draw(uuid)          to authenticated;
grant execute on function public.crazy8_quit(uuid)          to authenticated;

-- ---------- Live updates ----------
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.crazy8_games';
  exception when duplicate_object then null; end;
end $$;
