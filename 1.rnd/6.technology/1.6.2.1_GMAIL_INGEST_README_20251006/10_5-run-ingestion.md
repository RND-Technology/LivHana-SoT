### 5. Run Ingestion

```bash
# Initial full sync (all accounts)
node gmail_ingest.js --full

# Incremental sync (only new emails)
node gmail_ingest.js

# Single account sync
node gmail_ingest.js --account=jesseniesen@gmail.com

# Limit number of messages
node gmail_ingest.js --max=500
```
