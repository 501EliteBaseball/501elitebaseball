create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  audience text not null default 'public_homepage'
    check (audience in ('public_homepage', 'family_os', 'coach_dashboard')),
  title text not null check (char_length(trim(title)) between 1 and 120),
  message text not null check (char_length(trim(message)) between 1 and 500),
  button_text text check (
    button_text is null or char_length(trim(button_text)) between 1 and 40
  ),
  link_url text,
  priority text not null default 'normal'
    check (priority in ('normal', 'important', 'urgent')),
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_schedule_is_valid
    check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint announcements_button_is_complete
    check ((button_text is null) = (link_url is null)),
  constraint announcements_link_is_valid
    check (
      link_url is null
      or link_url ~ '^/'
      or link_url ~* '^https?://'
    )
);

create index if not exists announcements_public_schedule_idx
  on public.announcements (audience, active, starts_at, ends_at);

create index if not exists announcements_display_order_idx
  on public.announcements (audience, display_order, created_at);

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;

drop policy if exists "Public can read current homepage announcements"
  on public.announcements;
create policy "Public can read current homepage announcements"
on public.announcements
for select
to anon, authenticated
using (
  audience = 'public_homepage'
  and active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
);

drop policy if exists "Executives can read announcements"
  on public.announcements;
create policy "Executives can read announcements"
on public.announcements
for select
to authenticated
using (
  public.is_active_organization_member(
    array['executive', 'admin']
  )
);

drop policy if exists "Executives can create announcements"
  on public.announcements;
create policy "Executives can create announcements"
on public.announcements
for insert
to authenticated
with check (
  public.is_active_organization_member(
    array['executive', 'admin']
  )
);

drop policy if exists "Executives can update announcements"
  on public.announcements;
create policy "Executives can update announcements"
on public.announcements
for update
to authenticated
using (
  public.is_active_organization_member(
    array['executive', 'admin']
  )
)
with check (
  public.is_active_organization_member(
    array['executive', 'admin']
  )
);

drop policy if exists "Executives can delete announcements"
  on public.announcements;
create policy "Executives can delete announcements"
on public.announcements
for delete
to authenticated
using (
  public.is_active_organization_member(
    array['executive', 'admin']
  )
);

grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;

create or replace function public.swap_homepage_announcement_order(
  first_announcement_id uuid,
  second_announcement_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  first_order integer;
  second_order integer;
begin
  if not public.is_active_organization_member(array['executive', 'admin']) then
    raise exception 'Executive access is required.';
  end if;

  select display_order
    into first_order
    from public.announcements
    where id = first_announcement_id
      and audience = 'public_homepage'
    for update;

  select display_order
    into second_order
    from public.announcements
    where id = second_announcement_id
      and audience = 'public_homepage'
    for update;

  if first_order is null or second_order is null then
    raise exception 'Both homepage announcements must exist.';
  end if;

  update public.announcements
    set display_order = case
      when id = first_announcement_id then second_order
      when id = second_announcement_id then first_order
      else display_order
    end
    where id in (first_announcement_id, second_announcement_id)
      and audience = 'public_homepage';
end;
$$;

grant execute on function public.swap_homepage_announcement_order(uuid, uuid)
  to authenticated;

comment on table public.announcements is
  'Scheduled announcements for public, family, and staff-facing surfaces.';
