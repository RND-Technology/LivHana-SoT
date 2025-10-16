## 🎬 Quick Test Commands

```bash
# Test all service health
for port in 3005 3003 3004 4001 4002 3002; do
  echo "Testing port $port..."
  curl -s http://localhost:$port/health | jq
done

# Test BigQuery endpoints
curl http://localhost:3005/api/bigquery/dashboard | jq
curl http://localhost:3005/api/bigquery/historical | jq
curl http://localhost:3005/api/bigquery/products | jq

# Start frontend
cd frontend/vibe-cockpit
npm run dev
```

---
