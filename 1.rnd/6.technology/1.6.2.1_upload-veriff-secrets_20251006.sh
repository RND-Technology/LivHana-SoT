#!/bin/bash
#
# Upload Veriff Credentials to GCP Secret Manager
#
# Usage: ./scripts/upload-veriff-secrets.sh
#

set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-reggieanddrodispensary}"

echo "🔐 Uploading Veriff credentials to GCP Secret Manager"
echo "Project: $PROJECT_ID"
echo ""

# Get credentials from 1Password
echo "📋 Fetching credentials from 1Password..."
[REDACTED - SECURITY BREACH]
VERIFF_SECRET_KEY=$(op item get "VERIFF_SECRET_KEY" --reveal --fields label=credential 2>/dev/null)

[REDACTED - SECURITY BREACH]
  echo "❌ Failed to get Veriff credentials from 1Password"
  exit 1
fi

echo "✅ Credentials retrieved"
echo ""

[REDACTED - SECURITY BREACH]
[REDACTED - SECURITY BREACH]
[REDACTED - SECURITY BREACH]
  echo "Secret exists, creating new version..."
[REDACTED - SECURITY BREACH]
    --project="$PROJECT_ID" \
    --data-file=-
else
  echo "Creating new secret..."
[REDACTED - SECURITY BREACH]
    --project="$PROJECT_ID" \
    --data-file=- \
    --replication-policy="automatic"
fi
[REDACTED - SECURITY BREACH]

# Upload VERIFF_SECRET_KEY (for webhook signature verification)
echo ""
echo "📤 Uploading VERIFF_SECRET_KEY..."
if gcloud secrets describe VERIFF_SECRET_KEY --project="$PROJECT_ID" &>/dev/null; then
  echo "Secret exists, creating new version..."
  echo -n "$VERIFF_SECRET_KEY" | gcloud secrets versions add VERIFF_SECRET_KEY \
    --project="$PROJECT_ID" \
    --data-file=-
else
  echo "Creating new secret..."
  echo -n "$VERIFF_SECRET_KEY" | gcloud secrets create VERIFF_SECRET_KEY \
    --project="$PROJECT_ID" \
    --data-file=- \
    --replication-policy="automatic"
fi
echo "✅ VERIFF_SECRET_KEY uploaded"

# Upload VERIFF_BASE_URL
echo ""
echo "📤 Uploading VERIFF_BASE_URL..."
VERIFF_BASE_URL="https://stationapi.veriff.com"
if gcloud secrets describe VERIFF_BASE_URL --project="$PROJECT_ID" &>/dev/null; then
  echo "Secret exists, creating new version..."
  echo -n "$VERIFF_BASE_URL" | gcloud secrets versions add VERIFF_BASE_URL \
    --project="$PROJECT_ID" \
    --data-file=-
else
  echo "Creating new secret..."
  echo -n "$VERIFF_BASE_URL" | gcloud secrets create VERIFF_BASE_URL \
    --project="$PROJECT_ID" \
    --data-file=- \
    --replication-policy="automatic"
fi
echo "✅ VERIFF_BASE_URL uploaded"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL VERIFF SECRETS UPLOADED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Secrets in GCP Secret Manager:"
[REDACTED - SECURITY BREACH]
echo "  • VERIFF_SECRET_KEY"
echo "  • VERIFF_BASE_URL"
echo ""
echo "Next steps:"
echo "1. Deploy integration-service with secrets:"
echo "   gcloud run deploy integration-service \\"
[REDACTED - SECURITY BREACH]
echo ""
echo "2. Test Veriff session creation:"
echo "   curl -X POST https://[service-url]/api/v1/post-purchase/verify \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"orderId\":\"TEST-001\",\"customerEmail\":\"test@example.com\"}'"
echo ""
echo "3. Configure Veriff webhook in dashboard:"
echo "   URL: https://[service-url]/api/v1/veriff/webhook"
echo ""

# Created: 2025-10-04
# Upload Veriff credentials to GCP Secret Manager
