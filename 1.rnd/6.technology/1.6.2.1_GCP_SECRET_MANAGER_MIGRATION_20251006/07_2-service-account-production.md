### 2. Service Account (Production)

```bash
# Create service account
gcloud iam service-accounts create livhana-secret-accessor \
  --description="LivHana Secret Manager Access" \
  --display-name="LivHana Secret Accessor"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:livhana-secret-accessor@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Create and download key
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=livhana-secret-accessor@$GCP_PROJECT_ID.iam.gserviceaccount.com
```
