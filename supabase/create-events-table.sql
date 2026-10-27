-- Run this in the Supabase SQL editor (or as a migration).
-- Events listed on the /events page. Upcoming/past is derived from starts_at.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  starts_at timestamptz not null,
  event_url text not null check (event_url ~* '^https?://'),
  created_at timestamptz not null default now()
);

create index if not exists events_starts_at_idx on public.events (starts_at);

-- Row Level Security: public read-only. Writes only via dashboard / service_role.
alter table public.events enable row level security;

revoke all on table public.events from anon, authenticated;
grant select on table public.events to anon, authenticated;

drop policy if exists "Anyone can read events" on public.events;
create policy "Anyone can read events"
on public.events for select
to anon, authenticated
using ( true );
