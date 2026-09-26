-- =============================================================================
-- SNS Project (dprvfkytknejqvaydnut) — RUN THIS ONCE in SQL Editor
-- Paste ONLY this file (do not paste twice). Safe to re-run.
-- Creates Events tables next to existing Centre tables. Does NOT drop Centre data.
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1) Profiles table FIRST (functions need it)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  college text not null default '',
  phone text default '',
  address text default '',
  skills text[] not null default '{}',
  role text not null default 'volunteer'
    check (role in ('volunteer', 'organiser', 'admin', 'coordinator', 'mentor')),
  volunteer_id text,
  valid_until date,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'inactive')),
  avatar_url text,
  email_notifs boolean not null default true,
  public_profile boolean not null default true,
  batch text,
  centre text,
  delete_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_status_idx on public.profiles (status);

-- Enable RLS immediately (avoids Dashboard “enable RLS?” nag)
alter table public.profiles enable row level security;

-- 2) Helper functions (mentor_user_profiles uses app_role — NOT role)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_organiser()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'organiser'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'organiser', 'coordinator')
  );
$$;

create or replace function public.is_center_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'coordinator', 'mentor')
  )
  or exists (
    select 1 from public.mentor_user_profiles
    where auth_user_id = auth.uid()
      and lower(coalesce(app_role, '')) in ('admin', 'coordinator', 'mentor')
  );
$$;

-- 3) Events platform tables
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  date date not null,
  venue text not null,
  description text not null default '',
  criteria text not null default 'Student',
  status text not null default 'active' check (status in ('active', 'closed')),
  required_skills text[] not null default '{}',
  category text not null default 'Community',
  coordinator_phone text default '',
  region text,
  color text,
  end_date date,
  time_start text,
  time_end text,
  is_recurring boolean default false,
  cancelled_dates date[] default '{}',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);
alter table public.applications enable row level security;

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  star_rating int not null check (star_rating between 1 and 5),
  comment text default '',
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);
alter table public.feedbacks enable row level security;

create table if not exists public.grievances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.grievances enable row level security;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  type text not null default 'event',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  scanned_at timestamptz not null default now(),
  scanned_by uuid references public.profiles (id) on delete set null,
  unique (user_id, event_id)
);
alter table public.attendance enable row level security;

create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  event_id uuid references public.events (id) on delete set null,
  icon text,
  color text,
  created_at timestamptz not null default now()
);
alter table public.awards enable row level security;

create table if not exists public.user_awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  award_id uuid not null references public.awards (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, award_id)
);
alter table public.user_awards enable row level security;

create table if not exists public.sns_publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  pdf_url text not null,
  kind text not null default 'magazine' check (kind in ('magazine', 'newsletter')),
  category text not null default '',
  published_on date not null default current_date,
  sort_order int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.sns_publications enable row level security;

