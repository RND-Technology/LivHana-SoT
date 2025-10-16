### Monthly Tasks

```bash
# Analyze storage usage
gsutil du -sh gs://livhana-gmail-attachments

# Optimize BigQuery tables
bq query --use_legacy_sql=false "
  SELECT
    table_name,
    ROUND(size_bytes / 1024 / 1024 / 1024, 2) as size_gb,
    row_count
  FROM \`communications.__TABLES__\`
  WHERE table_name LIKE 'gmail_%'
"
```
