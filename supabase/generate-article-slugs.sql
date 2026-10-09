-- Run this in the Supabase SQL editor AFTER adding the `slug` column
-- (alter table articles add column slug text unique;)

-- 1) Slugify helper (lowercase, strip non-alphanumerics, dash-separated)
create or replace function slugify(value text)
returns text language sql immutable as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(value, '')), '[^a-z0-9\s-]', '', 'g'),
    '\s+', '-', 'g')
  )
$$;

-- 2) Backfill slug for existing rows, de-duplicating same-title articles
--    with a numeric suffix (-2, -3, ...) ordered by creation date.
with ranked as (
  select
    id,
    slugify(title) as base_slug,
    row_number() over (partition by slugify(title) order by created_at) as rn
  from articles
)
update articles a
set slug = case when r.rn = 1 then r.base_slug else r.base_slug || '-' || r.rn end
from ranked r
where a.id = r.id
  and (a.slug is null or length(trim(a.slug)) = 0);

-- 3) (Recommended) Auto-generate the slug for new/edited articles added
--    directly from the Supabase dashboard, since there's no app-side
--    insert flow. Only fills it in when missing, so published slugs stay stable.
create or replace function set_article_slug()
returns trigger language plpgsql as $$
declare
  base_slug text;
  candidate text;
  suffix int := 1;
begin
  if new.slug is not null and length(trim(new.slug)) > 0 then
    return new;
  end if;

  base_slug := slugify(new.title);
  candidate := base_slug;

  while exists (
    select 1 from articles
    where slug = candidate
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  end loop;

  new.slug := candidate;
  return new;
end;
$$;

drop trigger if exists trg_set_article_slug on articles;
create trigger trg_set_article_slug
before insert or update on articles
for each row execute function set_article_slug();
