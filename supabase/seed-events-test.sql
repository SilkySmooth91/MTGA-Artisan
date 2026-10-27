-- TEST DATA for the /events page. Run in the Supabase SQL editor AFTER create-events-table.sql.
-- All URLs use example.com so the rows are easy to find and remove (see the cleanup at the bottom).
-- starts_at is stored in UTC. Europe/Rome is UTC+2 until Oct 25 2026 (CEST), UTC+1 after (CET).

insert into public.events (name, starts_at, event_url) values
  -- Upcoming (5)
  ('ALPHA Session - Nov 2026',                '2026-10-31T13:00:00Z', 'https://example.com/events/alpha-nov-2026'),
  ('OMEGA Session - Nov 2026',                '2026-11-07T13:00:00Z', 'https://example.com/events/omega-nov-2026'),
  ('Mender Circuit Standard Artisan - ALPHA', '2026-11-14T20:00:00Z', 'https://example.com/events/mender-alpha-nov'),
  ('Mender Circuit Standard Artisan - OMEGA', '2026-11-14T22:00:00Z', 'https://example.com/events/mender-omega-nov'),
  ('Standard Artisan Cup - November 2026',    '2026-11-21T22:45:00Z', 'https://example.com/events/artisan-cup-nov-2026'),

  -- Past (6)
  ('Standard Artisan Cup - October 2026',     '2026-10-13T21:45:00Z', 'https://example.com/events/artisan-cup-oct-2026'),
  ('Mender Circuit Standard Artisan - OMEGA', '2026-10-01T19:00:00Z', 'https://example.com/events/mender-omega-oct'),
  ('Mender Circuit Standard Artisan - ALPHA', '2026-10-01T17:00:00Z', 'https://example.com/events/mender-alpha-oct'),
  ('Standard Artisan Cup - September 2026',   '2026-09-15T21:45:00Z', 'https://example.com/events/artisan-cup-sep-2026'),
  ('Historic Artisan Open - September 2026',  '2026-09-05T14:00:00Z', 'https://example.com/events/historic-open-sep-2026'),
  ('Standard Artisan Cup - August 2026',      '2026-08-18T21:45:00Z', 'https://example.com/events/artisan-cup-aug-2026');

-- Cleanup when you are done testing:
-- delete from public.events where event_url like 'https://example.com/%';
