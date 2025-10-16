### Daily Gmail Sync (Cloud Scheduler)

```bash
# Create Cloud Scheduler job
gcloud scheduler jobs create http gmail-daily-sync \\
  --schedule="0 3 * * *" \\
  --uri="https://YOUR_CLOUD_RUN_URL/api/sync/gmail" \\
  --http-method=POST \\
  --oidc-service-account-email=SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com
```

---
