### 2. Migrate to Partitioned Tables (Optional - Extra Performance)

```bash
# Create partitioned tables and copy data
node scripts/migrate-to-partitioned-tables.js

# Update environment variables
# Add to .env:
# BQ_TABLE_PAYMENTS=square_payments_partitioned
# BQ_TABLE_ITEMS=square_items_partitioned

# Restart service
npm restart
```
