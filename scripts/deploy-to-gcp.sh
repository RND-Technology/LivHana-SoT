#!/bin/bash
# GCP Mission 9-10: Deploy Backend + Frontend to Cloud Run
# Liv Hana ABSOLUTE - 100% TRUE Production Deployment

set -euo pipefail

PROJECT_ID="reggieanddrodispensary"
REGION="us-central1"

echo "🚀 LIV HANA GCP DEPLOYMENT - MISSION 9+10"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Started: $(date)"
echo ""

# Backend services to deploy
BACKEND_SERVICES=(
  "integration-service:3005"
  "payment-service:3002"
  "reasoning-gateway:3004"
  "cannabis-service:3006"
  "voice-service:3007"
  "product-service:3003"
)

# Deploy backend services
echo "=== DEPLOYING BACKEND SERVICES ==="
for service_port in "${BACKEND_SERVICES[@]}"; do
  IFS=':' read -r service port <<< "$service_port"

  echo ""
  echo "[$(date +%H:%M:%S)] Deploying $service..."

  cd "/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/$service"

  # Build and deploy in one command
  gcloud run deploy "$service" \
    --source . \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --project "$PROJECT_ID" \
    --port "$port" \
    --timeout 300 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    2>&1 | tee "/tmp/deploy-$service.log"

  # Get service URL
  SERVICE_URL=$(gcloud run services describe "$service" \
    --platform managed \
    --region "$REGION" \
    --project "$PROJECT_ID" \
    --format 'value(status.url)' 2>/dev/null || echo "PENDING")

  echo "✅ $service deployed: $SERVICE_URL"
  echo "$service|$SERVICE_URL" >> /tmp/gcp-services.txt
done

# Deploy frontend
echo ""
echo "=== DEPLOYING FRONTEND ==="
echo ""
echo "[$(date +%H:%M:%S)] Deploying vibe-cockpit..."

cd "/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit"

gcloud run deploy vibe-cockpit \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --project "$PROJECT_ID" \
  --port 3000 \
  --timeout 300 \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  2>&1 | tee /tmp/deploy-vibe-cockpit.log

VIBE_URL=$(gcloud run services describe vibe-cockpit \
  --platform managed \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format 'value(status.url)' 2>/dev/null || echo "PENDING")

echo "✅ vibe-cockpit deployed: $VIBE_URL"
echo "vibe-cockpit|$VIBE_URL" >> /tmp/gcp-services.txt

# Summary
echo ""
echo "======================================"
echo "✅ GCP DEPLOYMENT COMPLETE"
echo "======================================"
echo "Completed: $(date)"
echo ""
echo "Deployed Services:"
cat /tmp/gcp-services.txt | while IFS='|' read -r service url; do
  echo "  $service: $url"
done
echo ""
echo "Next: Configure Load Balancer + CDN + DNS"
echo ""

# Optimized: 2025-10-03
# Mission: GCP Layer 1+2 Deployment
