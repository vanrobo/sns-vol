-- Move sample events to Delhi; add more Delhi events + recurring Sector 2 classes

update public.events set
  venue = 'Central Park, Dwarka Sector 10, Delhi',
  region = 'Dwarka Sector 10',
  slug = coalesce(slug, 'community-cleanup-drive')
where id = 'e0000001-0000-4000-8000-000000000001';

update public.events set
  venue = 'SNS Community Hall, Rohini Sector 15, Delhi',
  region = 'Rohini Sector 15',
  slug = coalesce(slug, 'stem-workshop-for-kids')
where id = 'e0000002-0000-4000-8000-000000000002';

update public.events set
  venue = 'Sanjay Van, Mehrauli, Delhi',
  region = 'Mehrauli',
  slug = coalesce(slug, 'tree-plantation-camp')
where id = 'e0000003-0000-4000-8000-000000000003';

insert into public.events (
  id, slug, title, date, end_date, venue, region, description, criteria, status,
  required_skills, category, coordinator_phone, color, is_recurring, time_start, time_end
) values
  (
    'e0000004-0000-4000-8000-000000000004',
    'daily-classes-sector-2',
    'Daily Classes — Dwarka Sector 2',
    '2026-09-01',
    '2026-12-31',
    'Community Centre, Dwarka Sector 2, Delhi',
    'Dwarka Sector 2',
    'Daily evening classes for children (4:30–6:00 PM). Volunteers help with homework, reading, and activities.',
    'Student',
    'active',
    array['Teaching', 'Patience'],
    'Education',
    '+919876543213',
    '#f97316',
    true,
    '16:30',
    '18:00'
  ),
  (
    'e0000005-0000-4000-8000-000000000005',
    'health-camp-saket',
    'Community Health Camp',
    '2026-09-20',
    null,
    'Saket Community Centre, Delhi',
    'Saket',
    'Assist doctors with registration and health awareness booths.',
    'Open to all',
    'active',
    array['Communication'],
    'Community',
    '+919876543214',
    '#34c759',
    false,
    null,
    null
  ),
  (
    'e0000006-0000-4000-8000-000000000006',
    'cp-cleanup-drive',
    'Connaught Place Cleanup',
    '2026-09-28',
    null,
    'Connaught Place Inner Circle, Delhi',
    'Connaught Place',
    'Weekend cleanup and awareness drive in central Delhi.',
    'Open to all',
    'active',
    array['Teamwork'],
    'Environment',
    '+919876543215',
    '#22c55e',
    false,
    null,
    null
  ),
  (
    'e0000007-0000-4000-8000-000000000007',
    'janmashtami-celebration',
    'Janmashtami Celebration',
    '2026-09-03',
    null,
    'Dwarka Sector 2 Community Hall, Delhi',
    'Dwarka Sector 2',
    'Help organize cultural activities and crowd management for Janmashtami.',
    'Open to all',
    'active',
    array['Event Management'],
    'Community',
    '+919876543216',
    '#a855f7',
    false,
    null,
    null
  )
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  date = excluded.date,
  end_date = excluded.end_date,
  venue = excluded.venue,
  region = excluded.region,
  description = excluded.description,
  color = excluded.color,
  is_recurring = excluded.is_recurring,
  time_start = excluded.time_start,
  time_end = excluded.time_end;
