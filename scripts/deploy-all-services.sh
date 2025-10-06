#!/bin/bash

# CHEETAH POWER - DEPLOY ALL SERVICES TO CLOUD RUN
# E2E Empire Complete Production Deployment

set -e

echo "🚨 CHEETAH POWER - DEPLOYING ALL SERVICES TO CLOUD RUN!"
echo ""

# Set project
PROJECT_ID="reggieanddrodispensary"
REGION="us-central1"

echo "📋 Project: $PROJECT_ID"
echo "🌍 Region: $REGION"
echo ""

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com --project=$PROJECT_ID

# Deploy OPS Full Build
echo "🏛️ Deploying OPS Full Build..."
cd empire/ops-full-build
gcloud run deploy ops-full-build \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="NODE_ENV=production,API_VERSION=v1" \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --project=$PROJECT_ID
cd ../..

# Deploy Texas COA Standalone
echo "🔬 Deploying Texas COA Standalone..."
cd empire/texas-coa-standalone
gcloud run deploy texas-coa-standalone \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8081 \
  --set-env-vars="NODE_ENV=production,API_VERSION=v1" \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --project=$PROJECT_ID
cd ../..

# Deploy Square Integration
echo "💳 Deploying Square Integration..."
cd empire/square-integration
gcloud run deploy square-integration \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8082 \
  --set-env-vars="NODE_ENV=production,API_VERSION=v1" \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --project=$PROJECT_ID
cd ../..

# Deploy RPM DNA System
echo "🧬 Deploying RPM DNA System..."
cd empire/rpm-dna-system
gcloud run deploy rpm-dna-system \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8083 \
  --set-env-vars="NODE_ENV=production,API_VERSION=v1" \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --project=$PROJECT_ID
cd ../..

# Deploy Conversion Optimization
echo "📈 Deploying Conversion Optimization..."
cd empire/conversion-optimization
gcloud run deploy conversion-optimization \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8084 \
  --set-env-vars="NODE_ENV=production,API_VERSION=v1" \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --project=$PROJECT_ID
cd ../..

# Deploy Brand Alignment
echo "🔥 Deploying Brand Alignment..."
cd empire/brand-alignment
gcloud run deploy brand-alignment \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8085 \
  --set-env-vars="NODE_ENV=production,API_VERSION=v1" \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --project=$PROJECT_ID
cd ../..

# Deploy HCN Production Pipeline
echo "🎬 Deploying HCN Production Pipeline..."
cd empire/hcn-production
gcloud run deploy hcn-production \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8086 \
  --set-env-vars="NODE_ENV=production,API_VERSION=v1" \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --project=$PROJECT_ID
cd ../..

# Deploy Vibe Cockpit (Frontend)
echo "🎛️ Deploying Vibe Cockpit..."
cd frontend/vibe-cockpit
gcloud run deploy vibe-cockpit \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 80 \
  --set-env-vars="NODE_ENV=production" \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --project=$PROJECT_ID
cd ../..

echo ""
echo "✅ ALL SERVICES DEPLOYED TO CLOUD RUN!"
echo ""
echo "🌐 PRODUCTION LINKS:"
echo "• OPS Full Build: https://ops-full-build-$PROJECT_ID.$REGION.run.app"
echo "• Texas COA Standalone: https://texas-coa-standalone-$PROJECT_ID.$REGION.run.app"
echo "• Square Integration: https://square-integration-$PROJECT_ID.$REGION.run.app"
echo "• RPM DNA System: https://rpm-dna-system-$PROJECT_ID.$REGION.run.app"
echo "• Conversion Optimization: https://conversion-optimization-$PROJECT_ID.$REGION.run.app"
echo "• Brand Alignment: https://brand-alignment-$PROJECT_ID.$REGION.run.app"
echo "• HCN Production: https://hcn-production-$PROJECT_ID.$REGION.run.app"
echo "• Vibe Cockpit: https://vibe-cockpit-$PROJECT_ID.$REGION.run.app"
echo ""
echo "🚨 CHEETAH POWER - DEPLOYMENT COMPLETE!"