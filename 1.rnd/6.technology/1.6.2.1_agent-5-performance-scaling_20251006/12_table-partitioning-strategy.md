#### Table Partitioning Strategy

**Required Setup** (Not currently implemented):

```sql
-- Partition payments table by day
CREATE TABLE `${PROJECT_ID}.${DATASET}.${PAYMENTS_TABLE}`
PARTITION BY DATE(created_at)
CLUSTER BY customer_id, status
OPTIONS(
  partition_expiration_days=2555,  -- 7 years compliance
  require_partition_filter=true
);
```

**Cost Impact at Scale:**

- Current: ~$5/TB scanned
- With partitioning: ~$0.50/TB (10x reduction)
- At 10K daily transactions: $150/month → $15/month
