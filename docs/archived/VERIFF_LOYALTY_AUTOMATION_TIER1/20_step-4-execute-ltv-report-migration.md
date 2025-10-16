### Step 4: Execute LTV Report & Migration

```bash
# 1. Run LTV report query in BigQuery
bq query --use_legacy_sql=false < queries/square_customer_ltv_report.sql > ltv_report.csv

# 2. Execute migration script
cd automation/scripts
npx ts-node migrate_square_to_lightspeed_loyalty.ts

# Expected output:
# 📊 Found 11,348 Square customers
# ✅ Migrated: 11,348 customers
# ❌ Errors: 0 customers
```
