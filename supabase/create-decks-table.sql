-- Run this once in the Supabase SQL editor (or as a migration).
-- Public users can read decks; insert/update/delete remains available only to
-- privileged dashboard/service-role operations.

begin;

create table public.decks (
  id uuid primary key default gen_random_uuid(),
  name text not null check (
    length(btrim(name)) between 1 and 120
  ),
  author text not null check (
    length(btrim(author)) between 1 and 120
  ),
  format text not null check (
    format in ('standard', 'historic', 'timeless')
  ),
  colors text[] not null check (
    cardinality(colors) between 1 and 5
    and colors <@ array['W', 'U', 'B', 'R', 'G']::text[]
    and cardinality(colors) = (
      (case when 'W' = any(colors) then 1 else 0 end) +
      (case when 'U' = any(colors) then 1 else 0 end) +
      (case when 'B' = any(colors) then 1 else 0 end) +
      (case when 'R' = any(colors) then 1 else 0 end) +
      (case when 'G' = any(colors) then 1 else 0 end)
    )
  ),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  win_rate_pct numeric(5, 2) generated always as (
    case
      when wins + losses = 0 then 0::numeric
      else round((wins::numeric * 100) / (wins::bigint + losses::bigint), 2)
    end
  ) stored,
  last_played_at timestamptz not null default now(),
  cards jsonb not null,
  arena_export text not null check (
    length(btrim(arena_export)) between 1 and 100000
  ),
  created_at timestamptz not null default now()
);

-- JSON validation is performed in a trigger so it can inspect every card object
-- without exposing a public write endpoint.
create or replace function public.validate_decks_decklist()
returns trigger
language plpgsql
security invoker
set search_path = public
as $function$
declare
  section_name text;
  section_cards jsonb;
  card_item jsonb;
  quantity integer;
  mainboard_count integer := 0;
  sideboard_count integer := 0;
  companion_count integer := 0;
begin
  if jsonb_typeof(new.cards) <> 'object' then
    raise exception 'cards must be a JSON object';
  end if;

  if (new.cards - 'mainboard' - 'sideboard' - 'companion') <> '{}'::jsonb then
    raise exception 'cards accepts only mainboard, sideboard, and companion';
  end if;

  foreach section_name in array array['mainboard', 'sideboard', 'companion']
  loop
    section_cards := new.cards -> section_name;

    if jsonb_typeof(section_cards) <> 'array' then
      raise exception 'cards.% must be an array', section_name;
    end if;

    for card_item in select value from jsonb_array_elements(section_cards)
    loop
      if jsonb_typeof(card_item) <> 'object' then
        raise exception 'cards.% entries must be objects', section_name;
      end if;

      if
        coalesce(jsonb_typeof(card_item -> 'name') <> 'string', true)
        or length(btrim(coalesce(card_item ->> 'name', ''))) not between 1 and 200
      then
        raise exception 'cards.% entries require a valid name', section_name;
      end if;

      if
        coalesce(jsonb_typeof(card_item -> 'quantity') <> 'number', true)
        or coalesce(card_item ->> 'quantity', '') !~ '^[0-9]+$'
      then
        raise exception 'cards.% entries require an integer quantity', section_name;
      end if;

      quantity := (card_item ->> 'quantity')::integer;

      if quantity not between 1 and 250 then
        raise exception 'cards.% quantity must be between 1 and 250', section_name;
      end if;

      if section_name = 'mainboard' then
        mainboard_count := mainboard_count + quantity;
      elsif section_name = 'sideboard' then
        sideboard_count := sideboard_count + quantity;
      else
        companion_count := companion_count + quantity;
      end if;
    end loop;
  end loop;

  if mainboard_count < 60 then
    raise exception 'mainboard must contain at least 60 cards';
  end if;

  if sideboard_count + companion_count > 15 then
    raise exception 'sideboard and companion cannot exceed 15 cards';
  end if;

  if companion_count > 1 then
    raise exception 'companion cannot contain more than one card';
  end if;

  return new;
end;
$function$;

drop trigger if exists decks_validate_decklist on public.decks;
create trigger decks_validate_decklist
before insert or update of cards on public.decks
for each row
execute function public.validate_decks_decklist();

