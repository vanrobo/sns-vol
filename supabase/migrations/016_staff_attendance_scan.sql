-- Allow staff to view and record attendance when scanning volunteer I-Cards

drop policy if exists "attendance_select_own_or_admin" on public.attendance;

create policy "attendance_select_own_or_staff"
  on public.attendance for select
  using (auth.uid() = user_id or public.is_staff());

create policy "attendance_insert_staff"
  on public.attendance for insert
  with check (public.is_staff());
