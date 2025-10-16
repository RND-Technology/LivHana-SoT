### BigQuery Monitoring

```sql
-- Recent improvement executions
SELECT * FROM ai_learning.agent_executions
ORDER BY timestamp DESC
LIMIT 100;

-- Performance improvements over time
SELECT
  DATE(timestamp) as date,
  COUNT(*) as improvements,
  AVG(response_time_reduction) as avg_reduction
FROM performance.optimizations
GROUP BY date
ORDER BY date DESC;
```
