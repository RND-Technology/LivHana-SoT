# Gmail Ingestion - Quick Start Guide

Get up and running with Gmail ingestion in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- Google Cloud account with billing enabled
- Access to <jesseniesen@gmail.com> and <high@reggieanddro.com>

## Step 1: Install Dependencies (2 minutes)

```bash
cd automation/data-pipelines
npm install
```

## Step 2: Google Cloud Setup (5 minutes)

### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing: "LivHana Trinity"
3. Enable Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search "Gmail API" and click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Configure consent screen if prompted:
     - User Type: Internal (or External)
     - App name: "LivHana Gmail Ingestion"
     - Scopes: Add `gmail.readonly`, `gmail.metadata`, `gmail.labels`
   - Application type: **Desktop app**
   - Name: "Gmail Ingestion - Jessen"
   - Click "Create" and download JSON
   - Save as `gmail_credentials_jessen.json`

5. Repeat for second account:
   - Name: "Gmail Ingestion - High"
   - Save as `gmail_credentials_high.json`

### Create BigQuery Dataset

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"

# Create dataset
bq mk --dataset \
  --location=US \
  --description="Gmail communications data" \
  ${GCP_PROJECT_ID}:communications

# Create tables
bq query --use_legacy_sql=false < gmail_bigquery_schema.sql
```

### Create Cloud Storage Bucket

```bash
gsutil mb -l us -c STANDARD gs://livhana-gmail-attachments
```

## Step 3: Authenticate Accounts (2 minutes)

```bash
# Authenticate Jessen's account
npm run gmail:auth:jessen
# Browser will open, sign in with jesseniesen@gmail.com

# Authenticate R&D account
npm run gmail:auth:high
# Browser will open, sign in with high@reggieanddro.com
```

## Step 4: Test Setup (1 minute)

```bash
npm run gmail:test
```

Expected output:

```
Testing: Environment variables... ✅ PASS
Testing: Account configuration... ✅ PASS
Testing: Credentials files exist... ✅ PASS
Testing: Token files exist... ✅ PASS
Testing: OAuth client creation... ✅ PASS
Testing: Gmail API connection... ✅ PASS
...
🎉 All tests passed!
```

## Step 5: Run Initial Ingestion

```bash
# Test with 10 emails first
npm run gmail:ingest -- --max=10

# Once confirmed working, run full sync
npm run gmail:ingest:full
```

## That's it

Your Gmail data is now in BigQuery. Query it:

```sql
SELECT
  subject,
  from_email,
  timestamp,
  snippet
FROM `communications.gmail_messages`
WHERE account_email = 'jesseniesen@gmail.com'
ORDER BY timestamp DESC
LIMIT 10;
```

## Daily Automation

Set up Cloud Scheduler for daily incremental sync:

```bash
gcloud scheduler jobs create http gmail-daily-sync \
  --schedule="0 2 * * *" \
  --uri="https://your-cloud-function-url" \
  --http-method=POST \
  --location=us-central1
```

## Troubleshooting

### "Credentials file not found"

Download OAuth credentials from Google Cloud Console and save as `gmail_credentials_*.json`

### "Token has been expired"

Re-authenticate: `npm run gmail:auth:jessen`

### "Permission denied" on BigQuery

Grant permissions:

```bash
gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/bigquery.dataEditor"
```

## Next Steps

- Read [GMAIL_INGEST_README.md](./GMAIL_INGEST_README.md) for full documentation
- Set up daily automation
- Create custom BigQuery views for your use cases
- Integrate with Looker/Data Studio for visualization

## Support

Questions? Check the full README or test suite for troubleshooting guidance.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->
