### Step 2: Upload Secrets to GCP

Create script: `scripts/upload-delivery-secrets.sh`

```bash
#!/bin/bash
set -euo pipefail

PROJECT_ID="reggieanddrodispensary"

echo "🔐 Uploading Delivery Service credentials to GCP Secret Manager"

# DoorDash credentials
echo -n "$DOORDASH_DEVELOPER_ID" | gcloud secrets create DOORDASH_DEVELOPER_ID \
  --project="$PROJECT_ID" \
  --data-file=- \
  --replication-policy="automatic"

echo -n "$DOORDASH_KEY_ID" | gcloud secrets create DOORDASH_KEY_ID \
  --project="$PROJECT_ID" \
  --data-file=- \
  --replication-policy="automatic"

echo -n "$DOORDASH_SIGNING_SECRET" | gcloud secrets create DOORDASH_SIGNING_SECRET \
  --project="$PROJECT_ID" \
  --data-file=- \
  --replication-policy="automatic"

# Uber credentials
echo -n "$UBER_CUSTOMER_ID" | gcloud secrets create UBER_CUSTOMER_ID \
  --project="$PROJECT_ID" \
  --data-file=- \
  --replication-policy="automatic"

echo -n "$UBER_API_KEY" | gcloud secrets create UBER_API_KEY \
  --project="$PROJECT_ID" \
  --data-file=- \
  --replication-policy="automatic"

echo "✅ All secrets uploaded"
```

---
