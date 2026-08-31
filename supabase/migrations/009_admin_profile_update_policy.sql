-- Allow admins to update any profile row (explicit update policy)

drop policy if exists "profiles_admin_update" on public.profiles;

create policy "profiles_admin_update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());
