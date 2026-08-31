-- Batch, calendar fields, award styling, delete requests

alter table public.profiles
  add column if not exists batch text,
  add column if not exists delete_requested_at timestamptz;

alter table public.events
  add column if not exists region text,
  add column if not exists color text default '#34c759',
  add column if not exists end_date date,
  add column if not exists time_start time,
  add column if not exists time_end time,
  add column if not exists is_recurring boolean not null default false,
  add column if not exists cancelled_dates date[] not null default '{}';

alter table public.awards
  add column if not exists icon text not null default 'award',
  add column if not exists color text not null default '#34c759';

update public.events set region = split_part(venue, ',', 1)
  where region is null and venue is not null;

update public.events set color = '#f97316' where category ilike '%environment%';
update public.events set color = '#3b82f6' where category ilike '%stem%';
update public.events set color = '#a855f7' where category ilike '%education%';
