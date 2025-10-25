#!/bin/bash
# DEPLOY GOOGLE MEET SCRAPER TO CLOUD RUN JOB
# Based on existing deployment patterns from integration-service

set -e

PROJECT_ID="reggieanddrodispensary"
JOB_NAME="meet-scraper-job"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${JOB_NAME}"

echo "🚀 Deploying Google Meet Scraper to Cloud Run Job..."
echo "📍 Project: $PROJECT_ID"
echo "🌎 Region: $REGION"

# Build Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME} .

# Push to Google Container Registry
echo "⬆️  Pushing image to Google Container Registry..."
docker push ${IMAGE_NAME}

# Deploy to Cloud Run Job
echo "🌐 Deploying Job to Cloud Run..."
gcloud run jobs deploy ${JOB_NAME} \
  --image ${IMAGE_NAME} \
  --region ${REGION} \
  --memory 1Gi \
  --cpu 1 \
  --task-timeout 600s \
  --max-retries 1 \
  --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID}" \
  --set-env-vars "MEET_FOLDER_NAME=Meet" \
  --set-secrets "GOOGLE_APPLICATION_CREDENTIALS=google-application-credentials:latest" \
  --set-secrets "DATABASE_URL=alloydb-connection-string:latest" \
  --service-account "high@reggieanddrodispensary.iam.gserviceaccount.com"

echo "✅ Job deployment complete!"

# Run the job now and wait for completion
echo "▶️  Executing job run..."
gcloud run jobs run ${JOB_NAME} --region ${REGION} --wait

echo "🎉 Google Meet Scraper job run finished!"

