### 1. Validate Optimization (Recommended First)

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service

# Test query performance (requires BigQuery credentials)
node scripts/test-bigquery-performance.js
```

**Expected Output:**

```
✅ Dashboard Metrics: 350ms (target: 400ms)
✅ Recent Transactions: 150ms (target: 200ms)
✅ Daily Historical: 360ms (target: 500ms)
✅ Monthly Historical: 420ms (target: 500ms)
✅ Product Catalog: 180ms (target: 300ms)

🎯 ALL QUERIES within performance targets!
```
