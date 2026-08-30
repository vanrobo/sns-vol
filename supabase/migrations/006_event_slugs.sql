-- Human-readable public URLs: /event/community-cleanup-drive

alter table public.events add column if not exists slug text;

update public.events set slug = 'community-cleanup-drive'
  where id = 'e0000001-0000-4000-8000-000000000001' or title ilike '%Community Cleanup%';

update public.events set slug = 'stem-workshop-for-kids'
  where id = 'e0000002-0000-4000-8000-000000000002' or title ilike '%STEM Workshop%';

update public.events set slug = 'tree-plantation-camp'
  where id = 'e0000003-0000-4000-8000-000000000003' or title ilike '%Tree Plantation%';

-- Fallback slug from title for any events still missing one
update public.events
set slug = lower(regexp_replace(regexp_replace(trim(title), '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
where slug is null or slug = '';

alter table public.events alter column slug set not null;

create unique index if not exists events_slug_idx on public.events (slug);
