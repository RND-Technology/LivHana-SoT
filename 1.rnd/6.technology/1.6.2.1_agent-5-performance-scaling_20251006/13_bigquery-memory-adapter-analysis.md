#### BigQuery Memory Adapter Analysis

**File**: `/backend/common/memory/bigquery-adapter.js`

**GOOD PATTERNS:**

- Batch insertion with configurable size (100 rows default, line 10)
- Auto-flush on 30s interval (line 11)
- Time-partitioned tables (lines 54-58)
- Parameterized queries (lines 285-288)

**OPTIMIZATION #1: Batch Size Tuning**

```javascript
// Line 10: Current
this.batchSize = Number(process.env.BIGQUERY_BATCH_SIZE ?? 100);

// Recommended for Texas scale
// 11K members × 5 interactions/day = 55K rows/day
// Optimize to 500-1000 batch size for cost efficiency
this.batchSize = Number(process.env.BIGQUERY_BATCH_SIZE ?? 500);
```

**OPTIMIZATION #2: Streaming Inserts**

```javascript
// Replace insertRows (line 244) with streaming API
await this.bigquery
  .dataset(this.datasetId)
  .table(tableId)
  .insert(rows, {
    raw: true,  // Use streaming buffer
    skipInvalidRows: false,
    ignoreUnknownValues: true,
  });
```

**Cost Savings**: Streaming inserts are free (vs $0.05/GB)

---
