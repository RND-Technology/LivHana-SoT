### Optimization

- Pagination: 100 items per request (max)
- Batch size: 500 rows per BigQuery insert
- Retry delay: 1s → 2s → 4s (exponential)
- Max retries: 3 attempts per operation

---
