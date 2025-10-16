### Risk 2: BigQuery Cost Overruns

**Probability:** LOW
**Impact:** MEDIUM ($500-1000/month potential cost)

**Current Exposure:**

- 96 syncs/day × 1000 rows/sync = 96K rows/day = 2.88M rows/month
- BigQuery pricing: $0.02/GB scanned (first 1TB free)
- Estimated cost: ~$100/month at current volume

**Mitigation:**

```javascript
// Implement query result caching (30-second TTL already in place)
// Partition tables by date for efficient queries
const schema = [
  { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
  // ... other fields
];

const options = {
  schema: { fields: schema },
  timePartitioning: {
    type: 'DAY',
    field: 'created_at'
  },
  clustering: {
    fields: ['customer_id', 'status']
  }
};

await table.create(options);
```
