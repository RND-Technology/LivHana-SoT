#!/bin/bash

# VOICE SERVICE DEPLOYMENT SCRIPT
# Deploys to Google Cloud Run

set -e

PROJECT_ID=${GCP_PROJECT_ID:-"livhana-trinity"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="voice-service"

echo "🎙️  Deploying Voice Service to Cloud Run..."
echo "📍 Project: $PROJECT_ID"
echo "🌎 Region: $REGION"

# Build and deploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="ELEVENLABS_API_KEY=elevenlabs-api-key:latest" \
  --set-env-vars="REASONING_GATEWAY_BASE_URL=https://brain.reggieanddro.com/api/reasoning" \
  --set-env-vars="REDIS_HOST=${REDIS_HOST:-localhost}" \
  --set-env-vars="REDIS_PORT=${REDIS_PORT:-6379}"

echo "✅ Deployment complete!"
echo ""
echo "🔗 Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"
echo ""
echo "📋 Next steps:"
echo "1. Map domain: voice.reggieanddro.com"
echo "2. Configure vibe-cockpit to use service URL"
echo "3. Test voice synthesis + reasoning queue"
