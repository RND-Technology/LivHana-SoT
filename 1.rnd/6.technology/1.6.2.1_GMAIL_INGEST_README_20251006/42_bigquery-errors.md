### BigQuery Errors

**Error:** `Table not found`

**Solution:**

```bash
# Create tables
bq query --use_legacy_sql=false < gmail_bigquery_schema.sql
```

**Error:** `Permission denied`

**Solution:**

```bash
# Grant BigQuery permissions
gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/bigquery.dataEditor"
```
