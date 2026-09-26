-- SNS Vol unified platform: extend roles + Center Management schema
-- Applied into the sns-vol Supabase project (single DB).

-- ─── roles ──────────────────────────────────────────────────────────────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('volunteer', 'organiser', 'admin', 'coordinator', 'mentor'));

alter table public.profiles
  add column if not exists centre text;

create or replace function public.is_coordinator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'coordinator'
  );
$$;

create or replace function public.is_mentor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'mentor'
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
    where id = auth.uid()
      and role in ('admin', 'coordinator', 'mentor')
  );
$$;

-- Staff for events desk: admin, organiser, coordinator
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'organiser', 'coordinator')
  );
$$;

create or replace function public.is_center_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'coordinator')
  );
$$;

-- Any signed-in profile (for light centre read: docs/guests list)
create or replace function public.is_authenticated_profile()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (select 1 from public.profiles where id = auth.uid());
$$;

-- ─── centers ────────────────────────────────────────────────────────────────
create table if not exists public.centers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.centers (name) values
  ('Sector 6'),
  ('Sector 19'),
  ('Default')
on conflict (name) do nothing;

-- ─── students ───────────────────────────────────────────────────────────────
create table if not exists public.center_students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class text default '',
  school text default '',
  center text not null default 'Default',
  photo_link text,
  sex text,
  year text,
  dob date,
  remark text,
  status text not null default 'Active',
  guardian text,
  contact text,
  address text,
  hobbies text,
  interest text,
  reco text,
  social text,
  cards text,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists center_students_center_idx on public.center_students (center);
create index if not exists center_students_name_idx on public.center_students (lower(name));

alter table public.center_students enable row level security;

drop policy if exists center_students_select on public.center_students;
create policy center_students_select on public.center_students
  for select to authenticated
  using (public.is_authenticated_profile());

drop policy if exists center_students_write on public.center_students;
create policy center_students_insert on public.center_students
  for insert to authenticated
  with check (public.is_center_staff());

create policy center_students_update on public.center_students
  for update to authenticated
  using (public.is_center_staff());

create policy center_students_delete on public.center_students
  for delete to authenticated
  using (public.is_center_admin());

-- ─── student attendance ─────────────────────────────────────────────────────
create table if not exists public.center_student_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.center_students (id) on delete cascade,
  on_date date not null,
  status text not null check (status in ('Present', 'Absent', 'Leave', 'Holiday')),
  marked_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, on_date)
);

create index if not exists center_student_att_date_idx
  on public.center_student_attendance (on_date);

alter table public.center_student_attendance enable row level security;

create policy center_att_select on public.center_student_attendance
  for select to authenticated
  using (public.is_center_staff() or public.is_authenticated_profile());

create policy center_att_write on public.center_student_attendance
  for all to authenticated
  using (public.is_center_staff())
  with check (public.is_center_staff());

-- ─── mentors (centre staff records; may link to auth profile) ───────────────
create table if not exists public.center_mentors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  name text not null,
  phone text,
  center text not null default 'Default',
  email text,
  photo_link text,
  status text not null default 'Active',
  paid boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists center_mentors_center_idx on public.center_mentors (center);
create index if not exists center_mentors_profile_idx on public.center_mentors (profile_id);

alter table public.center_mentors enable row level security;

create policy center_mentors_select on public.center_mentors
  for select to authenticated
  using (public.is_center_staff() or public.is_authenticated_profile());

create policy center_mentors_insert on public.center_mentors
  for insert to authenticated
  with check (public.is_center_admin());

create policy center_mentors_update on public.center_mentors
  for update to authenticated
  using (public.is_center_admin() or (profile_id = auth.uid()));

create policy center_mentors_delete on public.center_mentors
  for delete to authenticated
  using (public.is_center_admin());

-- ─── mentor PiPo / punch ────────────────────────────────────────────────────
create table if not exists public.center_mentor_punches (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.center_mentors (id) on delete cascade,
  on_date date not null,
  punch_in timestamptz,
  punch_out timestamptz,
  source text not null default 'coordinator'
    check (source in ('coordinator', 'self')),
  approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected')),
  approved_by uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  unique (mentor_id, on_date)
);

alter table public.center_mentor_punches enable row level security;

create policy mentor_punches_select on public.center_mentor_punches
  for select to authenticated
  using (
    public.is_center_admin()
    or exists (
      select 1 from public.center_mentors m
      where m.id = mentor_id and m.profile_id = auth.uid()
    )
  );

create policy mentor_punches_insert on public.center_mentor_punches
  for insert to authenticated
  with check (
    public.is_center_admin()
    or (
      public.is_mentor()
      and exists (
        select 1 from public.center_mentors m
        where m.id = mentor_id and m.profile_id = auth.uid()
      )
    )
  );

create policy mentor_punches_update on public.center_mentor_punches
  for update to authenticated
  using (
    public.is_center_admin()
    or exists (
      select 1 from public.center_mentors m
      where m.id = mentor_id and m.profile_id = auth.uid()
    )
  );

