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
