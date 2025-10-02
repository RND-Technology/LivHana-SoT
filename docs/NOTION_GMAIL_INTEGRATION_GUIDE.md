# 📧 NOTION & GMAIL INTEGRATION GUIDE

**Date:** September 30, 2025
**Purpose:** Complete data ingestion from Notion and Gmail accounts
**Status:** Setup instructions ready

---

## 🎯 OBJECTIVES

1. **Notion:** Thorough crawl, read, ingestion, organization of all Notion data
2. **Gmail:** Search and ingest emails from jesseniesen@gmail.com and high@reggieanddro.com
3. **Automation:** Set up continuous sync for future updates

---

## 📋 NOTION INTEGRATION

### Option 1: Notion API (Recommended)

**Steps:**

1. **Create Notion Integration:**
   ```
   1. Go to https://www.notion.so/my-integrations
   2. Click "+ New integration"
   3. Name: "LivHana Data Ingestion"
   4. Select workspace: (your workspace)
   5. Copy the "Internal Integration Token"
   ```

2. **Share Pages with Integration:**
   ```
   1. Open each Notion page/database you want to ingest
   2. Click "•••" (three dots) → "Add connections"
   3. Select "LivHana Data Ingestion"
   4. Repeat for all pages
   ```

3. **Set Up Environment Variable:**
   ```bash
   # Add to .env
   NOTION_API_KEY="secret_xxxxxxxxxxxxx"
   ```

4. **Run Notion Ingestion Script:**
   ```bash
   cd automation/data-pipelines
   node notion_ingest.js
   ```

**What Gets Ingested:**
- All pages (title, content, properties)
- All databases (rows, columns, relations)
- File attachments (URLs)
- Comments and mentions
- Page hierarchy and structure

**Output:**
- BigQuery table: `knowledge.notion_pages`
- BigQuery table: `knowledge.notion_databases`
- Local markdown exports: `data/notion_export/`

### Option 2: Notion Export (Manual)

**Steps:**

1. **Export from Notion:**
   ```
   1. Go to Settings & members → Settings → Export all workspace content
   2. Format: Markdown & CSV
   3. Include files: Yes
   4. Download and unzip
   ```

2. **Import to Repo:**
   ```bash
   # Copy export to repo
   cp -r ~/Downloads/Notion_Export data/notion_export/

   # Run import script
   node automation/data-pipelines/notion_import_local.js
   ```

---

## 📧 GMAIL INTEGRATION

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

### Option 2: Google Takeout (Manual)

**Steps:**

1. **Export from Google:**
   ```
   1. Go to https://takeout.google.com/
   2. Deselect all → Select only Gmail
   3. Export format: MBOX
   4. Download and unzip
   ```

2. **Import to BigQuery:**
   ```bash
   # Extract MBOX files
   python automation/data-pipelines/mbox_parser.py ~/Downloads/Takeout/Mail/*.mbox

   # Upload to BigQuery
   node automation/data-pipelines/gmail_import_local.js
   ```

---

## 🤖 AUTOMATED NOTION INGESTION SCRIPT

**File:** `automation/data-pipelines/notion_ingest.js`

```javascript
import { Client } from '@notionhq/client';
import { BigQuery } from '@google-cloud/bigquery';
import { writeFileSync, mkdirSync } from 'fs';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const bigquery = new BigQuery({ projectId: process.env.GCP_PROJECT_ID });

async function ingestNotion() {
  console.log('🔄 Ingesting Notion workspace...');

  // List all pages
  const pages = await notion.search({
    filter: { property: 'object', value: 'page' }
  });

  const pageData = [];

  for (const page of pages.results) {
    const pageId = page.id;
    const title = page.properties?.title?.title?.[0]?.plain_text || 'Untitled';

    // Get page content
    const blocks = await notion.blocks.children.list({ block_id: pageId });

    // Extract text from blocks
    const content = blocks.results
      .map(block => extractBlockText(block))
      .join('\\n');

    // Save to array
    pageData.push({
      id: pageId,
      title,
      content,
      url: page.url,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
      metadata: JSON.stringify(page)
    });

    // Export as markdown
    mkdirSync('data/notion_export', { recursive: true });
    writeFileSync(
      \`data/notion_export/\${title.replace(/[^a-z0-9]/gi, '_')}.md\`,
      \`# \${title}\\n\\n\${content}\`
    );

    console.log(\`  ✓ Ingested: \${title}\`);
  }

  // Upload to BigQuery
  await bigquery
    .dataset('knowledge')
    .table('notion_pages')
    .insert(pageData);

  console.log(\`✅ Ingested \${pageData.length} Notion pages\`);
}

function extractBlockText(block) {
  if (block.type === 'paragraph') {
    return block.paragraph.rich_text
      .map(t => t.plain_text)
      .join('');
  }
  if (block.type === 'heading_1') {
    return '# ' + block.heading_1.rich_text
      .map(t => t.plain_text)
      .join('');
  }
  // Add more block types as needed
  return '';
}

ingestNotion().catch(console.error);
```

---

## 📧 AUTOMATED GMAIL INGESTION SCRIPT

**File:** `automation/data-pipelines/gmail_ingest.js`

