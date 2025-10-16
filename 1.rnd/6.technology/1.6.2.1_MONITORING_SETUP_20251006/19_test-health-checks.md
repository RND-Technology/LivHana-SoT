### Test Health Checks

```bash
# Test basic health
curl http://localhost:3005/health
curl http://localhost:4002/health

# Test readiness with dependencies
curl http://localhost:3005/ready
curl http://localhost:4002/ready

# Test metrics endpoint
curl http://localhost:3005/metrics
curl http://localhost:4002/metrics
```

Expected responses:

```json
// /health
{
  "status": "healthy",
  "service": "integration-service",
  "version": "1.0.0",
  "timestamp": "2025-10-01T00:00:00.000Z",
  "uptime": 123.456
}

// /ready
{
  "status": "healthy",
  "service": "integration-service",
  "version": "1.0.0",
  "timestamp": "2025-10-01T00:00:00.000Z",
  "checks": {
    "redis": { "status": "healthy", "message": "Redis connection active" },
    "bigquery": { "status": "healthy", "message": "BigQuery connection active" },
    "square": { "status": "healthy", "message": "Square API connection active" }
  }
}
```
