### Issue: "BigQuery not configured"

**Solution:** Set required environment variables:

```bash
export GCP_PROJECT_ID="your-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
export BIGQUERY_ENABLED=true
```
