-- SNS Vol — initial schema (clean start)
-- Run this in the Supabase SQL editor, then set an admin:
--   update public.profiles set role = 'admin' where id = (
--     select id from auth.users where email = 'YOUR_ADMIN_EMAIL@example.com'
--   );

create extension if not exists "pgcrypto";

-- ─── profiles ───────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  college text not null default '',
  phone text default '',
  address text default '',
  skills text[] not null default '{}',
  role text not null default 'volunteer' check (role in ('volunteer', 'admin')),
  volunteer_id text,
  valid_until date,
  status text not null default 'pending' check (status in ('pending', 'active', 'inactive')),
  avatar_url text,
  email_notifs boolean not null default true,
  public_profile boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_status_idx on public.profiles (status);

-- ─── events ─────────────────────────────────────────────────────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  venue text not null,
  description text not null default '',
  criteria text not null default 'Student',
  status text not null default 'active' check (status in ('active', 'closed')),
  required_skills text[] not null default '{}',
  category text not null default 'Community',
  coordinator_phone text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_status_idx on public.events (status);
create index events_date_idx on public.events (date);

-- ─── applications ───────────────────────────────────────────────────────────
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create index applications_user_idx on public.applications (user_id);
create index applications_event_idx on public.applications (event_id);

-- ─── feedbacks ──────────────────────────────────────────────────────────────
create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  star_rating int not null check (star_rating between 1 and 5),
  comment text default '',
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

-- ─── grievances ─────────────────────────────────────────────────────────────
create table public.grievances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index grievances_user_idx on public.grievances (user_id);
create index grievances_status_idx on public.grievances (status);

-- ─── notifications ──────────────────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  type text not null default 'event' check (type in ('event', 'grievance', 'application', 'icard')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

-- ─── attendance ─────────────────────────────────────────────────────────────
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  marked_at timestamptz not null default now(),
  unique (user_id, event_id)
);

-- ─── helpers ────────────────────────────────────────────────────────────────
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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, college)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'college', '')
  );
  insert into public.notifications (user_id, title, body, type)
  values (
    new.id,
    'Welcome to SNS!',
    'Complete your profile details to get matched with upcoming campaigns.',
    'event'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create trigger grievances_updated_at
  before update on public.grievances
  for each row execute function public.set_updated_at();

-- Notify on application status change
create or replace function public.notify_application_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  evt_title text;
begin
  if old.status is distinct from new.status and new.status in ('approved', 'declined') then
    select title into evt_title from public.events where id = new.event_id;
    insert into public.notifications (user_id, title, body, type)
    values (
      new.user_id,
      case when new.status = 'approved' then 'Application approved' else 'Application declined' end,
      coalesce(evt_title, 'Event') || ' — your interest was marked ' || new.status || '.',
      'application'
    );
  end if;
  return new;
end;
$$;

create trigger applications_notify
  after update on public.applications
  for each row execute function public.notify_application_status();

-- Notify on grievance resolution
create or replace function public.notify_grievance_resolved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status and new.status = 'resolved' then
    insert into public.notifications (user_id, title, body, type)
    values (
      new.user_id,
      'Grievance resolved',
      coalesce(new.admin_notes, 'Your complaint ticket has been resolved.'),
      'grievance'
    );
  end if;
  return new;
end;
$$;

create trigger grievances_notify
  after update on public.grievances
  for each row execute function public.notify_grievance_resolved();

-- Notify on I-Card activation
create or replace function public.notify_icard_activated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status and new.status = 'active'
     and new.volunteer_id is not null then
    insert into public.notifications (user_id, title, body, type)
    values (
      new.id,
      'Digital I-Card activated',
      'Your volunteer ID ' || new.volunteer_id || ' is ready. Open I-Card to view it.',
      'icard'
    );
  end if;
  return new;
end;
$$;

create trigger profiles_icard_notify
  after update on public.profiles
  for each row execute function public.notify_icard_activated();

-- Prevent volunteers from escalating role / forging I-Cards
create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.volunteer_id := old.volunteer_id;
    new.valid_until := old.valid_until;
    if new.status = 'active' and old.status is distinct from 'active' then
      new.status := old.status;
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_admin_fields
  before update on public.profiles
  for each row execute function public.protect_profile_admin_fields();

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.applications enable row level security;
alter table public.feedbacks enable row level security;
alter table public.grievances enable row level security;
alter table public.notifications enable row level security;
alter table public.attendance enable row level security;

-- profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_select_public_active"
  on public.profiles for select
  using (public_profile = true and status = 'active');

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_admin_all"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- events
create policy "events_select_authenticated"
  on public.events for select
  to authenticated
  using (true);

create policy "events_admin_insert"
  on public.events for insert
  with check (public.is_admin());

create policy "events_admin_update"
  on public.events for update
  using (public.is_admin());

create policy "events_admin_delete"
  on public.events for delete
  using (public.is_admin());

-- applications
create policy "applications_select_own_or_admin"
  on public.applications for select
  using (auth.uid() = user_id or public.is_admin());

create policy "applications_insert_own"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "applications_delete_own_pending"
  on public.applications for delete
  using (auth.uid() = user_id and status = 'pending');

create policy "applications_admin_update"
  on public.applications for update
  using (public.is_admin());

-- feedbacks
create policy "feedbacks_select_own_or_admin"
  on public.feedbacks for select
  using (auth.uid() = user_id or public.is_admin());

create policy "feedbacks_insert_own"
  on public.feedbacks for insert
  with check (auth.uid() = user_id);

-- grievances
create policy "grievances_select_own_or_admin"
  on public.grievances for select
  using (auth.uid() = user_id or public.is_admin());

create policy "grievances_insert_own"
  on public.grievances for insert
  with check (auth.uid() = user_id);

create policy "grievances_admin_update"
  on public.grievances for update
  using (public.is_admin());

-- notifications
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_admin_insert"
  on public.notifications for insert
  with check (public.is_admin() or auth.uid() = user_id);

-- attendance
create policy "attendance_select_own_or_admin"
  on public.attendance for select
  using (auth.uid() = user_id or public.is_admin());

create policy "attendance_insert_own"
  on public.attendance for insert
  with check (auth.uid() = user_id);

-- ─── storage: avatars ───────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
