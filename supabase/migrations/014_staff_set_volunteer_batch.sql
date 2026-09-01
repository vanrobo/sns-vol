-- Staff (admin + organiser) may set volunteer batch labels without full profile admin rights

create or replace function public.set_volunteer_batch(p_user_id uuid, p_batch text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Staff access required';
  end if;

  update public.profiles
  set batch = nullif(trim(p_batch), '')
  where id = p_user_id;
end;
$$;

grant execute on function public.set_volunteer_batch(uuid, text) to authenticated;
