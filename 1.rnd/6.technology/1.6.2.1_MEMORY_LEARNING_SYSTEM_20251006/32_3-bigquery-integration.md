### 3. BigQuery Integration

**Enable in environment:**

```bash
ENABLE_BIGQUERY_MEMORY=true
GCP_PROJECT_ID=your-project-id
MEMORY_DATASET_ID=customer_memory
BIGQUERY_BATCH_SIZE=100
BIGQUERY_FLUSH_INTERVAL_MS=30000
```

The BigQuery adapter automatically:

- Batches writes for efficiency
- Creates partitioned tables
- Stores profiles, interactions, purchases, predictions, and audit logs
- Provides advanced analytics queries
