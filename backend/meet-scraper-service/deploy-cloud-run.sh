#!/bin/bash
# DEPLOY GOOGLE MEET SCRAPER TO CLOUD RUN JOB
# Based on existing deployment patterns from integration-service

set -e

PROJECT_ID="reggieanddrodispensary"
JOB_NAME="meet-scraper-job"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${JOB_NAME}"
# Allow override via RUN_SA env; default to dedicated job SA
RUN_SA="${RUN_SA:-meet-scraper-job-sa@${PROJECT_ID}.iam.gserviceaccount.com}"

echo "🚀 Deploying Google Meet Scraper to Cloud Run Job..."
echo "📍 Project: $PROJECT_ID"
echo "🌎 Region: $REGION"

# Build Docker image
echo "📦 Building linux/amd64 Docker image (multi-arch safe for Cloud Run)..."
# Ensure buildx is available and use it
docker buildx create --name meet_builder --use >/dev/null 2>&1 || docker buildx use meet_builder
docker buildx build --platform linux/amd64 -t ${IMAGE_NAME} --push .

echo "👤 Verifying service account: ${RUN_SA}"
if ! gcloud iam service-accounts describe "${RUN_SA}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  echo "ℹ️  Service account not found. Creating: ${RUN_SA}"
  gcloud iam service-accounts create "meet-scraper-job-sa" \
    --project "${PROJECT_ID}" \
    --display-name "Meet Scraper Job SA"
fi

# Grant Secret Manager access for AlloyDB DSN to the run SA (per-secret binding avoids org policy issues)
echo "🔐 Ensuring Secret Manager access for DATABASE_URL secret..."
gcloud secrets add-iam-policy-binding alloydb-connection-string \
  --member="serviceAccount:${RUN_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --project "${PROJECT_ID}" || true

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
  ${MEET_FOLDER_ID:+--set-env-vars "MEET_FOLDER_ID=${MEET_FOLDER_ID}"} \
  ${SHARED_DRIVE_ID:+--set-env-vars "SHARED_DRIVE_ID=${SHARED_DRIVE_ID}"} \
  --set-secrets "DATABASE_URL=alloydb-connection-string:latest" \
  --service-account "${RUN_SA}" \
  ${SVPC_CONNECTOR:+--vpc-connector=${SVPC_CONNECTOR}} ${SVPC_CONNECTOR:+--vpc-egress=all-traffic} \
  ${GOOGLE_SUBJECT:+--set-env-vars "GOOGLE_SUBJECT=${GOOGLE_SUBJECT}"}

echo "✅ Job deployment complete!"

# Run the job now and wait for completion
echo "▶️  Executing job (stable CLI: execute)..."
gcloud run jobs execute ${JOB_NAME} --region ${REGION} --wait

echo "🎉 Google Meet Scraper job run finished!"

