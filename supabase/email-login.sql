-- ============================================================
-- Stuck on You: email magic-link login (run once in SQL Editor)
-- Lets the link you tap in your email hand the sign-in back to the
-- installed app (on iPhone the link opens in Safari, not the app).
-- ============================================================

create table if not exists public.auth_handoffs (
  nonce          text primary key check (char_length(nonce) >= 32),
  access_token   text not null,
  refresh_token  text not null,
  created_at     timestamptz not null default now()
);
-- No policies on purpose: only reachable through the two functions below.
alter table public.auth_handoffs enable row level security;

create or replace function public.put_handoff(p_nonce text, p_access text, p_refresh text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from auth_handoffs where created_at < now() - interval '15 minutes';
  insert into auth_handoffs (nonce, access_token, refresh_token) values (p_nonce, p_access, p_refresh)
  on conflict (nonce) do update
    set access_token = excluded.access_token, refresh_token = excluded.refresh_token, created_at = now();
end $$;

create or replace function public.claim_handoff(p_nonce text)
returns json language plpgsql security definer set search_path = public as $$
declare
  a text; r text;
begin
  delete from auth_handoffs
   where nonce = p_nonce and created_at > now() - interval '15 minutes'
   returning access_token, refresh_token into a, r;
  if not found then return null; end if;
  return json_build_object('access_token', a, 'refresh_token', r);
end $$;

revoke all on function public.put_handoff(text, text, text) from public, anon;
revoke all on function public.claim_handoff(text) from public;
grant execute on function public.put_handoff(text, text, text) to authenticated;
grant execute on function public.claim_handoff(text) to anon, authenticated;
