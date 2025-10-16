### BigQuery Monitoring

```sql
-- Messages ingested today
SELECT
  account_email,
  COUNT(*) as messages_ingested,
  MIN(timestamp) as earliest_message,
  MAX(timestamp) as latest_message
FROM `communications.gmail_messages`
WHERE DATE(ingested_at) = CURRENT_DATE()
GROUP BY account_email;

-- Attachment storage usage
SELECT
  account_email,
  COUNT(*) as attachment_count,
  SUM(size_bytes) / 1024 / 1024 / 1024 as total_gb
FROM `communications.gmail_attachments`
GROUP BY account_email;

-- Ingestion errors (check logs)
SELECT *
FROM `communications.gmail_messages`
WHERE ingested_at IS NULL
LIMIT 100;
```
