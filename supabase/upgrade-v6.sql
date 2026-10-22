-- ============================================================
-- Pinned: v6 upgrade (Phase 2: messages, backgrounds, playlists)
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run again.
-- Needs v2–v5 first.
-- ============================================================

-- ---------- Messages (1-on-1 and the board's group chat) ----------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards(id) on delete cascade,
  sender_id  uuid references auth.users(id) on delete set null,
  to_id      uuid references auth.users(id) on delete cascade,     -- null = group chat
  body       text check (body is null or char_length(body) <= 2000),
  media_path text,
  created_at timestamptz not null default now(),
  check (body is not null or media_path is not null)
);
create index if not exists messages_board_idx on public.messages(board_id, created_at);
alter table public.messages enable row level security;

create or replace function public.is_board_member(b uuid, u uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from board_members where board_id = b and user_id = u);
$$;

drop policy if exists "messages: read mine" on public.messages;
drop policy if exists "messages: send" on public.messages;
create policy "messages: read mine" on public.messages for select to authenticated
  using (public.is_member(board_id) and (to_id is null or sender_id = auth.uid() or to_id = auth.uid()));
create policy "messages: send" on public.messages for insert to authenticated
  with check (public.is_member(board_id) and sender_id = auth.uid()
              and (to_id is null or (to_id <> auth.uid() and public.is_board_member(board_id, to_id))));

-- read receipts: when each person last read each conversation
-- peer = 'group' or the other person's id
create table if not exists public.message_reads (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  peer     text not null check (char_length(peer) <= 64),
  read_at  timestamptz not null default now(),
  primary key (board_id, user_id, peer)
);
alter table public.message_reads enable row level security;
drop policy if exists "reads: members read" on public.message_reads;
drop policy if exists "reads: own" on public.message_reads;
drop policy if exists "reads: own update" on public.message_reads;
create policy "reads: members read" on public.message_reads for select to authenticated using (public.is_member(board_id));
create policy "reads: own" on public.message_reads for insert to authenticated with check (user_id = auth.uid() and public.is_member(board_id));
create policy "reads: own update" on public.message_reads for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Backgrounds ----------
-- board background (shared mode) lives on the board; each person's own (personal mode) on their membership
alter table public.boards        add column if not exists bg_mode text not null default 'shared';
alter table public.boards        add column if not exists bg      jsonb;
alter table public.board_members add column if not exists bg      jsonb;
alter table public.boards drop constraint if exists boards_bg_mode_check;
alter table public.boards add constraint boards_bg_mode_check check (bg_mode in ('shared', 'personal'));

-- the board's owner sets the mode and the shared background
create or replace function public.set_board_bg(b uuid, p_mode text, p_bg jsonb, p_set_bg boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from boards where id = b and created_by = auth.uid()) then
    raise exception 'Only the board owner can change this';
  end if;
  update boards set
    bg_mode = coalesce(p_mode, bg_mode),
    bg = case when p_set_bg then p_bg else bg end
  where id = b;
end $$;

-- anyone sets their own background (used in personal mode)
create or replace function public.set_my_bg(b uuid, p_bg jsonb)
returns void language sql security definer set search_path = public as $$
  update board_members set bg = p_bg where board_id = b and user_id = auth.uid();
$$;

revoke all on function public.set_board_bg(uuid, text, jsonb, boolean) from public, anon;
revoke all on function public.set_my_bg(uuid, jsonb) from public, anon;
grant execute on function public.set_board_bg(uuid, text, jsonb, boolean) to authenticated;
grant execute on function public.set_my_bg(uuid, jsonb) to authenticated;

-- members ask the owner for a shared background (image or GIF); the owner reviews it
create table if not exists public.bg_requests (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references public.boards(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  media_path  text not null,
  kind        text not null check (kind in ('image', 'gif')),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists bg_requests_board_idx on public.bg_requests(board_id, created_at desc);
alter table public.bg_requests enable row level security;
drop policy if exists "bgreq: owner or requester reads" on public.bg_requests;
drop policy if exists "bgreq: members request" on public.bg_requests;
create policy "bgreq: owner or requester reads" on public.bg_requests for select to authenticated
  using (user_id = auth.uid() or exists (select 1 from boards x where x.id = board_id and x.created_by = auth.uid()));
create policy "bgreq: members request" on public.bg_requests for insert to authenticated
  with check (user_id = auth.uid() and public.is_member(board_id) and status = 'pending');

create or replace function public.review_bg_request(r uuid, approve boolean)
returns json language plpgsql security definer set search_path = public as $$
declare q record;
begin
  select * into q from bg_requests where id = r;
  if q.id is null then raise exception 'That request is gone'; end if;
  if not exists (select 1 from boards where id = q.board_id and created_by = auth.uid()) then
    raise exception 'Only the board owner can review requests';
  end if;
  update bg_requests set status = case when approve then 'approved' else 'declined' end, reviewed_at = now() where id = r;
  if approve then
    update boards set bg = jsonb_build_object('type', q.kind, 'path', q.media_path) where id = q.board_id;
  end if;
  return json_build_object('user_id', q.user_id, 'board_id', q.board_id);
end $$;
revoke all on function public.review_bg_request(uuid, boolean) from public, anon;
grant execute on function public.review_bg_request(uuid, boolean) to authenticated;

-- ---------- Playlist / link cards ----------
alter table public.notes drop constraint if exists notes_kind_check;
alter table public.notes add constraint notes_kind_check
  check (kind in ('text','emoji','image','drawing','voice','countdown','link'));

-- ---------- Storage: GIFs and short videos, up to 10 MB ----------
update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif',
                                  'video/mp4','video/webm','video/quicktime',
                                  'audio/mp4','audio/webm','audio/ogg','audio/mpeg','audio/aac','audio/x-m4a']
 where id = 'board-media';

-- ---------- Live updates ----------
do $$
declare t text;
begin
  foreach t in array array['messages','message_reads','bg_requests','boards'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
