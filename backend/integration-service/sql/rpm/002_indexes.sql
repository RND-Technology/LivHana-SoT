create index if not exists idx_rpm_items_week on rpm_items(week_id);
create index if not exists idx_rpm_items_status_owner on rpm_items(status, owner_role);
create index if not exists idx_rpm_exports_week_format on rpm_exports(week_id, format);


