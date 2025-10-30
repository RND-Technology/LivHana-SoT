-- RPM Exports lifecycle columns
alter table if exists rpm_exports
  add column if not exists status text not null default 'queued' check (status in ('queued','processing','completed','failed')),
  add column if not exists job_id text,
  add column if not exists error text,
  add column if not exists completed_at timestamptz,
  add column if not exists failed_at timestamptz;

-- Helpful indexes
create index if not exists idx_rpm_exports_status on rpm_exports(status);
create index if not exists idx_rpm_exports_week_status on rpm_exports(week_id, status);


