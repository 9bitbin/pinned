-- ============================================================
-- Pinned: v9 upgrade (Polyglot speaking game)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v2–v8 first. (No new tables — just allows 'speak' scores.)
-- ============================================================
alter table public.game_scores drop constraint if exists game_scores_game_check;
alter table public.game_scores add constraint game_scores_game_check
  check (game in ('kestrel','pindrop','plane','hop','blocks','typerace','speak'));
