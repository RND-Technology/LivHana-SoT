### Command Line Options

```bash
node gmail_ingest.js [OPTIONS]

Options:
  --full                 Full sync (re-ingest all emails)
  --account=EMAIL        Sync specific account only
  --max=N                Maximum messages to fetch (default: 1000)

Examples:
  node gmail_ingest.js --full --max=5000
  node gmail_ingest.js --account=jesseniesen@gmail.com
  node gmail_ingest.js
```
