-- ============================================================
-- Stuck on You: database setup
-- Paste this whole file into Supabase > SQL Editor > New query, then Run.
-- Safe to run once on a fresh project.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- Tables ----------

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 30),
  color       text not null default 'c1',
  created_at  timestamptz not null default now()
);

create table if not exists public.boards (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.board_members (
  board_id   uuid not null references public.boards(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (board_id, user_id)
);

create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references public.boards(id) on delete cascade,
  author_id   uuid references auth.users(id) on delete set null,
  kind        text not null check (kind in ('text','emoji','image','drawing')),
  body        text check (body is null or char_length(body) <= 500),
  media_path  text,
  color       text not null default 'c1',
  x           real not null default 100,
  y           real not null default 100,
  rot         real not null default 0,
  z           bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists notes_board_idx on public.notes(board_id);

create table if not exists public.push_subs (
  endpoint    text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

-- ---------- Helper functions ----------

create or replace function public.is_member(b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from board_members where board_id = b and user_id = auth.uid());
$$;

create or replace function public.shares_board(u uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from board_members a
    join board_members b on a.board_id = b.board_id
    where a.user_id = auth.uid() and b.user_id = u
  );
$$;

-- Create a board and return its pairing code
create or replace function public.create_board()
returns json language plpgsql security definer set search_path = public, extensions as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- 32 chars, no 0/O/1/I
  new_code text;
  new_id   uuid;
  i int;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  loop
    new_code := '';
    for i in 1..8 loop
      new_code := new_code || substr(alphabet, 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1);
    end loop;
    exit when not exists (select 1 from boards where code = new_code);
  end loop;
  insert into boards (code, created_by) values (new_code, auth.uid()) returning id into new_id;
  insert into board_members (board_id, user_id) values (new_id, auth.uid());
  return json_build_object('id', new_id, 'code', new_code);
end $$;

-- Join a board with a pairing code (max 2 people per board)
create or replace function public.join_board(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare
  clean text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  b record;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select id, code into b from boards where code = clean;
  if b.id is null then raise exception 'No board with that code'; end if;
  if exists (select 1 from board_members where board_id = b.id and user_id = auth.uid()) then
    return json_build_object('id', b.id, 'code', b.code);
  end if;
  if (select count(*) from board_members where board_id = b.id) >= 2 then
    raise exception 'That board already has two people';
  end if;
  insert into board_members (board_id, user_id) values (b.id, auth.uid());
  return json_build_object('id', b.id, 'code', b.code);
end $$;

revoke all on function public.create_board() from public, anon;
revoke all on function public.join_board(text) from public, anon;
grant execute on function public.create_board() to authenticated;
grant execute on function public.join_board(text) to authenticated;

-- ---------- Row-level security ----------

alter table public.profiles      enable row level security;
alter table public.boards        enable row level security;
alter table public.board_members enable row level security;
alter table public.notes         enable row level security;
alter table public.push_subs     enable row level security;

create policy "profiles: read self or boardmate" on public.profiles
  for select to authenticated using (id = auth.uid() or public.shares_board(id));
create policy "profiles: insert self" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles: update self" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "boards: members read" on public.boards
  for select to authenticated using (public.is_member(id));

create policy "members: members read" on public.board_members
  for select to authenticated using (public.is_member(board_id));
create policy "members: members remove" on public.board_members
  for delete to authenticated using (public.is_member(board_id));

create policy "notes: members read" on public.notes
  for select to authenticated using (public.is_member(board_id));
create policy "notes: members add own" on public.notes
  for insert to authenticated with check (public.is_member(board_id) and author_id = auth.uid());
create policy "notes: members move" on public.notes
  for update to authenticated using (public.is_member(board_id)) with check (public.is_member(board_id));
create policy "notes: members remove" on public.notes
  for delete to authenticated using (public.is_member(board_id));

create policy "push: own subscriptions" on public.push_subs
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Live updates ----------

alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.board_members;

-- ---------- Photo & drawing storage (private bucket, 5 MB per file) ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('board-media', 'board-media', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "media: members read" on storage.objects
  for select to authenticated
  using (bucket_id = 'board-media' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "media: members upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'board-media' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "media: members delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'board-media' and public.is_member(((storage.foldername(name))[1])::uuid));
