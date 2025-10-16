## Data Flow Diagram

```
┌────────────────┐
│   SQUARE API   │ ← Production OAuth2 ✅
│   (Live Data)  │
└────────┬───────┘
         │
         │ Sync every 15 min
         │ (100,184 transactions)
         ↓
┌────────────────────────┐
│  Integration Service   │
│    (Port 3005)         │ ← Health: ✅ HEALTHY
│  • sync-square.js      │
│  • sync-lightspeed.js  │
└────────┬───────────────┘
         │
         │ Batch Insert (1,000 rows)
         │ Retry Logic (3 attempts)
         ↓
┌────────────────────────┐
│   GOOGLE BIGQUERY      │
│   reggieanddro...      │ ← Dataset: analytics
│  • square_payments     │    100,184 rows ✅
│  • square_items        │    ~500 rows ✅
│  • lightspeed_txns     │    0 rows (mock) ⚠️
└────────┬───────────────┘
         │
         │ SQL Queries (optimized)
         │ Response: 300-400ms avg
         ↓
┌────────────────────────┐
│    REDIS CACHE         │
│   127.0.0.1:6379       │ ← TTL: 30 seconds
│  • dashboard           │    Stale-while-revalidate
│  • historical          │    Background refresh
│  • products            │    <10ms response ✅
└────────┬───────────────┘
         │
         │ JSON API Response
         │ CORS: localhost:5173
         ↓
┌────────────────────────┐
│   DASHBOARD / API      │
│   Consumers            │ ← Real-time data
│  • Vibe Cockpit        │    Auto-refresh
│  • Mobile App          │    30-second cache
│  • External Integrations│
└────────────────────────┘


┌────────────────┐
│ LIGHTSPEED API │ ← ⚠️ Mock Mode (Ready for Live)
│  (Mock Data)   │
└────────┬───────┘
         │
         │ Sync every 15 min
         │ (50 mock transactions)
         │ (25 mock products)
         ↓
      [Same flow as above]
```

---
