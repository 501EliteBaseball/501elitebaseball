create table if not exists public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  event_type text not null default 'practice' check (event_type in ('practice','game','tournament','meeting','deadline','other')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  arrival_at timestamptz,
  location_name text not null default '',
  location_address text not null default '',
  notes text not null default '',
  audience text not null default 'all' check (audience in ('all','families','staff')),
  status text not null default 'scheduled' check (status in ('scheduled','cancelled')),
  recurrence_group_id uuid,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists schedule_events_starts_at_idx on public.schedule_events(starts_at);
create index if not exists schedule_events_recurrence_idx on public.schedule_events(recurrence_group_id);
alter table public.schedule_events enable row level security;

create policy "Authenticated families view published schedule"
on public.schedule_events for select to authenticated
using (
  audience in ('all','families') or exists (
    select 1 from public.organization_members m
    where m.user_id = auth.uid() and m.active
  )
);

create policy "Staff manage schedule"
on public.schedule_events for all to authenticated
using (exists (select 1 from public.organization_members m where m.user_id=auth.uid() and m.active and m.role in ('coach','executive','admin')))
with check (exists (select 1 from public.organization_members m where m.user_id=auth.uid() and m.active and m.role in ('coach','executive','admin')));

create table if not exists public.schedule_event_changes (
  id bigint generated always as identity primary key,
  event_id uuid not null,
  change_type text not null check (change_type in ('created','updated','cancelled','deleted')),
  changed_by uuid not null references auth.users(id),
  changed_at timestamptz not null default now()
);
alter table public.schedule_event_changes enable row level security;
create policy "Staff view schedule changes" on public.schedule_event_changes for select to authenticated
using (exists (select 1 from public.organization_members m where m.user_id=auth.uid() and m.active));

create or replace function public.log_schedule_event_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if tg_op='INSERT' then insert into public.schedule_event_changes(event_id,change_type,changed_by) values(new.id,'created',new.created_by); return new;
  elsif tg_op='UPDATE' then insert into public.schedule_event_changes(event_id,change_type,changed_by) values(new.id,case when new.status='cancelled' and old.status<>'cancelled' then 'cancelled' else 'updated' end,auth.uid()); return new;
  else insert into public.schedule_event_changes(event_id,change_type,changed_by) values(old.id,'deleted',auth.uid()); return old; end if;
end; $$;
drop trigger if exists schedule_event_change_log on public.schedule_events;
create trigger schedule_event_change_log after insert or update or delete on public.schedule_events for each row execute function public.log_schedule_event_change();
grant select on public.schedule_events to authenticated;
grant insert,update,delete on public.schedule_events to authenticated;
grant select on public.schedule_event_changes to authenticated;
