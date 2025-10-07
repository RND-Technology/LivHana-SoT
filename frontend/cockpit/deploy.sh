#!/bin/bash
# Deploy Liv Hana Empire Cockpit to Google Cloud Run

set -e

PROJECT_ID="livhana-trinity"
SERVICE_NAME="vip-cockpit"
REGION="us-central1"

echo "🚀 Deploying Liv Hana Empire Cockpit..."

# Build and deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --project $PROJECT_ID

echo ""
echo "✅ Cockpit deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Map domain: cockpit.herbitrage.com"
echo "2. Command:"
echo "   gcloud run domain-mappings create \\"
echo "     --service $SERVICE_NAME \\"
echo "     --domain cockpit.herbitrage.com \\"
echo "     --region $REGION \\"
echo "     --project $PROJECT_ID"
echo ""
