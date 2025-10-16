#### Test Public Rate Limit (100 req/min)

```bash
# Make 110 requests quickly
for i in {1..110}; do
  curl -s http://localhost:3005/health | grep -q healthy && echo "✓" || echo "✗ Rate limited"
done
```
