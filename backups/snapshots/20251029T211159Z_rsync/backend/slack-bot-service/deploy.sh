#!/bin/bash
# Deploy Slack Bot Service - $500/day target

set -e

SERVICE_NAME="slack-bot-livhana"
REGION="us-central1"

echo "🚀 Deploying Slack Bot Service"

# Deploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars="SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN},SLACK_SIGNING_SECRET=${SLACK_SIGNING_SECRET}"

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo ""
echo "✅ DEPLOYED: $SERVICE_URL"
echo "📋 Add to Slack: $SERVICE_URL/slack/events"
echo "💰 Target: \$500/day (10 members at \$50/month)"
