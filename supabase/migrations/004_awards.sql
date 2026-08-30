-- Awards system: staff create awards, grant to volunteers

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  event_id uuid references public.events (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.user_awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  award_id uuid not null references public.awards (id) on delete cascade,
  awarded_by uuid references public.profiles (id) on delete set null,
  awarded_at timestamptz not null default now(),
  unique (user_id, award_id)
);

create index user_awards_user_idx on public.user_awards (user_id);
create index user_awards_award_idx on public.user_awards (award_id);

alter table public.awards enable row level security;
alter table public.user_awards enable row level security;

create policy "awards_select_authenticated"
  on public.awards for select
  to authenticated
  using (true);

create policy "awards_staff_insert"
  on public.awards for insert
  with check (public.is_staff());

create policy "awards_staff_update"
  on public.awards for update
  using (public.is_staff());

create policy "awards_admin_delete"
  on public.awards for delete
  using (public.is_admin());

create policy "user_awards_select_own_or_staff"
  on public.user_awards for select
  using (auth.uid() = user_id or public.is_staff());

create policy "user_awards_staff_insert"
  on public.user_awards for insert
  with check (public.is_staff());

create policy "user_awards_admin_delete"
  on public.user_awards for delete
  using (public.is_admin());

-- Extend notification types
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('event', 'grievance', 'application', 'icard', 'award'));

-- Notify volunteer when awarded
create or replace function public.notify_award_granted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  award_title text;
begin
  select title into award_title from public.awards where id = new.award_id;
  insert into public.notifications (user_id, title, body, type)
  values (
    new.user_id,
    'New award received!',
    coalesce(award_title, 'Award') || ' — congratulations on your contribution.',
    'award'
  );
  return new;
end;
$$;

create trigger user_awards_notify
  after insert on public.user_awards
  for each row execute function public.notify_award_granted();
