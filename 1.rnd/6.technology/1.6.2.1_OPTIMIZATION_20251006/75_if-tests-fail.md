### If Tests Fail

1. Check BigQuery credentials:

   ```bash
   echo $GOOGLE_APPLICATION_CREDENTIALS
   echo $GCP_PROJECT_ID
   ```

2. Verify table names in `.env`:

   ```bash
   grep BQ_ .env
   ```

3. Test BigQuery connection:

   ```bash
   node scripts/setup-bigquery-schema.js
   ```
