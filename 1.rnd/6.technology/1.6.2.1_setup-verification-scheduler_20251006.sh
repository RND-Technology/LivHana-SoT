#!/bin/bash
#
# Setup Cloud Scheduler Job for Post-Purchase Verification
# Checks for expired verifications every 15 minutes and triggers auto-refunds
#
# Usage: ./scripts/setup-verification-scheduler.sh
#

set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-reggieanddrodispensary}"
SERVICE_URL="${INTEGRATION_SERVICE_URL:-https://integration-service-XXXXX.run.app}"
REGION="${GCP_REGION:-us-central1}"

echo "🕐 Setting up Cloud Scheduler for verification expiration checks"
echo "Project: $PROJECT_ID"
echo "Service URL: $SERVICE_URL"
echo "Region: $REGION"

# Create service account for Cloud Scheduler (if it doesn't exist)
SA_NAME="verification-scheduler"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo ""
echo "📝 Creating service account: $SA_NAME"

if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
  echo "✅ Service account already exists: $SA_EMAIL"
else
  gcloud iam service-accounts create "$SA_NAME" \
    --project="$PROJECT_ID" \
    --display-name="Post-Purchase Verification Scheduler" \
    --description="Service account for Cloud Scheduler to trigger verification expiration checks"
  echo "✅ Service account created: $SA_EMAIL"
fi

# Grant permissions to invoke Cloud Run service
echo ""
echo "🔐 Granting Cloud Run Invoker role to service account"
gcloud run services add-iam-policy-binding integration-service \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.invoker" \
  --quiet

echo "✅ Permissions granted"

# Create Cloud Scheduler job (runs every 15 minutes)
echo ""
echo "⏰ Creating Cloud Scheduler job: verification-expiration-check"

JOB_NAME="verification-expiration-check"
SCHEDULE="*/15 * * * *"  # Every 15 minutes
ENDPOINT="${SERVICE_URL}/api/v1/post-purchase/check-expired"

# Delete existing job if it exists
if gcloud scheduler jobs describe "$JOB_NAME" --project="$PROJECT_ID" --location="$REGION" &>/dev/null; then
  echo "🗑️  Deleting existing job..."
  gcloud scheduler jobs delete "$JOB_NAME" \
    --project="$PROJECT_ID" \
    --location="$REGION" \
    --quiet
  echo "✅ Existing job deleted"
fi

# Create new job
gcloud scheduler jobs create http "$JOB_NAME" \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --schedule="$SCHEDULE" \
  --uri="$ENDPOINT" \
  --http-method="POST" \
  --oidc-service-account-email="$SA_EMAIL" \
  --oidc-token-audience="$ENDPOINT" \
  --time-zone="America/Chicago" \
  --description="Check for expired post-purchase verifications and trigger auto-refunds" \
  --headers="Content-Type=application/json" \
  --message-body='{}'

echo "✅ Cloud Scheduler job created successfully"

# Run the job immediately to test
echo ""
echo "🧪 Running test execution..."
gcloud scheduler jobs run "$JOB_NAME" \
  --project="$PROJECT_ID" \
  --location="$REGION"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATION SCHEDULER SETUP COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Job Details:"
echo "  Name:     $JOB_NAME"
echo "  Schedule: Every 15 minutes"
echo "  Endpoint: $ENDPOINT"
echo "  Timezone: America/Chicago (CST)"
echo ""
echo "View job logs:"
echo "  gcloud scheduler jobs describe $JOB_NAME --project=$PROJECT_ID --location=$REGION"
echo ""
echo "View execution history:"
echo "  gcloud logging read 'resource.type=cloud_scheduler_job AND resource.labels.job_id=$JOB_NAME' --project=$PROJECT_ID --limit=20"
echo ""
echo "Manual trigger:"
echo "  gcloud scheduler jobs run $JOB_NAME --project=$PROJECT_ID --location=$REGION"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Created: 2025-10-04
# Post-purchase verification automation
# 72-hour countdown + auto-refund system
