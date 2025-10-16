### View Logs

```bash
# Run with verbose logging
node gmail_ingest.js 2>&1 | jq .

# Filter errors only
node gmail_ingest.js 2>&1 | jq 'select(.level == "ERROR")'
```
