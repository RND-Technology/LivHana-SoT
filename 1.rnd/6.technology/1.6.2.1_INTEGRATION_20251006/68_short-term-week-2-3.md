### Short Term (Week 2-3)

5. **Run BigQuery Partition Migration**

   ```bash
   cd /backend/integration-service
   node scripts/migrate-to-partitioned-tables.js
   # Update .env:
   # BQ_TABLE_PAYMENTS=square_payments_partitioned
   # BQ_TABLE_ITEMS=square_items_partitioned
   npm restart
   ```

   - Expected: Additional 20-30% performance improvement
   - Expected: 90% cost reduction on queries

6. **Set Up Monitoring Alerts**
   - Query latency > 500ms
   - Error rate > 1%
   - Cache hit rate < 90%
   - Daily cost > $1

7. **Test Error Recovery**
   - Simulate API failures
   - Verify retry logic works
   - Test fallback to cached data
