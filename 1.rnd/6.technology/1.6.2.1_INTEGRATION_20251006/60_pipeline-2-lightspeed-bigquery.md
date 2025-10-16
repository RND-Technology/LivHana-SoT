#### Pipeline 2: Lightspeed → BigQuery

```
Lightspeed API (Mock Mode - Ready for Live)
  ↓ (every 15 min)
sync-lightspeed-to-bigquery.js
  ↓ (transform)
  - OAuth2 authentication
  - Fetch sales (2-year history)
  - Fetch items (inventory)
  - Format: floats, timestamps
  ↓ (batch insert)
BigQuery Tables
  - lightspeed_transactions
  - lightspeed_products
  ↓ (query)
Integration Service
  ↓ (cache)
Redis (30-second TTL)
  ↓ (serve)
Dashboard/API Consumers
```

**Status:**

- ⚠️ Mock mode (awaiting credentials)
- Generates 50 test transactions, 25 test products
- Ready to activate with API credentials
