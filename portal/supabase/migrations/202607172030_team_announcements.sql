create table if not exists public.team_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 2000),
  priority text not null default 'normal' check (priority in ('normal','important','urgent')),
  status text not null default 'draft' check (status in ('draft','published')),
  audience text not null default 'families' check (audience in ('all','families','staff')),
  link_label text not null default '',
  link_url text not null default '',
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_announcements_publish_idx
  on public.team_announcements(status, publish_at desc);

create table if not exists public.team_announcement_reads (
  announcement_id uuid not null references public.team_announcements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

alter table public.team_announcements enable row level security;
alter table public.team_announcement_reads enable row level security;

create policy "Families view active announcements"
on public.team_announcements for select to authenticated
using (
  (status = 'published' and publish_at <= now() and (expires_at is null or expires_at > now()) and audience in ('all','families'))
  or exists (select 1 from public.organization_members m where m.user_id=auth.uid() and m.active)
);

create policy "Staff manage announcements"
on public.team_announcements for all to authenticated
using (exists (select 1 from public.organization_members m where m.user_id=auth.uid() and m.active and m.role in ('coach','executive','admin')))
with check (exists (select 1 from public.organization_members m where m.user_id=auth.uid() and m.active and m.role in ('coach','executive','admin')));

create policy "Families manage their announcement reads"
on public.team_announcement_reads for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update, delete on public.team_announcements to authenticated;
grant select, insert, update, delete on public.team_announcement_reads to authenticated;
