#### **Backend Services (Cloud Run):**

```bash
# Deploy reasoning-gateway
cd backend/reasoning-gateway
gcloud run deploy reasoning-gateway --source . --region us-central1

# Deploy integration-service
cd backend/integration-service
gcloud run deploy integration-service --source . --region us-central1

# Deploy crisis-engine
cd empire/crisis-engine
gcloud run deploy crisis-engine --source . --region us-central1
```
