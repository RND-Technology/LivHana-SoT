create table if not exists rpm_weeks (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end date not null,
  version int not null default 1,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  status text not null default 'Backlog',
  due_date date,
  cialdini jsonb,
  compliance_flags jsonb,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rpm_exports (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references rpm_weeks(id) on delete cascade,
  format text not null,
  url text not null,
  created_at timestamptz not null default now()
);


