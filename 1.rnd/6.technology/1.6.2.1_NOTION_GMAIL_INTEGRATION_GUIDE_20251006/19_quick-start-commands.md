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
