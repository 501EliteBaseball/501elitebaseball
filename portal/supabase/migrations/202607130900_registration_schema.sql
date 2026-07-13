create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Parent account profile
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Household
create table public.families (
  id uuid primary key default gen_random_uuid(),
  primary_parent_id uuid not null unique
    references public.profiles(id) on delete cascade,
  family_name text not null default '',
  address_line_1 text not null default '',
  address_line_2 text not null default '',
  city text not null default '',
  state text not null default '',
  postal_code text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Players belonging to a household
create table public.players (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null
    references public.families(id) on delete cascade,
  first_name text not null default '',
  middle_name text not null default '',
  last_name text not null default '',
  preferred_name text not null default '',
  date_of_birth date,
  gender text not null default '',
  school text not null default '',
  grade text not null default '',
  jersey_number_preference text not null default '',
  bats text not null default '',
  throws text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Household registration record
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null
    references public.families(id) on delete cascade,

  -- Temporary compatibility field for the current single-player wizard.
  -- Multi-player support will replace this with registration_players.
  player_id uuid
    references public.players(id) on delete set null,

  season text not null default '2026',
  current_step integer not null default 1,
  completed_steps integer[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'approved', 'cancelled')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Emergency contact for each player
create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null unique
    references public.players(id) on delete cascade,
  name text not null default '',
  relationship text not null default '',
  phone text not null default '',
  alternate_phone text not null default '',
  authorized_pickup boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Medical information for each player
create table public.medical_profiles (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null unique
    references public.players(id) on delete cascade,
  physician_name text not null default '',
  physician_phone text not null default '',
  insurance_provider text not null default '',
  policy_number text not null default '',
  allergies text not null default '',
  medications text not null default '',
  medical_conditions text not null default '',
  special_instructions text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uniform information for the current registration
create table public.uniform_profiles (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique
    references public.registrations(id) on delete cascade,
  player_id uuid
    references public.players(id) on delete cascade,
  jersey_size text not null default '',
  pants_size text not null default '',
  hat_size text not null default '',
  jersey_name text not null default '',
  jersey_number_preference text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index players_family_id_idx
  on public.players(family_id);

create index registrations_family_id_idx
  on public.registrations(family_id);

create index registrations_status_idx
  on public.registrations(status);

create unique index one_draft_registration_per_family_season
  on public.registrations(family_id, season)
  where status = 'draft';

-- Automatically create a profile when a Supabase user registers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger families_set_updated_at
before update on public.families
for each row execute function public.set_updated_at();

create trigger players_set_updated_at
before update on public.players
for each row execute function public.set_updated_at();

create trigger registrations_set_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

create trigger emergency_contacts_set_updated_at
before update on public.emergency_contacts
for each row execute function public.set_updated_at();

create trigger medical_profiles_set_updated_at
before update on public.medical_profiles
for each row execute function public.set_updated_at();

create trigger uniform_profiles_set_updated_at
before update on public.uniform_profiles
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.players enable row level security;
alter table public.registrations enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.medical_profiles enable row level security;
alter table public.uniform_profiles enable row level security;

create policy "Users manage their own profile"
on public.profiles
for all
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Parents manage their own family"
on public.families
for all
to authenticated
using (primary_parent_id = auth.uid())
with check (primary_parent_id = auth.uid());

create policy "Parents manage players in their family"
on public.players
for all
to authenticated
using (
  exists (
    select 1
    from public.families
    where families.id = players.family_id
      and families.primary_parent_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.families
    where families.id = players.family_id
      and families.primary_parent_id = auth.uid()
  )
);

create policy "Parents manage their family registrations"
on public.registrations
for all
to authenticated
using (
  exists (
    select 1
    from public.families
    where families.id = registrations.family_id
      and families.primary_parent_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.families
    where families.id = registrations.family_id
      and families.primary_parent_id = auth.uid()
  )
);

create policy "Parents manage emergency contacts"
on public.emergency_contacts
for all
to authenticated
using (
  exists (
    select 1
    from public.players
    join public.families on families.id = players.family_id
    where players.id = emergency_contacts.player_id
      and families.primary_parent_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.players
    join public.families on families.id = players.family_id
    where players.id = emergency_contacts.player_id
      and families.primary_parent_id = auth.uid()
  )
);

create policy "Parents manage medical profiles"
on public.medical_profiles
for all
to authenticated
using (
  exists (
    select 1
    from public.players
    join public.families on families.id = players.family_id
    where players.id = medical_profiles.player_id
      and families.primary_parent_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.players
    join public.families on families.id = players.family_id
    where players.id = medical_profiles.player_id
      and families.primary_parent_id = auth.uid()
  )
);

create policy "Parents manage uniform profiles"
on public.uniform_profiles
for all
to authenticated
using (
  exists (
    select 1
    from public.registrations
    join public.families on families.id = registrations.family_id
    where registrations.id = uniform_profiles.registration_id
      and families.primary_parent_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.registrations
    join public.families on families.id = registrations.family_id
    where registrations.id = uniform_profiles.registration_id
      and families.primary_parent_id = auth.uid()
  )
);
