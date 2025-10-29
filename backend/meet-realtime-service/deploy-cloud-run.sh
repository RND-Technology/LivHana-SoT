#!/bin/bash
# Deploy Google Meet Real-Time Capture Service to Cloud Run
# Project: reggieanddrodispensary
# Region: us-central1

set -e

echo "🚀 Deploying Google Meet Real-Time Capture Service to Cloud Run..."

PROJECT_ID="reggieanddrodispensary"
SERVICE_NAME="meet-realtime-service"
REGION="us-central1"
DATABASE_URL="postgresql://postgres:x77BXLIf3dGhUwd9SWL1xOOzS@172.18.113.2:5432/postgres"

# Build and deploy using gcloud
gcloud run deploy ${SERVICE_NAME} \
  --source . \
  --project=${PROJECT_ID} \
  --region=${REGION} \
  --platform=managed \
  --allow-unauthenticated \
  --memory=4Gi \
  --cpu=2 \
  --timeout=3600 \
  --concurrency=80 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="DATABASE_URL=${DATABASE_URL},GCP_PROJECT_ID=${PROJECT_ID}" \
  --vpc-connector=hn-svpc \
  --vpc-egress=private-ranges-only

echo "✅ Deployment complete!"
echo ""
echo "Service URL:"
gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)"

echo ""
echo "🎉 Google Meet Real-Time Capture Service is live!"
echo ""
echo "Next steps:"
echo "1. Start capturing: POST {SERVICE_URL}/api/v1/capture/start"
echo "2. Connect WebSocket: ws://{SERVICE_URL}/ws/{session_id}"
echo "3. Query transcripts: GET {SERVICE_URL}/api/v1/sessions/{session_id}/transcripts"
