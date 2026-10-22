-- ============================================================
-- Pinned: v15 upgrade (scores for the new games)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v14 first.
-- ============================================================
-- Allow scores for the new games.
alter table public.game_scores drop constraint if exists game_scores_game_check;
alter table public.game_scores add constraint game_scores_game_check
  check (game in ('kestrel','pindrop','plane','hop','blocks','typerace','speak','flappy',
                  'connect4','dots','reaction','hangman','stack'));
