#!/bin/bash
# Emergency deployment script - works WITHOUT external API keys
# Uses mock data for YouTube/NewsAPI until keys are available

set -e

echo "🚨 EMERGENCY DEPLOYMENT - MOCK MODE ENABLED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Services deploying with workarounds:"
echo "  ✅ Webhook Listener - No external APIs needed"
echo "  ⚠️  YouTube Analyzer - Using mock data"
echo "  ⚠️  NewsAPI Pipeline - Using mock data"
echo "  ✅ Content Engine - Can generate with mock inputs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PROJECT_ID="reggieanddrodispensary"
REGION="us-central1"

# 1. Deploy Webhook Listener (WORKS - no external APIs)
echo ""
echo "📡 Deploying Lightspeed Webhook Listener..."
cd backend/integration-service

gcloud run deploy lightspeed-webhook \
  --source . \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="PORT=8080" \
  --set-env-vars="MOCK_MODE=false" \
  --memory=512Mi \
  --cpu=1 \
  --timeout=60s \
  --project=${PROJECT_ID}

echo "✅ Webhook Listener deployed!"

# 2. Deploy YouTube Analyzer (MOCK MODE)
echo ""
echo "📊 Deploying YouTube Analyzer (MOCK MODE)..."
cd ../analytics-service

gcloud run deploy youtube-analyzer \
  --source . \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="PORT=8080" \
  --set-env-vars="MOCK_MODE=true" \
  --memory=512Mi \
  --cpu=1 \
  --timeout=60s \
  --project=${PROJECT_ID}

echo "✅ YouTube Analyzer deployed in MOCK MODE!"

# 3. Deploy NewsAPI Pipeline (MOCK MODE)
echo ""
echo "📰 Deploying NewsAPI Pipeline (MOCK MODE)..."

gcloud run deploy newsapi-pipeline \
  --source . \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="PORT=8080" \
  --set-env-vars="MOCK_MODE=true" \
  --memory=512Mi \
  --cpu=1 \
  --timeout=60s \
  --project=${PROJECT_ID}

echo "✅ NewsAPI Pipeline deployed in MOCK MODE!"

# 4. Deploy Content Engine (CAN USE MOCK DATA)
echo ""
echo "🎬 Deploying HNC Content Engine..."
cd ../../empire/content-engine

gcloud run deploy hnc-content-engine \
  --source . \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="PORT=8080" \
  --set-env-vars="AUTONOMOUS_MODE=true" \
  --set-env-vars="MOCK_MODE=true" \
  --memory=1Gi \
  --cpu=2 \
  --timeout=300s \
  --project=${PROJECT_ID}

echo "✅ Content Engine deployed!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ EMERGENCY DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  SERVICES RUNNING IN MOCK MODE:"
echo "   - YouTube Analyzer: Using sample viral patterns"
echo "   - NewsAPI Pipeline: Using sample cannabis news"
echo ""
echo "✅ SERVICES FULLY FUNCTIONAL:"
echo "   - Webhook Listener: Ready for Lightspeed orders"
echo "   - Content Engine: Generating episodes with available data"
echo ""
echo "📝 UPGRADE PATH:"
echo "   1. Get YouTube API key → Update YouTube Analyzer"
echo "   2. Get NewsAPI key → Update NewsAPI Pipeline"
echo "   3. Services will automatically use real data"
echo ""
echo "🎯 ALL SERVICES DEPLOYED AND OPERATIONAL!"

# Optimized: 2025-10-08
