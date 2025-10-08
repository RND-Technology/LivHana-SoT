#!/bin/bash
# DEPLOY LIGHTSPEED BIGQUERY PIPELINE TO CLOUD RUN

set -e

PROJECT_ID="reggieanddrodispensary"
SERVICE_NAME="lightspeed-bigquery"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying Lightspeed BigQuery Pipeline to Cloud Run..."

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME} .

echo "⬆️ Pushing image to Google Container Registry..."
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80 \
  --set-env-vars "NODE_ENV=production" \
  --service-account "high@reggieanddrodispensary.iam.gserviceaccount.com"

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

echo "✅ Deployment complete!"
echo "🌍 Service URL: ${SERVICE_URL}"
echo "📊 Health check: ${SERVICE_URL}/health"
echo "🔄 Sync endpoint: ${SERVICE_URL}/sync/sales"

# Test the deployment
echo "🧪 Testing deployment..."
curl -f "${SERVICE_URL}/health" || echo "❌ Health check failed"

echo "🎉 Lightspeed BigQuery Pipeline is live!"
