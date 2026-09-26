-- Senior internship schema (apply when DB credentials ready).
-- Not wired to the UI yet — UI uses local demo store.

-- Optional: extend profiles.role later with internship personas,
-- or keep a separate internship_staff table mapped to auth users.

create table if not exists internship_batches (
  id uuid primary key default gen_random_uuid(),
  wing text not null check (wing in ('junior', 'senior')),
  title text not null,
  start_date date not null,
  end_date date not null,
  centre text,
  created_at timestamptz not null default now()
);

create table if not exists internship_modules (
  id text primary key,
  title text not null
);

create table if not exists internship_interns (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references internship_batches (id) on delete cascade,
  user_id uuid references profiles (id) on delete set null,
  name text not null,
  school text,
  phone text,
  preferred_module text,
  allotted_module text,
  mentor_id uuid references profiles (id) on delete set null,
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

create table if not exists internship_attendance (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references internship_interns (id) on delete cascade,
  on_date date not null,
  mark text not null check (mark in ('present', 'absent', 'leave', 'unmarked')),
  marked_by uuid references profiles (id) on delete set null,
  unique (intern_id, on_date)
);

create table if not exists internship_feedback (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references internship_interns (id) on delete cascade,
  mentor_id uuid references profiles (id) on delete set null,
  body text not null,
  submitted_work boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS policies intentionally omitted until role model is finalized.
