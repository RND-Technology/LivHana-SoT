### Quick Reference

```bash
# Test performance
node scripts/test-bigquery-performance.js

# Migrate to partitions
node scripts/migrate-to-partitioned-tables.js

# Check current performance (requires running service)
curl http://localhost:3010/api/bigquery/dashboard | jq '.queryTimeMs'

# View logs
tail -f logs/integration-service.log | grep "query completed"
```
