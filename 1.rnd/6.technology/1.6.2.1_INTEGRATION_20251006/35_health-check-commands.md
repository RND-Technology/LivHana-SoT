## Health Check Commands

```bash
# Service health
curl http://localhost:3005/health

# Square catalog (live data)
curl http://localhost:3005/api/square/catalog | jq '.products | length'

# BigQuery dashboard (live metrics)
curl http://localhost:3005/api/bigquery/dashboard | jq '.metrics'

# Cache statistics
curl http://localhost:3005/api/bigquery/cache-stats | jq '.cache'

# Redis connectivity
redis-cli ping  # Should return: PONG

# Integration service logs
tail -f logs/integration-service.log | grep "query completed"
```

---
