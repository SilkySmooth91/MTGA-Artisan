-- TEST DATA for the /decks pages. Run AFTER create-decks-table.sql.
-- Exactly seven fictional decks are inserted. The marker makes cleanup explicit.

begin;

delete from public.decks
where author like 'MTGA Artisan QA - %';

insert into public.decks (
  name,
  author,
  format,
  colors,
  wins,
  losses,
  last_played_at,
  cards,
  arena_export
) values
  (
    'TEST - Mono Red Aggro',
    'MTGA Artisan QA - Alice',
    'standard',
    array['R'],
    89,
    39,
    '2026-11-26T20:30:00Z',
    '{
      "mainboard": [
        {"quantity": 4, "name": "Monastery Swiftspear"},
        {"quantity": 4, "name": "Kumano Faces Kakkazan"},
        {"quantity": 4, "name": "Phoenix Chick"},
        {"quantity": 4, "name": "Cacophony Scamp"},
        {"quantity": 4, "name": "Lightning Strike"},
        {"quantity": 4, "name": "Play with Fire"},
        {"quantity": 4, "name": "Ancestral Anger"},
        {"quantity": 4, "name": "Kessig Flamebreather"},
        {"quantity": 4, "name": "Thermo-Alchemist"},
        {"quantity": 4, "name": "Electrostatic Infantry"},
        {"quantity": 20, "name": "Mountain"}
      ],
      "sideboard": [
        {"quantity": 4, "name": "End the Festivities"},
        {"quantity": 4, "name": "Raze the Effigy"},
        {"quantity": 4, "name": "Scorching Dragonfire"},
        {"quantity": 3, "name": "Rending Flame"}
      ],
      "companion": []
    }'::jsonb,
    E'Deck\n4 Monastery Swiftspear\n4 Kumano Faces Kakkazan\n4 Phoenix Chick\n4 Cacophony Scamp\n4 Lightning Strike\n4 Play with Fire\n4 Ancestral Anger\n4 Kessig Flamebreather\n4 Thermo-Alchemist\n4 Electrostatic Infantry\n20 Mountain\n\nSideboard\n4 End the Festivities\n4 Raze the Effigy\n4 Scorching Dragonfire\n3 Rending Flame'
  ),
  (
    'TEST - Dimir Control',
    'MTGA Artisan QA - Bruno',
    'historic',
    array['U', 'B'],
    71,
    34,
    '2026-11-25T19:15:00Z',
    '{
      "mainboard": [
        {"quantity": 4, "name": "Opt"},
        {"quantity": 4, "name": "Consider"},
        {"quantity": 4, "name": "Counterspell"},
        {"quantity": 4, "name": "Go for the Throat"},
        {"quantity": 4, "name": "Memory Lapse"},
        {"quantity": 4, "name": "Drown in the Loch"},
        {"quantity": 4, "name": "Essence Scatter"},
        {"quantity": 4, "name": "Into the Story"},
        {"quantity": 4, "name": "Fact or Fiction"},
        {"quantity": 4, "name": "Darkslick Shores"},
        {"quantity": 10, "name": "Island"},
        {"quantity": 10, "name": "Swamp"}
      ],
      "sideboard": [
        {"quantity": 4, "name": "Duress"},
        {"quantity": 4, "name": "Negate"},
        {"quantity": 4, "name": "Disdainful Stroke"},
        {"quantity": 3, "name": "Feed the Swarm"}
      ],
      "companion": []
    }'::jsonb,
    E'Deck\n4 Opt\n4 Consider\n4 Counterspell\n4 Go for the Throat\n4 Memory Lapse\n4 Drown in the Loch\n4 Essence Scatter\n4 Into the Story\n4 Fact or Fiction\n4 Darkslick Shores\n10 Island\n10 Swamp\n\nSideboard\n4 Duress\n4 Negate\n4 Disdainful Stroke\n3 Feed the Swarm'
  ),
  (
    'TEST - Jund Sacrifice',
    'MTGA Artisan QA - Clara',
    'timeless',
    array['B', 'R', 'G'],
    96,
    55,
    '2026-11-24T21:00:00Z',
    '{
      "mainboard": [
        {"quantity": 4, "name": "Woe Strider"},
        {"quantity": 4, "name": "Mayhem Devil"},
        {"quantity": 4, "name": "Cauldron Familiar"},
        {"quantity": 4, "name": "Witch''s Oven"},
        {"quantity": 4, "name": "Priest of Forgotten Gods"},
        {"quantity": 4, "name": "Claim the Firstborn"},
        {"quantity": 4, "name": "Deadly Dispute"},
        {"quantity": 4, "name": "Korvold, Fae-Cursed King"},
        {"quantity": 4, "name": "Fabled Passage"},
        {"quantity": 4, "name": "Blightstep Pathway"},
        {"quantity": 4, "name": "Cragcrown Pathway"},
        {"quantity": 8, "name": "Forest"},
        {"quantity": 4, "name": "Mountain"},
        {"quantity": 4, "name": "Swamp"}
      ],
      "sideboard": [
        {"quantity": 4, "name": "Duress"},
        {"quantity": 4, "name": "Abrade"},
        {"quantity": 4, "name": "Go for the Throat"},
        {"quantity": 3, "name": "Scavenging Ooze"}
      ],
      "companion": []
    }'::jsonb,
    E'Deck\n4 Woe Strider\n4 Mayhem Devil\n4 Cauldron Familiar\n4 Witch''s Oven\n4 Priest of Forgotten Gods\n4 Claim the Firstborn\n4 Deadly Dispute\n4 Korvold, Fae-Cursed King\n4 Fabled Passage\n4 Blightstep Pathway\n4 Cragcrown Pathway\n8 Forest\n4 Mountain\n4 Swamp\n\nSideboard\n4 Duress\n4 Abrade\n4 Go for the Throat\n3 Scavenging Ooze'
  ),
  (
    'TEST - Azorius Control',
    'MTGA Artisan QA - David',
    'standard',
    array['W', 'U'],
    63,
    41,
    '2026-11-23T18:45:00Z',
    '{
      "mainboard": [
        {"quantity": 4, "name": "Opt"},
        {"quantity": 4, "name": "Essence Scatter"},
        {"quantity": 4, "name": "Absorb"},
        {"quantity": 4, "name": "The Wandering Emperor"},
        {"quantity": 4, "name": "Lay Down Arms"},
        {"quantity": 4, "name": "Temporary Lockdown"},
        {"quantity": 4, "name": "Memory Deluge"},
        {"quantity": 4, "name": "The Birth of Meletis"},
        {"quantity": 4, "name": "Deserted Beach"},
        {"quantity": 4, "name": "Hengegate Pathway"},
        {"quantity": 10, "name": "Island"},
        {"quantity": 10, "name": "Plains"}
      ],
      "sideboard": [
        {"quantity": 4, "name": "Disdainful Stroke"},
        {"quantity": 4, "name": "Negate"},
        {"quantity": 4, "name": "Sunfall"},
        {"quantity": 3, "name": "Pithing Needle"}
      ],
      "companion": []
    }'::jsonb,
    E'Deck\n4 Opt\n4 Essence Scatter\n4 Absorb\n4 The Wandering Emperor\n4 Lay Down Arms\n4 Temporary Lockdown\n4 Memory Deluge\n4 The Birth of Meletis\n4 Deserted Beach\n4 Hengegate Pathway\n10 Island\n10 Plains\n\nSideboard\n4 Disdainful Stroke\n4 Negate\n4 Sunfall\n3 Pithing Needle'
  ),
  (
    'TEST - Selesnya Tokens',
    'MTGA Artisan QA - Elena',
    'timeless',
    array['W', 'G'],
    84,
    37,
    '2026-11-22T20:00:00Z',
    '{
      "mainboard": [
        {"quantity": 4, "name": "Voice of Resurgence"},
        {"quantity": 4, "name": "Wedding Announcement"},
        {"quantity": 4, "name": "Join the Dance"},
        {"quantity": 4, "name": "Adeline, Resplendent Cathar"},
        {"quantity": 4, "name": "Clarion Spirit"},
        {"quantity": 4, "name": "Raise the Alarm"},
        {"quantity": 4, "name": "Battle for Bretagard"},
        {"quantity": 4, "name": "Scute Swarm"},
        {"quantity": 4, "name": "Branchloft Pathway"},
        {"quantity": 4, "name": "Overgrown Farmland"},
        {"quantity": 10, "name": "Forest"},
        {"quantity": 10, "name": "Plains"}
      ],
      "sideboard": [
        {"quantity": 4, "name": "Portable Hole"},
        {"quantity": 4, "name": "Return to Nature"},
        {"quantity": 4, "name": "Scavenging Ooze"},
        {"quantity": 3, "name": "Sunset Revelry"}
      ],
      "companion": []
    }'::jsonb,
    E'Deck\n4 Voice of Resurgence\n4 Wedding Announcement\n4 Join the Dance\n4 Adeline, Resplendent Cathar\n4 Clarion Spirit\n4 Raise the Alarm\n4 Battle for Bretagard\n4 Scute Swarm\n4 Branchloft Pathway\n4 Overgrown Farmland\n10 Forest\n10 Plains\n\nSideboard\n4 Portable Hole\n4 Return to Nature\n4 Scavenging Ooze\n3 Sunset Revelry'
  ),
  (
    'TEST - Izzet Spells',
    'MTGA Artisan QA - Fabio',
    'historic',
    array['U', 'R'],
    77,
    42,
    '2026-11-21T20:30:00Z',
    '{
      "mainboard": [
        {"quantity": 4, "name": "Opt"},
        {"quantity": 4, "name": "Consider"},
        {"quantity": 4, "name": "Lightning Bolt"},
        {"quantity": 4, "name": "Wizard''s Lightning"},
        {"quantity": 4, "name": "Sprite Dragon"},
        {"quantity": 4, "name": "Third Path Iconoclast"},
        {"quantity": 4, "name": "Expressive Iteration"},
        {"quantity": 4, "name": "Of One Mind"},
        {"quantity": 4, "name": "Riverglide Pathway"},
        {"quantity": 4, "name": "Steam Vents"},
        {"quantity": 10, "name": "Island"},
        {"quantity": 10, "name": "Mountain"}
      ],
      "sideboard": [
        {"quantity": 4, "name": "Negate"},
        {"quantity": 4, "name": "Abrade"},
        {"quantity": 4, "name": "Mystical Dispute"},
        {"quantity": 3, "name": "Pithing Needle"}
      ],
      "companion": []
    }'::jsonb,
    E'Deck\n4 Opt\n4 Consider\n4 Lightning Bolt\n4 Wizard''s Lightning\n4 Sprite Dragon\n4 Third Path Iconoclast\n4 Expressive Iteration\n4 Of One Mind\n4 Riverglide Pathway\n4 Steam Vents\n10 Island\n10 Mountain\n\nSideboard\n4 Negate\n4 Abrade\n4 Mystical Dispute\n3 Pithing Needle'
  ),
  (
    'TEST - Esper Control',
    'MTGA Artisan QA - Giada',
    'standard',
    array['W', 'U', 'B'],
    73,
    48,
    '2026-11-20T19:00:00Z',
    '{
      "mainboard": [
        {"quantity": 4, "name": "Absorb"},
        {"quantity": 4, "name": "Void Rend"},
        {"quantity": 4, "name": "Go for the Throat"},
        {"quantity": 4, "name": "Memory Deluge"},
        {"quantity": 4, "name": "The Wandering Emperor"},
        {"quantity": 4, "name": "Lay Down Arms"},
        {"quantity": 4, "name": "Temporary Lockdown"},
        {"quantity": 4, "name": "Raffine''s Tower"},
        {"quantity": 4, "name": "Deserted Beach"},
        {"quantity": 4, "name": "Shipwreck Marsh"},
        {"quantity": 8, "name": "Island"},
        {"quantity": 6, "name": "Plains"},
        {"quantity": 6, "name": "Swamp"}
      ],
      "sideboard": [
        {"quantity": 4, "name": "Duress"},
        {"quantity": 4, "name": "Negate"},
        {"quantity": 4, "name": "Disdainful Stroke"},
        {"quantity": 3, "name": "Sunfall"}
      ],
      "companion": []
    }'::jsonb,
    E'Deck\n4 Absorb\n4 Void Rend\n4 Go for the Throat\n4 Memory Deluge\n4 The Wandering Emperor\n4 Lay Down Arms\n4 Temporary Lockdown\n4 Raffine''s Tower\n4 Deserted Beach\n4 Shipwreck Marsh\n8 Island\n6 Plains\n6 Swamp\n\nSideboard\n4 Duress\n4 Negate\n4 Disdainful Stroke\n3 Sunfall'
  );

-- Verification:
-- select name, win_rate_pct, jsonb_array_length(cards -> 'mainboard') as mainboard_entries
-- from public.decks where author like 'MTGA Artisan QA - %'
-- order by last_played_at desc;

-- Cleanup when you are done testing:
-- delete from public.decks where author like 'MTGA Artisan QA - %';

commit;
