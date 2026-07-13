create extension if not exists pgcrypto;

create table families (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  primary_parent_first_name text,
  primary_parent_last_name text,
  email text,
  phone text,

  secondary_parent_first_name text,
  secondary_parent_last_name text,
  secondary_parent_email text,
  secondary_parent_phone text,

  address1 text,
  address2 text,
  city text,
  state text,
  zip text
);

create table players (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,

  first_name text,
  last_name text,
  preferred_name text,

  birthdate date,
  jersey_size text,
  hat_size text,
  bats text,
  throws text,

  school text,
  grade text,

  created_at timestamptz default now()
);