#!/bin/bash

# NASH-BEATING DELIVERY SERVICE DEPLOYMENT
# Deploys to Google Cloud Run with auto-scaling

set -e

PROJECT_ID=${GCP_PROJECT_ID:-"reggieanddrodispensary"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="delivery-service"

echo "🚚 Deploying Nash-beating Delivery Service to Cloud Run..."
echo "📍 Project: $PROJECT_ID"
echo "🌎 Region: $REGION"
echo "🏆 Mission: Beat Nash/Square with direct integration"

# Build and deploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 4003 \
  --memory 1Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 100 \
  --min-instances 1 \
  --concurrency 1000 \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="LIGHTSPEED_API_TOKEN=lightspeed-api-token:latest" \
  --set-secrets="DOORDASH_DEVELOPER_ID=doordash-developer-id:latest" \
  --set-secrets="DOORDASH_KEY_ID=doordash-key-id:latest" \
  --set-secrets="DOORDASH_SIGNING_SECRET=doordash-signing-secret:latest" \
  --set-secrets="UBER_API_KEY=uber-api-key:latest" \
  --set-env-vars="STORE_PHONE=+1-210-555-0100" \
  --set-env-vars="DELIVERY_RADIUS_MILES=35" \
  --set-env-vars="MAX_DELIVERY_COST=15.00" \
  --set-env-vars="ENABLE_PROVIDER_COMPARISON=true" \
  --set-env-vars="ENABLE_REAL_TIME_TRACKING=true" \
  --set-env-vars="ENABLE_AUTOMATIC_FAILOVER=true" \
  --set-env-vars="ENABLE_COST_TRANSPARENCY=true"

echo "✅ Deployment complete!"
echo ""
echo "🔗 Service URL:"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")
echo "$SERVICE_URL"
echo ""
echo "📋 API Endpoints:"
echo "🏥 Health Check: $SERVICE_URL/health"
echo "💰 Single Quote: $SERVICE_URL/api/delivery/quote"
echo "🏆 Provider Comparison: $SERVICE_URL/api/delivery/providers/compare"
echo "🔌 Lightspeed Webhook: $SERVICE_URL/api/delivery/lightspeed/webhook"
echo "📊 Delivery Status: $SERVICE_URL/api/delivery/status/:deliveryId"
echo "❌ Cancel Delivery: $SERVICE_URL/api/delivery/cancel"
echo ""
echo "🧪 Test the deployment:"
echo "curl $SERVICE_URL/health"
echo ""
echo "🏆 Nash-beating features:"
echo "✅ Direct Lightspeed integration (no Square intermediary)"
echo "✅ Multi-provider routing (DoorDash + Uber)"
echo "✅ Real-time cost comparison"
echo "✅ Automatic failover"
echo "✅ $50+ savings per order vs Nash"
echo ""
echo "📋 Next steps:"
echo "1. Configure Lightspeed webhook URL: $SERVICE_URL/api/delivery/lightspeed/webhook"
echo "2. Test provider comparison API"
echo "3. Set up monitoring and alerting"
echo "4. Launch customer-facing delivery options"
echo "5. Monitor cost savings vs Nash/Square"
echo ""
echo "🚀 NASH-BEATING DELIVERY SERVICE DEPLOYED! 🚀"
