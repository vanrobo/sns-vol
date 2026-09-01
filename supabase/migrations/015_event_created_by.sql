-- Track which staff member created each event (organiser-scoped management)

alter table public.events
  add column if not exists created_by uuid references public.profiles (id) on delete set null;

create index if not exists events_created_by_idx on public.events (created_by);

drop policy if exists "events_staff_update" on public.events;
drop policy if exists "events_staff_delete" on public.events;

create policy "events_staff_update"
  on public.events for update
  using (
    public.is_admin()
    or (public.is_organiser() and created_by = auth.uid())
  );

create policy "events_staff_delete"
  on public.events for delete
  using (
    public.is_admin()
    or (public.is_organiser() and created_by = auth.uid())
  );
