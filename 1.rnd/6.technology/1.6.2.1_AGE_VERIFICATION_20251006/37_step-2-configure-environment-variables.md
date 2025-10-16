## Step 2: Configure Environment Variables

Add to your `.env` file (or 1Password reference):

```bash
# Age Verification Configuration
AGE_VERIFICATION_ENCRYPTION_KEY=op://LivHana-Ops-Keys/AGE_VERIFICATION_ENCRYPTION_KEY/password

# BigQuery (should already be configured)
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-key.json
BIGQUERY_ENABLED=true
BQ_DATASET=commerce
```

---
