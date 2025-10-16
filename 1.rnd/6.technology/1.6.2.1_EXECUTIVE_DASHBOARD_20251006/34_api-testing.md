### API Testing

```bash
# Test BigQuery endpoints
curl http://localhost:3005/api/bigquery/dashboard
curl http://localhost:3005/api/bigquery/historical
curl http://localhost:3005/api/bigquery/products

# Test service health
curl http://localhost:3005/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:3002/health
```

---
