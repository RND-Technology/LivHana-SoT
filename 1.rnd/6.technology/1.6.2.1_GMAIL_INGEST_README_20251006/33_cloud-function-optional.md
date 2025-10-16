### Cloud Function (Optional)

Deploy as Cloud Function for serverless execution:

```javascript
// index.js
import { ingestAccount, ACCOUNTS } from './gmail_ingest.js';

export async function gmailIngest(req, res) {
  const results = [];

  for (const account of ACCOUNTS) {
    try {
      const result = await ingestAccount(account, {
        fullSync: false,
        maxMessages: 1000
      });
      results.push({ account: account.email, ...result });
    } catch (error) {
      results.push({ account: account.email, error: error.message });
    }
  }

  res.json({ success: true, results });
}
```

Deploy:

```bash
gcloud functions deploy gmail-ingest \
  --runtime=nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point=gmailIngest \
  --memory=1024MB \
  --timeout=540s
```
