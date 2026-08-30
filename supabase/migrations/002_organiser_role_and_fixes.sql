-- SNS Vol — organiser role, staff RLS, feedback update policy

-- Extend role enum
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('volunteer', 'organiser', 'admin'));

-- Staff helpers
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
  select public.is_admin() or public.is_organiser();
$$;

-- Only admins may change role / I-Card fields (organisers included in block)
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

-- profiles: staff can read for application desk
create policy "profiles_select_staff"
  on public.profiles for select
  using (public.is_staff());

-- events: staff may manage
drop policy if exists "events_admin_insert" on public.events;
drop policy if exists "events_admin_update" on public.events;
drop policy if exists "events_admin_delete" on public.events;

create policy "events_staff_insert"
  on public.events for insert
  with check (public.is_staff());

create policy "events_staff_update"
  on public.events for update
  using (public.is_staff());

create policy "events_staff_delete"
  on public.events for delete
  using (public.is_staff());

-- applications: staff may update / read all
drop policy if exists "applications_select_own_or_admin" on public.applications;
drop policy if exists "applications_admin_update" on public.applications;

create policy "applications_select_own_or_staff"
  on public.applications for select
  using (auth.uid() = user_id or public.is_staff());

create policy "applications_staff_update"
  on public.applications for update
  using (public.is_staff());

-- feedbacks: allow own updates (re-submit via upsert)
create policy "feedbacks_update_own"
  on public.feedbacks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow volunteers to withdraw declined applications (re-apply)
drop policy if exists "applications_delete_own_pending" on public.applications;

create policy "applications_delete_own_pending_or_declined"
  on public.applications for delete
  using (auth.uid() = user_id and status in ('pending', 'declined'));
