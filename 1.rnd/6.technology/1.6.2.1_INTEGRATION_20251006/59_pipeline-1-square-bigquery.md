#### Pipeline 1: Square → BigQuery

```
Square API (Production)
  ↓ (every 15 min)
sync-square-to-bigquery.js
  ↓ (transform)
  - Fetch payments (2-year history)
  - Fetch catalog (all items)
  - Format: amount/100, timestamps
  ↓ (batch insert)
BigQuery Tables
  - square_payments
  - square_items
  ↓ (query)
Integration Service
  ↓ (cache)
Redis (30-second TTL)
  ↓ (serve)
Dashboard/API Consumers
```

**Performance:**

- Sync frequency: 15 minutes
- Batch size: 1,000 records
- Retry logic: 3 attempts with exponential backoff
- Success rate: >99%
