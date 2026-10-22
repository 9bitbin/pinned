-- ============================================================
-- Stuck on You: v2 upgrade
-- Adds: reactions, replies, "seen", pin to top, voice notes,
-- scheduled notes, countdowns, daily question, check-ins,
-- per-type notification muting.
--
-- Paste into Supabase > SQL Editor > New query > Run. Run it once.
-- (Safe to run again; it skips what already exists.)
-- ============================================================

-- ---------- Notes: new columns + kinds ----------
alter table public.notes add column if not exists pinned      boolean not null default false;
alter table public.notes add column if not exists seen_at     timestamptz;
alter table public.notes add column if not exists show_at     timestamptz;   -- scheduled notes
alter table public.notes add column if not exists notified_at timestamptz;   -- scheduled push sent
alter table public.notes add column if not exists meta        jsonb;         -- countdown target, voice length

alter table public.notes drop constraint if exists notes_kind_check;
alter table public.notes add constraint notes_kind_check
  check (kind in ('text','emoji','image','drawing','voice','countdown'));

create index if not exists notes_due_idx on public.notes (show_at) where show_at is not null and notified_at is null;

-- Scheduled notes stay hidden from the other person until their time
drop policy if exists "notes: members read" on public.notes;
create policy "notes: members read" on public.notes
  for select to authenticated
  using (public.is_member(board_id) and (show_at is null or show_at <= now() or author_id = auth.uid()));

-- ---------- Profiles: muted notification types ----------
alter table public.profiles add column if not exists muted text[] not null default '{}';

-- ---------- Reactions ----------
create table if not exists public.reactions (
  note_id    uuid not null references public.notes(id) on delete cascade,
  board_id   uuid not null references public.boards(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (note_id, user_id, emoji)
);
create index if not exists reactions_board_idx on public.reactions(board_id);
alter table public.reactions enable row level security;
drop policy if exists "reactions: members read" on public.reactions;
drop policy if exists "reactions: add own" on public.reactions;
drop policy if exists "reactions: remove own" on public.reactions;
create policy "reactions: members read" on public.reactions for select to authenticated using (public.is_member(board_id));
create policy "reactions: add own" on public.reactions for insert to authenticated with check (public.is_member(board_id) and user_id = auth.uid());
create policy "reactions: remove own" on public.reactions for delete to authenticated using (user_id = auth.uid());

-- ---------- Replies ----------
create table if not exists public.replies (
  id         uuid primary key default gen_random_uuid(),
  note_id    uuid not null references public.notes(id) on delete cascade,
  board_id   uuid not null references public.boards(id) on delete cascade,
  author_id  uuid references auth.users(id) on delete set null,
  body       text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);
create index if not exists replies_board_idx on public.replies(board_id);
alter table public.replies enable row level security;
drop policy if exists "replies: members read" on public.replies;
drop policy if exists "replies: add own" on public.replies;
drop policy if exists "replies: remove own" on public.replies;
create policy "replies: members read" on public.replies for select to authenticated using (public.is_member(board_id));
create policy "replies: add own" on public.replies for insert to authenticated with check (public.is_member(board_id) and author_id = auth.uid());
create policy "replies: remove own" on public.replies for delete to authenticated using (author_id = auth.uid());

-- ---------- Daily question answers ----------
create table if not exists public.answers (
  board_id   uuid not null references public.boards(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  qdate      date not null,
  body       text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now(),
  primary key (board_id, user_id, qdate)
);
alter table public.answers enable row level security;

-- You only see the other person's answer after you've answered too
create or replace function public.has_answered(b uuid, d date)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from answers where board_id = b and qdate = d and user_id = auth.uid());
$$;

create or replace function public.answer_status(b uuid, d date)
returns setof uuid language sql stable security definer set search_path = public as $$
  select user_id from answers where board_id = b and qdate = d and public.is_member(b);
$$;
revoke all on function public.answer_status(uuid, date) from public, anon;
grant execute on function public.answer_status(uuid, date) to authenticated;

drop policy if exists "answers: read" on public.answers;
drop policy if exists "answers: add own" on public.answers;
drop policy if exists "answers: edit own" on public.answers;
create policy "answers: read" on public.answers for select to authenticated
  using (user_id = auth.uid() or (public.is_member(board_id) and public.has_answered(board_id, qdate)));
create policy "answers: add own" on public.answers for insert to authenticated
  with check (public.is_member(board_id) and user_id = auth.uid());
create policy "answers: edit own" on public.answers for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Check-ins (thinking of you, moods) ----------
create table if not exists public.pings (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (char_length(kind) between 1 and 30),
  created_at timestamptz not null default now()
);
create index if not exists pings_board_idx on public.pings(board_id, created_at desc);
alter table public.pings enable row level security;
drop policy if exists "pings: members read" on public.pings;
drop policy if exists "pings: add own" on public.pings;
create policy "pings: members read" on public.pings for select to authenticated using (public.is_member(board_id));
create policy "pings: add own" on public.pings for insert to authenticated with check (public.is_member(board_id) and user_id = auth.uid());

-- ---------- Live updates for the new tables ----------
do $$
declare t text;
begin
  foreach t in array array['reactions','replies','answers','pings'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- ---------- Voice notes: allow audio uploads ----------
update storage.buckets
   set allowed_mime_types = array['image/jpeg','image/png','image/webp',
                                  'audio/mp4','audio/webm','audio/ogg','audio/mpeg','audio/aac','audio/x-m4a']
 where id = 'board-media';

-- ---------- Scheduled notes: check every minute and send the push ----------
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- private secret the timer uses to prove it's allowed to call the notify function
create table if not exists public.app_secrets (name text primary key, value text not null);
alter table public.app_secrets enable row level security;           -- no policies: app users can't read it
revoke all on public.app_secrets from anon, authenticated;
insert into public.app_secrets (name, value)
values ('cron', encode(extensions.gen_random_bytes(24), 'hex'))
on conflict (name) do nothing;

create or replace function public.fire_scheduled()
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if exists (select 1 from notes where show_at is not null and show_at <= now() and notified_at is null) then
    perform net.http_post(
      url     := 'https://skmmwiozlggchzrfsjsn.supabase.co/functions/v1/notify',
      body    := jsonb_build_object('cron', (select value from app_secrets where name = 'cron')),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  end if;
end $$;
revoke all on function public.fire_scheduled() from public, anon, authenticated;

select cron.schedule('soy-scheduled-notes', '* * * * *', 'select public.fire_scheduled()');
