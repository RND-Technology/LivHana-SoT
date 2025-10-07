#!/bin/bash

# DELIVERY SERVICE DEPLOYMENT SCRIPT
# Deploys to Google Cloud Run

set -e

PROJECT_ID=${GCP_PROJECT_ID:-"livhana-trinity"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="delivery-service"

echo "🚀 Deploying Delivery Service to Cloud Run..."
echo "📍 Project: $PROJECT_ID"
echo "🌎 Region: $REGION"

# Build and deploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 4003 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DOORDASH_API_KEY=doordash-api-key:latest,UBER_API_KEY=uber-api-key:latest,LIGHTSPEED_API_TOKEN=lightspeed-api-token:latest"

echo "✅ Deployment complete!"
echo ""
echo "🔗 Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"
echo ""
echo "📋 Next steps:"
echo "1. Configure Lightspeed webhook to point to: [SERVICE_URL]/api/delivery/lightspeed/webhook"
echo "2. Add delivery quote API to checkout page"
echo "3. Test with real order"
