alter table public.family_accounts alter column family_id drop not null;
alter table public.family_accounts add column if not exists display_name text not null default '';

update public.family_accounts account
set display_name = family.family_name
from public.families family
where account.family_id = family.id and account.display_name = '';

create or replace function public.create_family_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.family_accounts(family_id, display_name)
  values(new.id, new.family_name)
  on conflict (family_id) do update set display_name=excluded.display_name, updated_at=now();
  return new;
end; $$;
