-- ============================================================
-- Pinned: usage monitoring (read-only)
-- Paste any of these into Supabase > SQL Editor to see where you stand
-- against the free-tier limits. None of them change your data.
-- ============================================================

-- 1) Row counts per table (how much you've accumulated)
select 'notes' t, count(*) from public.notes
union all select 'messages', count(*) from public.messages
union all select 'strokes', count(*) from public.strokes
union all select 'game_scores', count(*) from public.game_scores
union all select 'pings', count(*) from public.pings
union all select 'answers', count(*) from public.answers
order by 1;

-- 2) Database size of each table, largest first (free tier: 500 MB total DB)
select relname as table, pg_size_pretty(pg_total_relation_size(relid)) as size,
       pg_total_relation_size(relid) as bytes
from pg_catalog.pg_statio_user_tables
order by pg_total_relation_size(relid) desc
limit 20;

-- 3) Whole database size
select pg_size_pretty(pg_database_size(current_database())) as database_size;

-- 4) Storage used by uploaded media (free tier: 1 GB storage)
--    Sums the size of every object in the board-media bucket.
select count(*) as files,
       pg_size_pretty(coalesce(sum((metadata->>'size')::bigint), 0)) as media_used
from storage.objects
where bucket_id = 'board-media';

-- 5) Biggest media files, in case something large slipped through
select name, pg_size_pretty((metadata->>'size')::bigint) as size, created_at
from storage.objects
where bucket_id = 'board-media'
order by (metadata->>'size')::bigint desc nulls last
limit 15;

-- 6) Orphaned media: files whose note was deleted (safe to clean up)
--    Review before deleting; this only LISTS them.
select o.name, pg_size_pretty((o.metadata->>'size')::bigint) as size
from storage.objects o
where o.bucket_id = 'board-media'
  and not exists (select 1 from public.notes n where n.media_path = o.name)
  and not exists (select 1 from public.messages m where m.media_path = o.name)
order by (o.metadata->>'size')::bigint desc nulls last;

-- 7) Which tables publish realtime changes (each adds to your realtime usage)
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
order by 1, 2;

-- ------------------------------------------------------------
-- Free-tier guideposts (check the live numbers in your Supabase
-- dashboard > Settings > Usage; these change over time):
--   Database:        ~500 MB
--   File storage:    ~1 GB
--   Monthly egress:  a few GB
--   Realtime:        a couple hundred concurrent peak / a few million messages
--   Edge functions:  ~500k invocations/month
-- If you approach any of these, the first cleanup is old media (queries 4–6).
-- ------------------------------------------------------------
