#!/bin/bash
# One-command deployment for Custom GPT Service
# Target: $300/day from 3,000 queries

set -e

echo "🚀 Deploying Custom GPT Cannabis Intelligence Service"
echo ""

# Configuration
SERVICE_NAME="custom-gpt-cannabis"
REGION="us-central1"
PROJECT_ID=$(gcloud config get-value project)

echo "📋 Configuration:"
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Project: $PROJECT_ID"
echo ""

# Check OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set. Checking GSM..."
    OPENAI_API_KEY=$(gcloud secrets versions access latest --secret="OPENAI_API_KEY" 2>/dev/null || echo "")
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "❌ OPENAI_API_KEY not found in GSM or environment"
        echo "   Please set: export OPENAI_API_KEY='your-key'"
        exit 1
    fi
    echo "✅ Found OPENAI_API_KEY in GSM"
fi

# Deploy to Cloud Run
echo ""
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60s \
  --max-instances 10 \
  --set-env-vars="OPENAI_API_KEY=${OPENAI_API_KEY}"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Service URL: $SERVICE_URL"
echo "📋 Health Check: $SERVICE_URL/health"
echo "📋 API Docs: $SERVICE_URL/docs"
echo ""
echo "🧪 Test Query:"
echo "curl -X POST $SERVICE_URL/api/v1/query \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"question\": \"What is Blue Dream?\", \"user_age_verified\": true}'"
echo ""
echo "💰 Revenue Target: \$300/day (3,000 queries at \$0.10 each)"
echo ""
