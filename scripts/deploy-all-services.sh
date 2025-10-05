#!/bin/bash
#
# DEPLOY ALL SERVICES TO GCP CLOUD RUN
#
# Deploys:
# 1. integration-service (Veriff, SendGrid, KAJA, LightSpeed)
# 2. delivery-service (DoorDash, Uber, Roadie, GoShare)
#
# Usage: ./scripts/deploy-all-services.sh
#

set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-reggieanddrodispensary}"
REGION="us-central1"
REGISTRY="us-central1-docker.pkg.dev"

echo "🚀 Deploying all services to GCP Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Function to build and push Docker image
build_and_push() {
  local SERVICE_NAME=$1
  local DOCKERFILE_PATH=$2

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🏗️  Building $SERVICE_NAME"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  docker build \
    -f "$DOCKERFILE_PATH" \
    -t "$REGISTRY/$PROJECT_ID/backend/$SERVICE_NAME:latest" \
    --platform linux/amd64 \
    .

  echo "📤 Pushing $SERVICE_NAME to Artifact Registry"

  docker push "$REGISTRY/$PROJECT_ID/backend/$SERVICE_NAME:latest"

  echo "✅ $SERVICE_NAME image ready"
  echo ""
}

# Change to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Build and push integration-service
build_and_push "integration-service" "integration-service/Dockerfile"

# Build and push delivery-service
build_and_push "delivery-service" "delivery-service/Dockerfile"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Deploying integration-service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

gcloud run deploy integration-service \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --image="$REGISTRY/$PROJECT_ID/backend/integration-service:latest" \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="VERIFF_API_KEY=VERIFF_API_KEY:latest,VERIFF_SECRET_KEY=VERIFF_SECRET_KEY:latest,VERIFF_BASE_URL=VERIFF_BASE_URL:latest,LIGHTSPEED_CLIENT_ID=LIGHTSPEED_CLIENT_ID:latest,LIGHTSPEED_ACCOUNT_ID=LIGHTSPEED_ACCOUNT_ID:latest,SENDGRID_API_KEY=SENDGRID_API_KEY:latest,KAJA_API_KEY=KAJA_API_KEY:latest,KAJA_MERCHANT_ID=KAJA_MERCHANT_ID:latest,JWT_SECRET=JWT_SECRET:latest" \
  --memory=1Gi \
  --cpu=1 \
  --timeout=60 \
  --max-instances=10 \
  --min-instances=0

echo "✅ integration-service deployed"
echo ""

# Get integration-service URL
INTEGRATION_URL=$(gcloud run services describe integration-service \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --format='value(status.url)')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Deploying delivery-service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

gcloud run deploy delivery-service \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --image="$REGISTRY/$PROJECT_ID/backend/delivery-service:latest" \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,STORE_ADDRESS=123 Main St San Antonio TX 78201,STORE_PHONE=+12109999999,STORE_LAT=29.4241,STORE_LNG=-98.4936" \
  --set-secrets="DOORDASH_DEVELOPER_ID=DOORDASH_DEVELOPER_ID:latest,DOORDASH_KEY_ID=DOORDASH_KEY_ID:latest,DOORDASH_SIGNING_SECRET=DOORDASH_SIGNING_SECRET:latest,UBER_CUSTOMER_ID=UBER_CUSTOMER_ID:latest,UBER_API_KEY=UBER_API_KEY:latest,JWT_SECRET=JWT_SECRET:latest" \
  --memory=1Gi \
  --cpu=1 \
  --timeout=60 \
  --max-instances=10 \
  --min-instances=0

echo "✅ delivery-service deployed"
echo ""

# Get delivery-service URL
DELIVERY_URL=$(gcloud run services describe delivery-service \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --format='value(status.url)')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL SERVICES DEPLOYED SUCCESSFULLY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Service URLs:"
echo "  • integration-service: $INTEGRATION_URL"
echo "  • delivery-service: $DELIVERY_URL"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Veriff webhook:"
echo "   URL: $INTEGRATION_URL/api/v1/veriff/webhook"
echo "   Login: https://station.veriff.com/login"
echo ""
echo "2. Configure LightSpeed webhooks:"
echo "   - Order webhook: $INTEGRATION_URL/api/v1/post-purchase/webhook"
echo "   - Delivery webhook: $DELIVERY_URL/api/v1/delivery/lightspeed/webhook"
echo ""
echo "3. Test endpoints:"
echo "   curl $INTEGRATION_URL/health"
echo "   curl $DELIVERY_URL/health"
echo ""
echo "🔥 DEPLOYMENT COMPLETE 🔥"

# Created: 2025-10-04
# Deploy all services to GCP Cloud Run
