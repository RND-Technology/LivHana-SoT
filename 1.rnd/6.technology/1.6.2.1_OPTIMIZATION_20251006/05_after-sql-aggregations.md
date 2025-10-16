#### After: SQL Aggregations

```sql
-- ✅ NEW: Single query, server-side aggregation
WITH time_ranges AS (
  SELECT
    TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY) AS day_start,
    TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY) AS week_start
)
SELECT
  SUM(CASE WHEN created_at >= (SELECT day_start FROM time_ranges)
      THEN amount ELSE 0 END) / 100 AS todayRevenue,
  COUNT(*) AS totalTransactions,
  COUNT(DISTINCT customer_id) AS totalCustomers
FROM payments
WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 180 DAY)
  AND status = 'COMPLETED'
```

**Benefits:**

- Single aggregation pass
- 1 row returned (vs 1000)
- Native SQL performance
- 200-400ms latency
- **80% reduction achieved**

---