revoke all on function public.validate_decks_decklist()
from public, anon, authenticated;

create index decks_last_played_at_idx
  on public.decks (last_played_at desc, id desc);

create index decks_format_last_played_at_idx
  on public.decks (format, last_played_at desc, id desc);

create index decks_colors_idx
  on public.decks using gin (colors);

-- Row Level Security: public read-only. RLS blocks all anon/authenticated writes.
alter table public.decks enable row level security;

revoke all on table public.decks from public;
revoke all on table public.decks from anon, authenticated;
grant select on table public.decks to anon, authenticated;

create policy "Anyone can read decks"
on public.decks for select
to anon, authenticated
using ( true );

-- One extra row is requested by the application to determine if another page exists.
create function public.get_decks_page(
  p_format text default null,
  p_name text default '',
  p_author text default '',
  p_card text default '',
  p_colors text[] default array[]::text[],
  p_exact_colors boolean default false,
  p_before timestamptz default now(),
  p_offset integer default 0,
  p_limit integer default 11
)
returns table (
  id uuid,
  name text,
  author text,
  format text,
  colors text[],
  wins integer,
  losses integer,
  win_rate_pct numeric,
  last_played_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $function$
  with normalized_filters as (
    select
      nullif(lower(btrim(coalesce(p_format, ''))), '') as filter_format,
      btrim(coalesce(p_name, '')) as name_term,
      btrim(coalesce(p_author, '')) as author_term,
      btrim(coalesce(p_card, '')) as card_term,
      array(
        select distinct upper(color)
        from unnest(coalesce(p_colors, array[]::text[])) as selected(color)
        where upper(color) in ('W', 'U', 'B', 'R', 'G')
        order by upper(color)
      ) as selected_colors
  ),
  escaped_filters as (
    select
      *,
      '%' || replace(replace(replace(name_term, '\', '\\'), '%', '\%'), '_', '\_') || '%' as name_pattern,
      '%' || replace(replace(replace(author_term, '\', '\\'), '%', '\%'), '_', '\_') || '%' as author_pattern,
      '%' || replace(replace(replace(card_term, '\', '\\'), '%', '\%'), '_', '\_') || '%' as card_pattern
    from normalized_filters
  )
  select
    deck.id,
    deck.name,
    deck.author,
    deck.format,
    deck.colors,
    deck.wins,
    deck.losses,
    deck.win_rate_pct,
    deck.last_played_at
  from public.decks as deck
  cross join escaped_filters as filters
  where
    deck.last_played_at <= coalesce(p_before, now())
    and (filters.filter_format is null or deck.format = filters.filter_format)
    and (filters.name_term = '' or deck.name ilike filters.name_pattern escape '\')
    and (filters.author_term = '' or deck.author ilike filters.author_pattern escape '\')
    and (
      filters.card_term = ''
      or exists (
        select 1
        from (
          select item
          from jsonb_array_elements(deck.cards -> 'mainboard') as cards(item)
          union all
          select item
          from jsonb_array_elements(deck.cards -> 'sideboard') as cards(item)
          union all
          select item
          from jsonb_array_elements(deck.cards -> 'companion') as cards(item)
        ) as deck_cards
        where coalesce(deck_cards.item ->> 'name', '')
          ilike filters.card_pattern escape '\'
      )
    )
    and (
      cardinality(filters.selected_colors) = 0
      or (
        deck.colors <@ filters.selected_colors
        and (
          not coalesce(p_exact_colors, false)
          or deck.colors @> filters.selected_colors
        )
      )
    )
  order by deck.last_played_at desc, deck.id desc
  offset greatest(coalesce(p_offset, 0), 0)
  limit least(greatest(coalesce(p_limit, 11), 1), 21);
$function$;

revoke all on function public.get_decks_page(
  text,
  text,
  text,
  text,
  text[],
  boolean,
  timestamptz,
  integer,
  integer
) from public;

grant execute on function public.get_decks_page(
  text,
  text,
  text,
  text,
  text[],
  boolean,
  timestamptz,
  integer,
  integer
) to anon, authenticated;

commit;
