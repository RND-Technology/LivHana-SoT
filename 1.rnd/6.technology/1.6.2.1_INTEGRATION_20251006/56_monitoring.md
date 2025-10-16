### Monitoring

- `GET /health` - Service health check
- `GET /api/monitoring/*` - Rate limit monitoring

**Data Flow:**

```
┌──────────────┐
│   Square API │ ──┐
└──────────────┘   │
                   ├──> Integration Service (port 3005) ──> BigQuery ──> Redis Cache ──> Dashboard/API
┌──────────────┐   │                                           │
│ Lightspeed   │ ──┘                                           └──> Analytics/Reports
└──────────────┘
```

**Security:**

- ✅ Helmet security headers
- ✅ CORS configured (localhost:5173, localhost:3000)
- ✅ Rate limiting (Redis-backed)
- ✅ Request sanitization
- ✅ Security audit logging
- ✅ Authentication middleware (disabled in dev, enabled in production)

**Performance:**

- ✅ Async sync jobs (non-blocking)
- ✅ Exponential backoff retry logic
- ✅ Redis caching (sub-10ms responses)
- ✅ Parallel query execution
- ✅ Connection pooling

---
