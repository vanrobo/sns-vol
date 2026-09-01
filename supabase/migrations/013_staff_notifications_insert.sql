-- Allow staff (admin + organiser) to insert notifications for volunteers
-- Required when award grant / application updates notify other users

create policy "notifications_staff_insert"
  on public.notifications for insert
  with check (public.is_staff());
