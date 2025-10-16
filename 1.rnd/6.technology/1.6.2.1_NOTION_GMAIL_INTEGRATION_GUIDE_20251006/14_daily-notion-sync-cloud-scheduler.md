### Daily Notion Sync (Cloud Scheduler)

```bash
# Create Cloud Scheduler job
gcloud scheduler jobs create http notion-daily-sync \\
  --schedule="0 2 * * *" \\
  --uri="https://YOUR_CLOUD_RUN_URL/api/sync/notion" \\
  --http-method=POST \\
  --oidc-service-account-email=SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com
```
