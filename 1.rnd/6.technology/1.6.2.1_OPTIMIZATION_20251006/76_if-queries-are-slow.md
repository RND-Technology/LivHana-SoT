### If Queries Are Slow

1. Check if partitioning is enabled:

   ```bash
   # Run migration script
   node scripts/migrate-to-partitioned-tables.js
   ```

2. Enable query result caching in BigQuery console

3. Check network latency to BigQuery
