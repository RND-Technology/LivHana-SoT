### Dashboards

**BigQuery Dashboard Query:**

```sql
SELECT
  DATE(created_at) AS order_date,
  COUNT(*) AS total_orders,
  COUNT(CASE WHEN verification_status = 'APPROVED' THEN 1 END) AS approved_orders,
  COUNT(CASE WHEN verification_status = 'REJECTED' THEN 1 END) AS rejected_orders,
  ROUND(COUNT(CASE WHEN verification_status = 'APPROVED' THEN 1 END) * 100.0 / COUNT(*), 2) AS approval_rate
FROM `livhana-422923.commerce.lightspeed_orders`
WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY order_date
ORDER BY order_date DESC;
```

---
