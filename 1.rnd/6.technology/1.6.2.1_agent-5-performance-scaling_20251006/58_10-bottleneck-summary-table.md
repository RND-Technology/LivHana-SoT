## 10. BOTTLENECK SUMMARY TABLE

| Bottleneck | File:Line | Impact | Fix Effort | Priority |
|------------|-----------|--------|------------|----------|
| **BigQuery full table scans** | `bigquery_live.js:78` | 2-5s latency | 8h | P0 |
| **No code splitting** | `App.jsx:185` | 2MB initial bundle | 4h | P0 |
| **In-memory cache** | `bigquery_live.js:31` | No horizontal scaling | 6h | P0 |
| **Sync blocking event loop** | `square-sync-scheduler.js:17` | 5min freeze | 2h | P0 |
| **No table partitioning** | BigQuery schema | 10x query cost | 4h | P1 |
| **Missing CDN** | Infrastructure | High bandwidth costs | 3d | P1 |
| **No API Gateway** | Infrastructure | No centralized rate limiting | 1w | P1 |
| **104 useEffect hooks** | Frontend components | Potential re-render issues | 1w | P2 |
| **No request deduplication** | Frontend API calls | Cache stampede risk | 1w | P2 |
| **Single Redis instance** | `queue/index.js:5` | SPOF | 3d | P2 |

**P0 = Critical**: Must fix before Texas launch
**P1 = High**: Fix within first 3 months
**P2 = Medium**: Fix within 6 months

---
