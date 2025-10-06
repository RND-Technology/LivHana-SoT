#!/bin/bash
# Texas COA Checker - Cloud Deployment Script
# Deploys to Google Cloud Run with full Texas Full Panel validation

set -euo pipefail

PROJECT_ID=${1:-"livhana-production"}
REGION=${2:-"us-central1"}
SERVICE_NAME="texas-coa-checker"

echo "============================================"
echo "🌿 TEXAS COA CHECKER DEPLOYMENT"
echo "============================================"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo "License: Texas DSHS #690"
echo "============================================"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cp "$ROOT_DIR/backend/requirements.txt" requirements.txt
cp "$ROOT_DIR/backend/Dockerfile" Dockerfile
cp "$ROOT_DIR/backend/.dockerignore" .dockerignore
cp "$ROOT_DIR/backend/main.py" texas_coa_checker_backend.py

echo "✅ Build artifacts staged"

# Build container
echo ""
echo "📦 Building container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --project=$PROJECT_ID

# Deploy to Cloud Run
echo ""
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8000 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --project=$PROJECT_ID

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)' \
  --project=$PROJECT_ID)

echo ""
echo "============================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "============================================"
echo "Service URL: $SERVICE_URL"
echo "Health Check: $SERVICE_URL/health"
echo "API Docs: $SERVICE_URL/docs"
echo "============================================"
echo ""
echo "🧪 Testing deployment..."
curl -s "$SERVICE_URL/health" | python -m json.tool

echo ""
echo "✅ Texas COA Checker is LIVE!"
echo ""
echo "Next steps:"
echo "1. Update frontend HTML with SERVICE_URL"
echo "2. Deploy frontend to Cloud Storage + CDN"
echo "3. Configure custom domain"
echo "4. Set up monitoring and alerts"
echo ""
