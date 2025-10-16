### Rate Limits

- Notion API: ~3 requests/second
- BigQuery: 100,000 rows/second (streaming)
- Script includes automatic retry with exponential backoff
