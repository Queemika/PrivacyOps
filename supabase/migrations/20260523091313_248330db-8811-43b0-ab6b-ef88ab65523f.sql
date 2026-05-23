
create or replace function public.claim_first_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare existing int;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select count(*) into existing from public.user_roles where role = 'Admin';
  if existing > 0 then
    return false;
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'Admin')
  on conflict do nothing;
  return true;
end;
$$;
