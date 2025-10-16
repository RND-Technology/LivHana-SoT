### Daily Incremental Sync

Set up Cloud Scheduler to run daily:

```bash
# Create Cloud Scheduler job
gcloud scheduler jobs create http gmail-daily-sync \
  --schedule="0 2 * * *" \
  --uri="https://us-central1-${GCP_PROJECT_ID}.cloudfunctions.net/gmail-ingest" \
  --http-method=POST \
  --location=us-central1 \
  --time-zone="America/Chicago"
```
