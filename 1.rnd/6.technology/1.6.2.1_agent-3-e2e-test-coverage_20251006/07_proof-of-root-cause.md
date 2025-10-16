#### PROOF OF ROOT CAUSE

Testing confirms service responds immediately after warm-up:

```bash
# First call (cold start): 5-30 seconds
curl http://localhost:3005/health

# Subsequent calls: < 100ms
curl http://localhost:3005/health
```

Node.js HTTP test:

```
StatusCode: 200
Headers: {
  "content-length": "231",
  "content-type": "application/json; charset=utf-8"
}
Body: {"status":"healthy",...}
```

**The health check does NOT query BigQuery** - but calling any BigQuery endpoint (`/api/bigquery/dashboard`) WILL trigger cache refresh, which blocks.

---
