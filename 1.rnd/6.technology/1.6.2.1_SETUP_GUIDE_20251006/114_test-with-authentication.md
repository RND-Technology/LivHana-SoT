#### Test with Authentication

```bash
# With JWT token (300 req/min)
TOKEN="your-jwt-token"
for i in {1..110}; do
  curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3005/api/bigquery/sales | grep -q success && echo "✓" || echo "✗"
done
```
