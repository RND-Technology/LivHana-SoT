### Daily Revenue Query

```sql
SELECT
  DATE(o.created_at) as order_date,
  COUNT(DISTINCT o.order_id) as orders,
  SUM(o.total_amount) / 100 as revenue
FROM `your-project.commerce.orders` o
JOIN `your-project.commerce.age_verifications` av
  ON o.customer_id = av.customer_id
WHERE o.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND av.verified = true
GROUP BY order_date
ORDER BY order_date DESC;
```

---
