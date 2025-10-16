#### Test Admin Limits

```bash
# Admin user (1000 req/min)
ADMIN_TOKEN="admin-jwt-token"
for i in {1..200}; do
  curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3005/api/bigquery/sales | grep -q success && echo "✓" || echo "✗"
done
```
