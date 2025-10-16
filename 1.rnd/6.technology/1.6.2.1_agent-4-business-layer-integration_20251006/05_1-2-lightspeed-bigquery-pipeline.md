### 1.2 LightSpeed → BigQuery Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                 LIGHTSPEED DATA PIPELINE                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Lightspeed   │         │  Sync Script │         │   BigQuery   │
│  Retail API  │────────▶│  (Cron Job)  │────────▶│   Dataset    │
│  (v3)        │         │              │         │   analytics  │
└──────────────┘         └──────────────┘         └──────────────┘
       │                         │                         │
       │ /Sale.json             │ Every 15 min            │
       │ /Item.json             │ OAuth2 refresh          │ lightspeed_transactions
       │                        │ Mock mode default       │ lightspeed_products
       │                        │                         │
       ▼                        ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTH MODES:                                                  │
[REDACTED - SECURITY BREACH]
│  2. OAuth2 (Preferred): LIGHTSPEED_CLIENT_SECRET +           │
│                         LIGHTSPEED_REFRESH_TOKEN             │
│  3. Mock Mode (Default): LIGHTSPEED_USE_MOCK=true            │
│     - Generates 50 transactions, 25 products                 │
│     - Random data for testing                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  COMPLIANCE FEATURES:                                         │
│  - PDP (Personal Data Protection) aware                      │
│  - Rate limit handling (auto-detect via batch size)          │
│  - Load relations for customer data                          │
│  - 2-year historical window                                  │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**

- **File:** `/backend/integration-service/scripts/sync-lightspeed-to-bigquery.js`
- **Scheduler:** `/backend/integration-service/src/lightspeed-sync-scheduler.js`

**Data Models:**

```javascript
// lightspeed_transactions schema
{
  id: STRING (saleID),
  amount: FLOAT (subtotal),
  tax: FLOAT (calculated tax),
  total: FLOAT (final total),
  customer_id: STRING (nullable),
  status: STRING (COMPLETED, PENDING),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}

// lightspeed_products schema
{
  id: STRING (itemID),
  name: STRING,
  description: STRING,
  category: STRING (from Category relation),
  price: FLOAT (defaultCost),
  cost: FLOAT (wholesale),
  quantity: INTEGER (qoh - quantity on hand),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Critical Integration Points:**

1. **Account:** `LIGHTSPEED_ACCOUNT_ID` (required)
[REDACTED - SECURITY BREACH]
3. **Auth Method 2:** `LIGHTSPEED_CLIENT_ID` + `LIGHTSPEED_CLIENT_SECRET` + `LIGHTSPEED_REFRESH_TOKEN`
4. **Fallback:** `LIGHTSPEED_USE_MOCK=true` (default)

**Production Readiness:**

- Currently in **MOCK MODE** - awaiting real credentials
- Script is production-ready with OAuth2 refresh flow
- Rate limiting detection via batch size monitoring
- Graceful fallback ensures service continuity

---
