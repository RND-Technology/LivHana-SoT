### Access Controls

```bash
# Grant read-only access to analysts
bq add-iam-policy-binding \
  --member='user:analyst@livhana.com' \
  --role='roles/bigquery.dataViewer' \
  ${GCP_PROJECT_ID}:communications

# Grant attachment access
gsutil iam ch \
  user:analyst@livhana.com:objectViewer \
  gs://livhana-gmail-attachments
```