-- ─── mentor leave ───────────────────────────────────────────────────────────
create table if not exists public.center_mentor_leaves (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.center_mentors (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  leave_type text not null default 'Leave',
  reason text,
  status text not null default 'Pending'
    check (status in ('Pending', 'Approved', 'Rejected', 'Cancelled')),
  decided_by uuid references public.profiles (id) on delete set null,
  decision_reason text,
  created_at timestamptz not null default now()
);

alter table public.center_mentor_leaves enable row level security;

create policy mentor_leaves_select on public.center_mentor_leaves
  for select to authenticated
  using (
    public.is_center_admin()
    or exists (
      select 1 from public.center_mentors m
      where m.id = mentor_id and m.profile_id = auth.uid()
    )
  );

create policy mentor_leaves_insert on public.center_mentor_leaves
  for insert to authenticated
  with check (
    public.is_center_admin()
    or exists (
      select 1 from public.center_mentors m
      where m.id = mentor_id and m.profile_id = auth.uid()
    )
  );

create policy mentor_leaves_update on public.center_mentor_leaves
  for update to authenticated
  using (
    public.is_center_admin()
    or exists (
      select 1 from public.center_mentors m
      where m.id = mentor_id and m.profile_id = auth.uid()
    )
  );

-- ─── guest visits ───────────────────────────────────────────────────────────
create table if not exists public.guest_visits (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  address text,
  center text not null,
  guest_type text not null default 'Guest',
  visit_date date not null,
  visit_time time without time zone,
  comments text,
  photo_link text,
  qr_token text unique default encode(gen_random_bytes(16), 'hex'),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guest_visits_date_idx
  on public.guest_visits (visit_date desc);

alter table public.guest_visits enable row level security;

create policy guest_visits_select on public.guest_visits
  for select to authenticated
  using (public.is_authenticated_profile());

create policy guest_visits_insert on public.guest_visits
  for insert to authenticated
  with check (public.is_center_staff() or public.is_authenticated_profile());

create policy guest_visits_update on public.guest_visits
  for update to authenticated
  using (public.is_center_admin());

create policy guest_visits_delete on public.guest_visits
  for delete to authenticated
  using (public.is_admin() or public.is_coordinator());

-- ─── document bookmarks ─────────────────────────────────────────────────────
create table if not exists public.center_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  center text, -- null = all centres
  priority text not null default 'Normal',
  status text not null default 'Active',
  archived boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.center_documents enable row level security;

create policy center_docs_select on public.center_documents
  for select to authenticated
  using (public.is_authenticated_profile() and archived = false);

create policy center_docs_admin_select on public.center_documents
  for select to authenticated
  using (public.is_center_admin());

create policy center_docs_write on public.center_documents
  for all to authenticated
  using (public.is_center_admin())
  with check (public.is_center_admin());

-- ─── course planning ────────────────────────────────────────────────────────
create table if not exists public.center_courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  syllabus text default '',
  mentor_id uuid references public.center_mentors (id) on delete set null,
  center text,
  start_date date,
  end_date date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.center_courses enable row level security;

create policy center_courses_select on public.center_courses
  for select to authenticated
  using (public.is_center_staff());

create policy center_courses_write on public.center_courses
  for all to authenticated
  using (public.is_center_staff())
  with check (public.is_center_staff());

-- ─── wordsmith (minimal, same DB) ───────────────────────────────────────────
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

create policy wordsmith_select on public.wordsmith_entries
  for select to authenticated
  using (public.is_authenticated_profile());

create policy wordsmith_write on public.wordsmith_entries
  for all to authenticated
  using (public.is_staff() or public.is_center_staff())
  with check (public.is_staff() or public.is_center_staff());

-- ─── internship RLS (tables from 019) ───────────────────────────────────────
alter table if exists public.internship_batches enable row level security;
alter table if exists public.internship_modules enable row level security;
alter table if exists public.internship_interns enable row level security;
alter table if exists public.internship_attendance enable row level security;
alter table if exists public.internship_feedback enable row level security;

drop policy if exists internship_batches_all on public.internship_batches;
create policy internship_batches_select on public.internship_batches
  for select to authenticated using (public.is_authenticated_profile());
create policy internship_batches_write on public.internship_batches
  for all to authenticated
  using (public.is_staff() or public.is_center_admin())
  with check (public.is_staff() or public.is_center_admin());

drop policy if exists internship_modules_all on public.internship_modules;
create policy internship_modules_select on public.internship_modules
  for select to authenticated using (true);
create policy internship_modules_write on public.internship_modules
  for all to authenticated
  using (public.is_staff() or public.is_center_admin())
  with check (public.is_staff() or public.is_center_admin());

create policy internship_interns_select on public.internship_interns
  for select to authenticated
  using (
    public.is_staff()
    or public.is_center_staff()
    or user_id = auth.uid()
    or mentor_id = auth.uid()
  );
create policy internship_interns_write on public.internship_interns
  for all to authenticated
  using (public.is_staff() or public.is_center_admin() or mentor_id = auth.uid())
  with check (public.is_staff() or public.is_center_admin() or mentor_id = auth.uid());

create policy internship_att_all on public.internship_attendance
  for all to authenticated
  using (public.is_staff() or public.is_center_staff())
  with check (public.is_staff() or public.is_center_staff());

create policy internship_fb_all on public.internship_feedback
  for all to authenticated
  using (public.is_staff() or public.is_center_staff())
  with check (public.is_staff() or public.is_center_staff());

insert into public.internship_modules (id, title) values
  ('dev', 'Development'),
  ('econ', 'Economics'),
  ('video', 'Video Editing'),
  ('teaching', 'Teaching'),
  ('ops', 'Operations')
on conflict (id) do nothing;
