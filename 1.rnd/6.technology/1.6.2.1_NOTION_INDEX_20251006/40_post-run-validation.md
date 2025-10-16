### Post-run Validation

```bash
# Check markdown files
ls -lh data/notion_export/

# Query BigQuery
npm run notion:query

# Check row count
bq query --use_legacy_sql=false \
  'SELECT COUNT(*) FROM knowledge.notion_pages'
```

---
