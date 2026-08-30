-- Public event viewing (share links, no login)
create policy "events_select_anon"
  on public.events for select
  to anon
  using (true);

-- Sample events (stable IDs for shareable URLs)
insert into public.events (
  id, title, date, venue, description, criteria, status,
  required_skills, category, coordinator_phone
) values
  (
    'e0000001-0000-4000-8000-000000000001',
    'Community Cleanup Drive',
    '2026-09-15',
    'Borivali Park, Mumbai',
    'Help us clean and beautify the neighborhood park. Gloves and bags provided. Great for first-time volunteers!',
    'Student',
    'active',
    array['Teamwork', 'Communication'],
    'Community',
    '+919876543210'
  ),
  (
    'e0000002-0000-4000-8000-000000000002',
    'STEM Workshop for Kids',
    '2026-09-22',
    'SNS Community Hall, Andheri',
    'Volunteer as a mentor for a hands-on science and coding workshop for students aged 10–14.',
    'Student',
    'active',
    array['STEM', 'Teaching'],
    'STEM',
    '+919876543211'
  ),
  (
    'e0000003-0000-4000-8000-000000000003',
    'Tree Plantation Camp',
    '2026-10-05',
    'Aarey Colony Green Belt',
    'Plant native saplings and learn about urban reforestation. Wear comfortable shoes and bring a water bottle.',
    'Open to all',
    'active',
    array['Environment', 'Physical Activity'],
    'Environment',
    '+919876543212'
  )
on conflict (id) do update set
  title = excluded.title,
  date = excluded.date,
  venue = excluded.venue,
  description = excluded.description,
  criteria = excluded.criteria,
  status = excluded.status,
  required_skills = excluded.required_skills,
  category = excluded.category,
  coordinator_phone = excluded.coordinator_phone;
