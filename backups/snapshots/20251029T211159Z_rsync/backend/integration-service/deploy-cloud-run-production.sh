#!/usr/bin/env bash
# Deploy integration-service to Cloud Run (Production)
# Community-verified pattern with Secret Manager, health probes, graceful shutdown

set -euo pipefail

PROJECT_ID="reggieanddrodispensary"
SERVICE_NAME="integration-service"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
SERVICE_ACCOUNT="${SERVICE_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🚀 Deploying Integration Service to Cloud Run"
echo "📍 Project: $PROJECT_ID"
echo "🌎 Region: $REGION"

# Build production Docker image (multi-stage, Node 20)
echo "📦 Building production Docker image..."
docker build -f Dockerfile.production -t ${IMAGE_NAME}:latest .

# Push to GCR
echo "⬆️  Pushing image to GCR..."
docker push ${IMAGE_NAME}:latest

# Verify service account exists
echo "👤 Verifying service account: ${SERVICE_ACCOUNT}"
if ! gcloud iam service-accounts describe "${SERVICE_ACCOUNT}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  echo "ℹ️  Creating service account: ${SERVICE_ACCOUNT}"
  gcloud iam service-accounts create "${SERVICE_NAME}" \
    --project "${PROJECT_ID}" \
    --display-name "Integration Service"
fi

# Grant Secret Manager access
echo "🔐 Granting Secret Manager access..."
for secret in LIGHTSPEED_TOKEN SQUARE_ACCESS_TOKEN SQUARE_LOCATION_ID; do
  gcloud secrets add-iam-policy-binding "$secret" \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --project "${PROJECT_ID}" 2>/dev/null || echo "  Already has access to $secret"
done

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --region ${REGION} \
  --platform managed \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60s \
  --concurrency 40 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,HOST=0.0.0.0,PORT=8080,GCP_PROJECT_ID=${PROJECT_ID},LOG_FORMAT=json" \
  --set-secrets "LIGHTSPEED_TOKEN=LIGHTSPEED_TOKEN:latest,SQUARE_ACCESS_TOKEN=SQUARE_ACCESS_TOKEN:latest,SQUARE_LOCATION_ID=SQUARE_LOCATION_ID:latest" \
  --service-account "${SERVICE_ACCOUNT}" \
  --ingress internal-and-cloud-load-balancing \
  --cpu-boost \
  --execution-environment gen2

echo "✅ Deployment complete!"
echo ""
echo "🔍 Service URL:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)'
echo ""
echo "🏥 Health check:"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)')
echo "curl -sf ${SERVICE_URL}/health | jq"

