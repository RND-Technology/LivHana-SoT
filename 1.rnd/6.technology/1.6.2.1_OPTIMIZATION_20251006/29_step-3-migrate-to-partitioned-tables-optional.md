### Step 3: Migrate to Partitioned Tables (Optional)

```bash
# Create partitioned tables and copy data
node scripts/migrate-to-partitioned-tables.js

# Update .env configuration
echo "BQ_TABLE_PAYMENTS=square_payments_partitioned" >> .env
echo "BQ_TABLE_ITEMS=square_items_partitioned" >> .env

# Restart service
npm restart
```
