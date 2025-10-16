#### **Frontend (Cloud Run):**

```bash
# Build production bundle
npm run build

# Deploy to Cloud Run
gcloud run deploy livhana-cockpit \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "REACT_APP_API_BASE_URL=https://api.livhana.com"
```
