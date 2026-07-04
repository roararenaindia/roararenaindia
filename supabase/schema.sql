-- Roar Arena Phase 2 database schema
-- Run this in Supabase SQL Editor once.

create extension if not exists pgcrypto;

create table if not exists public.roar_posts (
  id uuid primary key default gen_random_uuid(),
  instagram_id text unique,
  title text,
  caption text,
  description text,
  media_url text not null,
  remote_media_url text,
  thumbnail_url text,
  storage_path text,
  permalink text,
  media_type text default 'IMAGE',
  post_type text default 'Announcement',
  category text default 'Roar Arena',
  logo text,
  teams jsonb default '[]'::jsonb,
  sync_source text default 'manual',
  source_payload jsonb default '{}'::jsonb,
  last_synced_at timestamptz,
  is_featured boolean default false,
  is_hidden boolean default false,
  posted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.roar_posts add column if not exists description text;
alter table public.roar_posts add column if not exists post_type text default 'Announcement';
alter table public.roar_posts add column if not exists logo text;
alter table public.roar_posts add column if not exists teams jsonb default '[]'::jsonb;
alter table public.roar_posts add column if not exists remote_media_url text;
alter table public.roar_posts add column if not exists thumbnail_url text;
alter table public.roar_posts add column if not exists storage_path text;
alter table public.roar_posts add column if not exists sync_source text default 'manual';
alter table public.roar_posts add column if not exists source_payload jsonb default '{}'::jsonb;
alter table public.roar_posts add column if not exists last_synced_at timestamptz;

create table if not exists public.roar_matches (
  id uuid primary key default gen_random_uuid(),
  provider_match_id text unique,
  sport text not null,
  league text not null,
  league_logo text,
  home_team text not null,
  away_team text not null,
  home_short text,
  away_short text,
  home_logo text,
  away_logo text,
  home_score int,
  away_score int,
  status text not null default 'upcoming',
  status_label text,
  kickoff_time timestamptz,
  venue text,
  winner text,
  priority int default 0,
  is_featured boolean default false,
  is_hidden boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.roar_matches add column if not exists home_short text;
alter table public.roar_matches add column if not exists away_short text;
alter table public.roar_matches add column if not exists status_label text;
alter table public.roar_matches add column if not exists is_hidden boolean default false;

create table if not exists public.roar_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sport text not null,
  logo_url text not null,
  country text,
  created_at timestamptz default now()
);

create table if not exists public.roar_leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sport text not null,
  logo_url text not null,
  created_at timestamptz default now()
);

create index if not exists roar_posts_visible_posted_idx
on public.roar_posts (is_hidden, posted_at desc);

create index if not exists roar_matches_priority_time_idx
on public.roar_matches (is_hidden, priority desc, kickoff_time asc);

create index if not exists roar_matches_status_idx
on public.roar_matches (status);

create index if not exists roar_matches_sport_status_time_idx
on public.roar_matches (sport, status, kickoff_time);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_roar_posts_updated_at on public.roar_posts;
create trigger set_roar_posts_updated_at
before update on public.roar_posts
for each row execute function public.set_updated_at();

drop trigger if exists set_roar_matches_updated_at on public.roar_matches;
create trigger set_roar_matches_updated_at
before update on public.roar_matches
for each row execute function public.set_updated_at();

alter table public.roar_posts enable row level security;
alter table public.roar_matches enable row level security;
alter table public.roar_teams enable row level security;
alter table public.roar_leagues enable row level security;

drop policy if exists "Public can read visible roar posts" on public.roar_posts;
create policy "Public can read visible roar posts"
on public.roar_posts for select
using (is_hidden = false);

drop policy if exists "Public can read roar matches" on public.roar_matches;
create policy "Public can read roar matches"
on public.roar_matches for select
using (true);

drop policy if exists "Public can read roar teams" on public.roar_teams;
create policy "Public can read roar teams"
on public.roar_teams for select
using (true);

drop policy if exists "Public can read roar leagues" on public.roar_leagues;
create policy "Public can read roar leagues"
on public.roar_leagues for select
using (true);

-- Writes are intentionally service-role only via server API routes.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY in the browser.


-- Phase 5: generated post approval queue
create table if not exists public.roar_generated_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  template_kind text not null default 'result',
  status text not null default 'draft',
  svg text not null,
  template_payload jsonb default '{}'::jsonb,
  source_match_id text,
  is_hidden boolean default false,
  approved_at timestamptz,
  published_at timestamptz,
  published_post_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists roar_generated_posts_status_created_idx
on public.roar_generated_posts (status, created_at desc);

alter table public.roar_generated_posts enable row level security;

drop policy if exists "Service role manages generated posts" on public.roar_generated_posts;
create policy "Service role manages generated posts"
on public.roar_generated_posts
for all
using (false)
with check (false);

drop trigger if exists set_roar_generated_posts_updated_at on public.roar_generated_posts;
create trigger set_roar_generated_posts_updated_at
before update on public.roar_generated_posts
for each row execute function public.set_updated_at();


-- Instagram / match automation sync logs
create table if not exists public.roar_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null,
  fetched_count int default 0,
  saved_count int default 0,
  message text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists roar_sync_runs_created_idx
on public.roar_sync_runs (created_at desc);

create index if not exists roar_sync_runs_source_created_idx
on public.roar_sync_runs (source, created_at desc);

alter table public.roar_sync_runs enable row level security;
