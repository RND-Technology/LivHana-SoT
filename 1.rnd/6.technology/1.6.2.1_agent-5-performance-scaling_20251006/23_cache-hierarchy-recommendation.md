### Cache Hierarchy Recommendation

```
┌─────────────────────────────────────────┐
│  CDN (CloudFlare/Fastly)                │  ← Static assets, 24h TTL
│  - Frontend bundle                       │
│  - Images, fonts, icons                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Redis L1 Cache (10-60s TTL)            │  ← Hot data
│  - Dashboard metrics                     │
│  - Active user sessions                  │
│  - Rate limit counters                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Redis L2 Cache (5-60min TTL)           │  ← Warm data
│  - Customer profiles                     │
│  - Product catalog                       │
│  - Historical aggregates                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  BigQuery (Source of Truth)             │  ← Cold data
│  - All transactional data                │
│  - 7-year compliance retention           │
└─────────────────────────────────────────┘
```

---
