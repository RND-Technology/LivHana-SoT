### Proposals Not Generating

```bash
# Check BigQuery connection
gcloud auth application-default login

# Check data availability
node -e "
const { BigQuery } = require('@google-cloud/bigquery');
const bq = new BigQuery();
bq.query('SELECT COUNT(*) FROM ai_learning.customer_interactions WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)')
  .then(([rows]) => console.log(rows));
"

# Run manual analysis
node scripts/run-improvement-cycle.js --type=daily
```
