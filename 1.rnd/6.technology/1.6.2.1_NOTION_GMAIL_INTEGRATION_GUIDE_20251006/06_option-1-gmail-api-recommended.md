### Option 1: Gmail API (Recommended)

**Steps:**

1. **Enable Gmail API:**

   ```
   1. Go to https://console.cloud.google.com/
   2. Select project: (your GCP project)
   3. Enable Gmail API
   4. Create OAuth 2.0 credentials
   5. Download credentials.json
   ```

2. **Set Up OAuth:**

   ```bash
   # Copy credentials to repo
   cp ~/Downloads/credentials.json automation/data-pipelines/gmail_credentials.json

   # Run OAuth flow (opens browser)
   node automation/data-pipelines/gmail_auth.js
   ```

3. **Run Gmail Ingestion:**

   ```bash
   # Ingest jesseniesen@gmail.com
   GMAIL_ACCOUNT="jesseniesen@gmail.com" node automation/data-pipelines/gmail_ingest.js

   # Ingest high@reggieanddro.com
   GMAIL_ACCOUNT="high@reggieanddro.com" node automation/data-pipelines/gmail_ingest.js
   ```

**What Gets Ingested:**

- All email subjects and bodies
- Sender/recipient information
- Attachments (saved to Cloud Storage)
- Labels and folders
- Thread relationships
- Date/time metadata

**Output:**

- BigQuery table: `communications.gmail_messages`
- BigQuery table: `communications.gmail_threads`
- BigQuery table: `communications.gmail_attachments`
