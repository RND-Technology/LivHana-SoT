-- RPM Evergreen schema (AlloyDB/Postgres)
create extension if not exists pgcrypto;

create table if not exists rpm_weeks (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end date not null,
  version int not null default 1,
  status text not null default 'active' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (week_start, week_end)
);

create table if not exists rpm_items (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references rpm_weeks(id) on delete cascade,
  title text not null,
  result text,
  purpose text,
  map_json jsonb,
  owner_role text,
  owner_user text,
  status text not null default 'backlog' check (status in ('backlog','ready','doing','review','done','blocked')),
  due_date date,
  cialdini text[],
  compliance_flags text[],
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rpm_exports (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references rpm_weeks(id) on delete cascade,
  format text not null check (format in ('md','csv','pdf')),
  gcs_path text,
  url text,
  sha256 text,
  created_at timestamptz not null default now()
);


