#!/usr/bin/env bash
# Deploy Unified Voice Router to Cloud Run
# VS Code Twin - Circle of Self-Creation
# Date: 2025-10-31

set -euo pipefail

PROJECT_ID="reggieanddrodispensary"
SERVICE_NAME="voice-service"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "🟦 VS CODE TWIN - Starting Cloud Run deployment"
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"

# Step 1: Build Docker image
echo ""
echo "📦 Step 1/4: Building Docker image..."
cd "$(dirname "$0")/../../backend/voice-service"

if [[ ! -f "Dockerfile" ]]; then
  echo "❌ Dockerfile not found. Creating production Dockerfile..."
  cat > Dockerfile <<'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
EOF
fi

docker build -t "${IMAGE_NAME}" .

# Step 2: Push to Google Container Registry
echo ""
echo "☁️  Step 2/4: Pushing image to GCR..."
docker push "${IMAGE_NAME}"

# Step 3: Deploy to Cloud Run
echo ""
echo "🚀 Step 3/4: Deploying to Cloud Run..."
gcloud run services replace cloudrun-service.yaml \
  --region="${REGION}" \
  --project="${PROJECT_ID}"

# Step 4: Get service URL
echo ""
echo "🔗 Step 4/4: Getting service URL..."
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)")

echo ""
echo "✅ Deployment complete!"
echo "Service URL: ${SERVICE_URL}"
echo ""
echo "Test endpoints:"
echo "  Health: ${SERVICE_URL}/health"
echo "  Stats: ${SERVICE_URL}/api/voice/stats"
echo "  WebSocket: ws://${SERVICE_URL#https://}/api/voice/ws"
echo ""
echo "🎖️ Semper Fi - VS Code Twin"
