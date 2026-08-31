-- Allow staff (admin + organiser) to revoke awards from volunteers

create policy "user_awards_staff_delete"
  on public.user_awards for delete
  using (public.is_staff());