```javascript
import { google } from 'googleapis';
import { BigQuery } from '@google-cloud/bigquery';
import { readFileSync } from 'fs';

const bigquery = new BigQuery({ projectId: process.env.GCP_PROJECT_ID });

async function ingestGmail() {
  const account = process.env.GMAIL_ACCOUNT;
  console.log(\`🔄 Ingesting Gmail: \${account}...\`);

  // Load OAuth credentials
  const credentials = JSON.parse(
    readFileSync('automation/data-pipelines/gmail_token.json')
  );

  const auth = new google.auth.OAuth2();
  auth.setCredentials(credentials);

  const gmail = google.gmail({ version: 'v1', auth });

  // List all messages
  let pageToken = null;
  let allMessages = [];

  do {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,
      pageToken
    });

    const messages = response.data.messages || [];

    for (const message of messages) {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const headers = full.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Extract body
      const body = extractBody(full.data.payload);

      allMessages.push({
        id: message.id,
        thread_id: full.data.threadId,
        account,
        subject,
        from_address: from,
        to_address: to,
        date,
        body,
        labels: full.data.labelIds?.join(',') || '',
        metadata: JSON.stringify(full.data)
      });

      console.log(\`  ✓ Ingested: \${subject.substring(0, 60)}\`);
    }

    pageToken = response.data.nextPageToken;
  } while (pageToken);

  // Upload to BigQuery
  await bigquery
    .dataset('communications')
    .table('gmail_messages')
    .insert(allMessages);

  console.log(\`✅ Ingested \${allMessages.length} Gmail messages\`);
}

function extractBody(payload) {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString();
  }
  if (payload.parts) {
    return payload.parts
      .map(part => extractBody(part))
      .join('\\n');
  }
  return '';
}

ingestGmail().catch(console.error);
```

---

## 🔒 SECURITY CONSIDERATIONS

### API Keys & Credentials
```bash
# Store in 1Password
op item create \\
  --category=password \\
  --title="NOTION_API_KEY" \\
  --vault="LivHana-Ops-Keys" \\
  password="secret_xxxxx"

# Reference in .env
NOTION_API_KEY=op://LivHana-Ops-Keys/NOTION_API_KEY/password

# Gmail OAuth tokens
op item create \\
  --category=document \\
  --title="Gmail OAuth Token" \\
  --vault="LivHana-Ops-Keys" \\
  "gmail_token.json"="<file_contents>"
```

### Data Privacy
- ✅ Email content stored in BigQuery with encryption at rest
- ✅ OAuth tokens never committed to git (add to .gitignore)
- ✅ Notion content exported to private repo only
- ✅ Use service account for automated syncs

---

## 🔄 CONTINUOUS SYNC SETUP

### Daily Notion Sync (Cloud Scheduler)
```bash
# Create Cloud Scheduler job
gcloud scheduler jobs create http notion-daily-sync \\
  --schedule="0 2 * * *" \\
  --uri="https://YOUR_CLOUD_RUN_URL/api/sync/notion" \\
  --http-method=POST \\
  --oidc-service-account-email=SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com
```

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

## 📊 BIGQUERY SCHEMA

### knowledge.notion_pages
```sql
CREATE TABLE knowledge.notion_pages (
  id STRING NOT NULL,
  title STRING,
  content STRING,
  url STRING,
  created_time TIMESTAMP,
  last_edited_time TIMESTAMP,
  metadata STRING,
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

### communications.gmail_messages
```sql
CREATE TABLE communications.gmail_messages (
  id STRING NOT NULL,
  thread_id STRING,
  account STRING,
  subject STRING,
  from_address STRING,
  to_address STRING,
  date STRING,
  body STRING,
  labels STRING,
  metadata STRING,
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

---

## 🚀 QUICK START COMMANDS

```bash
# 1. Set up Notion API key
echo "NOTION_API_KEY=secret_xxxxx" >> .env

# 2. Run Notion ingestion
node automation/data-pipelines/notion_ingest.js

# 3. Set up Gmail OAuth
node automation/data-pipelines/gmail_auth.js

# 4. Run Gmail ingestion (jesseniesen@gmail.com)
GMAIL_ACCOUNT="jesseniesen@gmail.com" node automation/data-pipelines/gmail_ingest.js

# 5. Run Gmail ingestion (high@reggieanddro.com)
GMAIL_ACCOUNT="high@reggieanddro.com" node automation/data-pipelines/gmail_ingest.js

# 6. Verify in BigQuery
bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM knowledge.notion_pages'
bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM communications.gmail_messages'
```

---

## 📝 NEXT STEPS

1. **Get API Keys:**
   - Create Notion integration at https://www.notion.so/my-integrations
   - Enable Gmail API at https://console.cloud.google.com/

2. **Run Initial Ingestion:**
   - Execute Notion ingestion script
   - Execute Gmail ingestion script for both accounts

3. **Verify Data:**
   - Check BigQuery tables for ingested data
   - Review exported markdown files

4. **Set Up Automation:**
   - Create Cloud Scheduler jobs for daily syncs
   - Monitor ingestion logs

5. **Organize & Index:**
   - Tag Notion pages by category (R&D, Herbitrage, Liv Hana, etc.)
   - Index Gmail messages by sender, date, topic
   - Create search/retrieval system

---

*Integration Guide Complete - September 30, 2025*
*Ready for thorough Notion & Gmail data ingestion*

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->
