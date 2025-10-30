### Step 3: Deploy to Cloud Run

```bash
cd ~/LivHana-Trinity-Local/LivHana-SoT/backend

# Build Docker image
docker build \
  -f delivery-service/Dockerfile \
  -t us-central1-docker.pkg.dev/reggieanddrodispensary/backend/delivery-service:latest \
  --platform linux/amd64 \
  .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/reggieanddrodispensary/backend/delivery-service:latest

# Deploy to Cloud Run
gcloud run deploy delivery-service \
  --project=reggieanddrodispensary \
  --region=us-central1 \
  --image=us-central1-docker.pkg.dev/reggieanddrodispensary/backend/delivery-service:latest \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,STORE_ADDRESS=123 Main St San Antonio TX 78201,STORE_PHONE=+12109999999,STORE_LAT=29.4241,STORE_LNG=-98.4936" \
  --set-secrets="DOORDASH_DEVELOPER_ID=DOORDASH_DEVELOPER_ID:latest,DOORDASH_KEY_ID=DOORDASH_KEY_ID:latest,DOORDASH_SIGNING_SECRET=DOORDASH_SIGNING_SECRET:latest,UBER_CUSTOMER_ID=UBER_CUSTOMER_ID:latest,UBER_API_KEY=UBER_API_KEY:latest,JWT_SECRET=JWT_SECRET:latest" \
  --memory=1Gi \
  --cpu=1 \
  --timeout=60 \
  --max-instances=10 \
  --min-instances=0
```

---
