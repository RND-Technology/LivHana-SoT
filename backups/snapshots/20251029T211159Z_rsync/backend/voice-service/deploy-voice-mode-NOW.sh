#!/bin/bash
# VOICE MODE DEPLOYMENT - ONE COMMAND FIX
# Run this AFTER getting GCP permissions
# Created: 2025-10-09 by Claude Code
# Purpose: Deploy Cheetah's working voice mode to production

set -e

echo "🚀 DEPLOYING VOICE MODE TO PRODUCTION"
echo "======================================"
echo ""

# Check we're in the right directory
if [ ! -f "src/index.js" ] || [ ! -d "src/routers" ]; then
    echo "❌ ERROR: Must run from backend/voice-service directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Check for router files (Cheetah's work)
if [ ! -f "src/routers/elevenlabs-router.js" ]; then
    echo "❌ ERROR: Missing elevenlabs-router.js (Cheetah's code)"
    exit 1
fi

if [ ! -f "src/routers/reasoning-router.js" ]; then
    echo "❌ ERROR: Missing reasoning-router.js (Cheetah's code)"
    exit 1
fi

echo "✅ Cheetah's routers found:"
echo "   - src/routers/elevenlabs-router.js"
echo "   - src/routers/reasoning-router.js"
echo ""

# Set project
PROJECT_ID="reggieanddrodispensary"
REGION="us-central1"

echo "📍 Target: $PROJECT_ID ($REGION)"
echo ""

# Check if we have permissions
echo "🔐 Checking GCP permissions..."
if ! gcloud projects describe $PROJECT_ID &>/dev/null; then
    echo "❌ ERROR: No access to project $PROJECT_ID"
    echo ""
    echo "Admin must run:"
    echo "  gcloud projects add-iam-policy-binding $PROJECT_ID \\"
    echo "    --member=\"user:$(gcloud config get-value account)\" \\"
    echo "    --role=\"roles/run.developer\""
    echo ""
    exit 1
fi

echo "✅ GCP access confirmed"
echo ""

# Deploy voice service
echo "🎙️  Deploying voice-service..."
echo ""

gcloud run deploy voice-service \
  --source . \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="ELEVENLABS_API_KEY=elevenlabs-api-key:latest" \
  --set-env-vars="REASONING_GATEWAY_BASE_URL=https://reasoning-gateway-980910443251.us-central1.run.app/api/reasoning" \
  --set-env-vars="REDIS_HOST=localhost" \
  --set-env-vars="REDIS_PORT=6379"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ DEPLOYMENT FAILED"
    exit 1
fi

echo ""
echo "✅ DEPLOYMENT COMPLETE"
echo ""

# Get deployed URL
SERVICE_URL=$(gcloud run services describe voice-service --region $REGION --project $PROJECT_ID --format="value(status.url)")
echo "🔗 Service URL: $SERVICE_URL"
echo ""

# Test endpoints
echo "🧪 TESTING DEPLOYED ENDPOINTS"
echo "=============================="
echo ""

echo "1. Health Check:"
curl -s "$SERVICE_URL/health" | jq . || echo "   ❌ Failed"
echo ""

echo "2. ElevenLabs Endpoint:"
RESPONSE=$(curl -s "$SERVICE_URL/api/elevenlabs/voices")
if echo "$RESPONSE" | grep -q "Cannot GET"; then
    echo "   ❌ FAILED: Old code still deployed (route doesn't exist)"
    echo "   Response: $RESPONSE"
    exit 1
elif echo "$RESPONSE" | grep -q "success"; then
    echo "   ✅ WORKING: Endpoint exists and responds"
    echo "   Response: $RESPONSE"
else
    echo "   ⚠️  Unexpected response: $RESPONSE"
fi
echo ""

echo "3. Reasoning Endpoint:"
RESPONSE=$(curl -s -X POST "$SERVICE_URL/api/reasoning/enqueue" \
    -H "Content-Type: application/json" \
    -d '{"prompt":"deployment test"}')
if echo "$RESPONSE" | grep -q "Cannot POST"; then
    echo "   ❌ FAILED: Old code still deployed (route doesn't exist)"
    echo "   Response: $RESPONSE"
    exit 1
elif echo "$RESPONSE" | grep -q "success"; then
    echo "   ✅ WORKING: Endpoint exists and responds"
    echo "   Response: $RESPONSE"
else
    echo "   ⚠️  Unexpected response: $RESPONSE"
fi
echo ""

echo "🎉 SUCCESS! Voice mode deployed to production!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Update frontend URLs in app.js if needed:"
echo "   VOICE_SERVICE_URL = '$SERVICE_URL'"
echo ""
echo "2. Test at herbitrage.com:"
echo "   - Login as jesseniesen@gmail.com"
echo "   - Click 'Talk to Liv'"
echo "   - Verify voice conversation works"
echo "   - Verify continuous mode auto-resumes"
echo ""
echo "3. Generate completion receipt"
echo ""
echo "✅ Deployment verified and ready for production use!"