create table if not exists public.wordsmith_entries (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  meaning text not null default '',
  class_label text,
  center text,
  teach_by date,
  exam_by date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.wordsmith_entries enable row level security;

create table if not exists public.internship_batches (
  id uuid primary key default gen_random_uuid(),
  wing text not null check (wing in ('junior', 'senior')),
  title text not null,
  start_date date not null,
  end_date date not null,
  centre text,
  created_at timestamptz not null default now()
);
alter table public.internship_batches enable row level security;

create table if not exists public.internship_modules (
  id text primary key,
  title text not null
);
alter table public.internship_modules enable row level security;

create table if not exists public.internship_interns (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.internship_batches (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  name text not null,
  school text,
  phone text,
  preferred_module text,
  allotted_module text,
  mentor_id uuid references public.profiles (id) on delete set null,
  centre text,
  status text not null default 'applied',
  fees_paid boolean not null default false,
  centre_visited boolean not null default false,
  google_review_done boolean not null default false,
  mentor_signed_off boolean not null default false,
  lead_signed_off boolean not null default false,
  certified boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.internship_interns enable row level security;

create table if not exists public.internship_attendance (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references public.internship_interns (id) on delete cascade,
  on_date date not null,
  mark text not null check (mark in ('present', 'absent', 'leave', 'unmarked')),
  marked_by uuid references public.profiles (id) on delete set null,
  unique (intern_id, on_date)
);
alter table public.internship_attendance enable row level security;

create table if not exists public.internship_feedback (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references public.internship_interns (id) on delete cascade,
  mentor_id uuid references public.profiles (id) on delete set null,
  body text not null,
  submitted_work boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.internship_feedback enable row level security;

insert into public.internship_modules (id, title) values
  ('dev', 'Development'),
  ('econ', 'Economics'),
  ('video', 'Video Editing'),
  ('teaching', 'Teaching'),
  ('ops', 'Operations')
on conflict (id) do nothing;

-- 4) Policies (RLS already enabled above)
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_staff());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists events_select_all on public.events;
create policy events_select_all on public.events
  for select to anon, authenticated
  using (true);

drop policy if exists events_staff_write on public.events;
create policy events_staff_write on public.events
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists applications_own on public.applications;
create policy applications_own on public.applications
  for all to authenticated
  using (auth.uid() = user_id or public.is_staff())
  with check (auth.uid() = user_id or public.is_staff());

drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
  for all to authenticated
  using (auth.uid() = user_id or public.is_staff())
  with check (auth.uid() = user_id or public.is_staff());

drop policy if exists attendance_own on public.attendance;
create policy attendance_own on public.attendance
  for select to authenticated
  using (auth.uid() = user_id or public.is_staff());

drop policy if exists attendance_staff_write on public.attendance;
create policy attendance_staff_write on public.attendance
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists feedbacks_own on public.feedbacks;
create policy feedbacks_own on public.feedbacks
  for all to authenticated
  using (auth.uid() = user_id or public.is_staff())
  with check (auth.uid() = user_id or public.is_staff());

drop policy if exists grievances_own on public.grievances;
create policy grievances_own on public.grievances
  for all to authenticated
  using (auth.uid() = user_id or public.is_staff())
  with check (auth.uid() = user_id or public.is_staff());

drop policy if exists awards_read on public.awards;
create policy awards_read on public.awards
  for select to authenticated
  using (true);

drop policy if exists awards_staff_write on public.awards;
create policy awards_staff_write on public.awards
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists user_awards_read on public.user_awards;
create policy user_awards_read on public.user_awards
  for select to authenticated
  using (auth.uid() = user_id or public.is_staff());

drop policy if exists user_awards_staff_write on public.user_awards;
create policy user_awards_staff_write on public.user_awards
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists sns_publications_read on public.sns_publications;
create policy sns_publications_read on public.sns_publications
  for select to anon, authenticated
  using (true);

drop policy if exists sns_publications_staff_write on public.sns_publications;
create policy sns_publications_staff_write on public.sns_publications
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists wordsmith_read on public.wordsmith_entries;
create policy wordsmith_read on public.wordsmith_entries
  for select to authenticated
  using (true);

drop policy if exists wordsmith_staff_write on public.wordsmith_entries;
create policy wordsmith_staff_write on public.wordsmith_entries
  for all to authenticated
  using (public.is_staff() or public.is_center_staff())
  with check (public.is_staff() or public.is_center_staff());

drop policy if exists internship_modules_read on public.internship_modules;
create policy internship_modules_read on public.internship_modules
  for select to authenticated
  using (true);

drop policy if exists internship_batches_staff on public.internship_batches;
create policy internship_batches_staff on public.internship_batches
  for all to authenticated
  using (public.is_staff() or public.is_center_staff())
  with check (public.is_staff() or public.is_center_staff());

drop policy if exists internship_interns_staff on public.internship_interns;
create policy internship_interns_staff on public.internship_interns
  for all to authenticated
  using (public.is_staff() or public.is_center_staff() or auth.uid() = user_id)
  with check (public.is_staff() or public.is_center_staff() or auth.uid() = user_id);

drop policy if exists internship_attendance_staff on public.internship_attendance;
create policy internship_attendance_staff on public.internship_attendance
  for all to authenticated
  using (public.is_staff() or public.is_center_staff())
  with check (public.is_staff() or public.is_center_staff());

drop policy if exists internship_feedback_staff on public.internship_feedback;
create policy internship_feedback_staff on public.internship_feedback
  for all to authenticated
  using (public.is_staff() or public.is_center_staff())
  with check (public.is_staff() or public.is_center_staff());

-- Done. Expect: Success. No need to click a separate “Enable RLS” — already in this script.
