#### Create BigQuery Dataset

```bash
# Create dataset
bq mk --dataset \
  --location=US \
  --description="Gmail communications data" \
  ${GCP_PROJECT_ID}:communications

# Create tables
bq query --use_legacy_sql=false < gmail_bigquery_schema.sql
```
