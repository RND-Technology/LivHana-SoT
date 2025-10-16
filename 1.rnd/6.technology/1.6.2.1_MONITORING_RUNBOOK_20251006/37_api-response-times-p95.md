### API Response Times (P95)

| Endpoint | Target | Warning | Critical |
|----------|--------|---------|----------|
| `/health` | <50ms | >100ms | >500ms |
| `/ready` | <500ms | >1s | >2s |
| `/api/products` | <200ms | >500ms | >1s |
| `/api/orders` | <300ms | >800ms | >2s |
| `/api/reasoning/*` | <5s | >10s | >20s |
