### 1.1 Square → BigQuery Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    SQUARE DATA PIPELINE                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Square API │         │  Sync Script │         │   BigQuery   │
│   (REST v2)  │────────▶│  (Cron Job)  │────────▶│   Dataset    │
│              │         │              │         │   commerce   │
└──────────────┘         └──────────────┘         └──────────────┘
       │                         │                         │
       │ /payments              │ Every 15 min            │
       │ /catalog/list          │ Batch insert            │ square_payments
       │                        │ 1000 rows/batch         │ square_items
       │                        │                         │
       ▼                        ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│  FEATURES:                                                    │
│  - 2-year historical fetch (rolling window)                  │
│  - Pagination with cursor support                            │
│  - skipInvalidRows + ignoreUnknownValues                     │
│  - Automatic retry with exponential backoff                  │
│  - Mock data fallback on auth failure                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Frontend API │         │   Live Data  │         │    Cache     │
│   Request    │────────▶│   Service    │◀───────▶│  (30s TTL)   │
└──────────────┘         └──────────────┘         └──────────────┘
                                 │
                         Query BigQuery
                         Transform + Aggregate
                         Return JSON
```

**Implementation:**

- **File:** `/backend/integration-service/scripts/sync-square-to-bigquery.js`
- **Scheduler:** `/backend/integration-service/src/square-sync-scheduler.js`
- **Live API:** `/backend/integration-service/src/bigquery_live.js`

**Data Models:**

```javascript
// square_payments schema
{
  id: STRING (Square payment ID),
  amount: INTEGER (cents),
  currency: STRING (USD),
  status: STRING (COMPLETED, PENDING),
  customer_id: STRING (nullable),
  created_at: TIMESTAMP,
  card_brand: STRING (nullable)
}

// square_items schema
{
  id: STRING (Square catalog ID),
  name: STRING,
  category: STRING,
  sku: STRING,
  price: INTEGER (cents),
  available: BOOLEAN,
  updated_at: TIMESTAMP
}
```

**Critical Integration Points:**

1. **Authentication:** `SQUARE_ACCESS_TOKEN` (Bearer token)
2. **API Version:** `SQUARE_API_VERSION` (2024-06-15)
3. **Location Filter:** `SQUARE_LOCATION_ID`
4. **Sync Schedule:** `SQUARE_SYNC_SCHEDULE` (default: `*/15 * * * *`)

**Error Handling:**

- Network failures → retry with timeout (300s max)
- Auth failures → graceful degradation to mock data
- BigQuery errors → log + continue (don't block service)

---
