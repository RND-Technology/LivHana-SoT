### Optimization Tips

1. **Incremental Sync:** Always use incremental sync for daily updates
2. **Concurrent Operations:** Adjust `CONCURRENT_OPERATIONS` based on rate limits
3. **Batch Size:** Default 500 rows per batch works well for most cases
4. **Partitioning:** Queries benefit from partitioning by date
5. **Clustering:** Cluster by `account_email` and `thread_id` for thread queries
