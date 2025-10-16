### Deploy
```bash
cd backend/integration-service
gcloud run deploy lightspeed-bigquery \
  --source . \
  --region us-central1 \
  --set-env-vars="LIGHTSPEED_TOKEN=op://LivHana-Ops-Keys/LIGHTSPEED_PERSONAL_TOKEN/credential"
```

---
