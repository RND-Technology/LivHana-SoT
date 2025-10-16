## Troubleshooting Quick Reference

```
┌───────────────────────────────────────────────────────┐
│  COMMON ISSUES & SOLUTIONS                            │
├───────────────────────────────────────────────────────┤
│  Issue: Service not responding on port 3005           │
│  Fix: npm start (in /backend/integration-service)     │
│                                                       │
│  Issue: BigQuery queries failing                      │
│  Fix: Check GOOGLE_APPLICATION_CREDENTIALS env var    │
│       Verify .bigquery-key.json exists                │
│                                                       │
│  Issue: Redis cache not working                       │
│  Fix: redis-server (start Redis)                      │
│       Check REDIS_HOST=127.0.0.1, REDIS_PORT=6379     │
│                                                       │
│  Issue: Square API errors                             │
│  Fix: Verify SQUARE_ACCESS_TOKEN is valid             │
│       Check SQUARE_LOCATION_ID is correct             │
│                                                       │
│  Issue: Slow queries                                  │
│  Fix: Run partition migration script                  │
│       Check cache is enabled (Redis running)          │
│                                                       │
│  Issue: Lightspeed not syncing                        │
│  Fix: This is expected (mock mode)                    │
│       Add credentials to activate live mode           │
└───────────────────────────────────────────────────────┘
```

---
