#### Rate Limit Tiers

| Tier | Limit | Window | Applied To |
|------|-------|--------|------------|
| Public | 100 req/min | 60s | Unauthenticated users (by IP) |
| Authenticated | 300 req/min | 60s | Authenticated users (by user ID) |
| Admin | 1000 req/min | 60s | Admin users |
| Health Check | 300 req/min | 60s | Monitoring endpoints |
