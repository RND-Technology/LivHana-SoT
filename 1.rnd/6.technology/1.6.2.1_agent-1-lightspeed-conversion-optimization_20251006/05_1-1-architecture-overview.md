### 1.1 Architecture Overview

**Files Analyzed:**

- `/backend/integration-service/src/lightspeed-sync-scheduler.js` (Lines 1-38)
- `/backend/integration-service/scripts/sync-lightspeed-to-bigquery.js` (Lines 1-356)
- `/backend/integration-service/LIGHTSPEED_SETUP.md` (Complete documentation)

**Current Implementation:**

```
┌─────────────────────────────────────────────────────┐
│           LIGHTSPEED → BIGQUERY PIPELINE            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [LightSpeed API] → [Sync Script] → [BigQuery]     │
│         ↓              ↓                ↓           │
│   OAuth2/API Key   15min cron    analytics dataset │
│   Transactions     node-cron      - transactions   │
│   Products         execSync       - products       │
│   Customers        5min timeout                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Data Flow:**

1. **Scheduler** (`lightspeed-sync-scheduler.js:13-32`): Cron job every 15 minutes
2. **Sync Script** (`sync-lightspeed-to-bigquery.js:329-353`): Fetches transactions + products
3. **BigQuery Storage** (`bigquery_live.js:67-127`): Analytics queries and caching
4. **API Exposure** (`index.js:54-61`): Manual sync endpoint `/api/sync/lightspeed`
