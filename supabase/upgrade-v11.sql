-- Pinned upgrade v11: fill and text tools on the drawing board.
-- Run this once in Supabase (SQL Editor). Safe to run twice.

alter table public.strokes add column if not exists kind text not null default 'ink';
alter table public.strokes drop constraint if exists strokes_kind_check;
alter table public.strokes add constraint strokes_kind_check check (kind in ('ink', 'fill', 'text'));

alter table public.strokes add column if not exists label text;
alter table public.strokes drop constraint if exists strokes_label_check;
alter table public.strokes add constraint strokes_label_check check (label is null or char_length(label) <= 200);
