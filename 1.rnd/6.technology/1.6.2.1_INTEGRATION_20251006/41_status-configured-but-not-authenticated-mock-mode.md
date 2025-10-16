### Status: ⚠️ CONFIGURED BUT NOT AUTHENTICATED (Mock Mode)

**Configuration Found:**

- Client ID: `9KjCEhIldhMMxWZcW2WQzPJE1dRJBYEB`
- Account ID: `020b2c2a-4661-11ef-e88b-b42e5d3b90cc`
- API Base: `https://api.lightspeedapp.com`
- Username: `jesseniesen@gmail.com`

**Endpoints Implemented:**

1. `/API/V3/Account/{accountId}/Sale.json` - Transaction history
2. `/API/V3/Account/{accountId}/Item.json` - Product catalog
3. OAuth2 refresh token flow

**Data Being Pulled (When Live):**

- Transactions (Sales data)
  - `saleID`, `calcSubtotal`, `calcTax`, `calcTotal`
  - `customerID`, `completed` status
  - `createTime`, `updateTime`

- Products (Inventory)
  - `itemID`, `description`, `longDescription`
  - `defaultCost`, `cost`, `quantity`
  - Category, create/update timestamps

**Current State:**

- Running in MOCK mode (generates test data)
- Mock data: 50 transactions, 25 products
- Sync scheduler configured (every 15 minutes)
- Script location: `/backend/integration-service/scripts/sync-lightspeed-to-bigquery.js`

**Error Rate:** 0% (mock mode has no errors)

**To Activate Live Mode:**

```bash
# Set environment variables:
LIGHTSPEED_USE_MOCK=false
[REDACTED - SECURITY BREACH]
# OR
LIGHTSPEED_CLIENT_SECRET=<secret>
LIGHTSPEED_REFRESH_TOKEN=<token>
```

**BigQuery Tables:**

- `lightspeed_transactions` - All sales data
- `lightspeed_products` - Inventory catalog

---
