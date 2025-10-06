#!/bin/bash
# Upload ALL production secrets to GCP Secret Manager
# Liv Hana ABSOLUTE - 100% TRUE, LIVE CREDENTIALS ONLY
# DO NOT RUN IN MOCK/TEST MODE

set -euo pipefail

PROJECT_ID="reggieanddrodispensary"
VAULT="LivHana-Ops-Keys"

echo "🔐 UPLOADING LIVE PRODUCTION SECRETS TO GCP SECRET MANAGER"
echo "Project: $PROJECT_ID"
echo "Vault: $VAULT"
echo "Started: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Function to upload secret to GCP
upload_secret() {
  local secret_name=$1
  local op_item=$2
  local op_field=${3:-credential}

  echo "[$(date '+%H:%M:%S')] Uploading $secret_name..."

  # Get value from 1Password
  local secret_value
  secret_value=$(op item get "$op_item" --vault "$VAULT" --fields "$op_field" --reveal 2>&1)

  if [[ $secret_value == *"ERROR"* ]]; then
    echo "  ❌ Failed to retrieve from 1Password: $secret_value"
    return 1
  fi

  # Check if secret exists
  if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1; then
    # Add new version
    echo "$secret_value" | gcloud secrets versions add "$secret_name" \
      --project="$PROJECT_ID" \
      --data-file=- >/dev/null 2>&1
    echo "  ✅ $secret_name updated (new version)"
  else
    # Create secret
    echo "$secret_value" | gcloud secrets create "$secret_name" \
      --project="$PROJECT_ID" \
      --replication-policy="automatic" \
      --data-file=- >/dev/null 2>&1
    echo "  ✅ $secret_name created"
  fi
}

# Upload all production secrets
echo "=== LIGHTSPEED POS (LIVE) ==="
upload_secret "LIGHTSPEED_CLIENT_ID" "LIGHTSPEED_CLIENT_ID"
upload_secret "LIGHTSPEED_ACCOUNT_ID" "LIGHTSPEED_ACCOUNT_ID"

echo ""
echo "=== KAJA/AUTHORIZE.NET PAYMENT (LIVE PCI) ==="
upload_secret "KAJA_API_KEY" "KAJA_API_KEY"
upload_secret "KAJA_API_SECRET" "KAJA_API_SECRET"
upload_secret "KAJA_GATEWAY_ID" "KAJA_GATEWAY_ID"
upload_secret "KAJA_WEBHOOK_SIGNATURE_KEY" "KAJA_WEBHOOK_SIGNATURE_KEY"

echo ""
echo "=== SQUARE POS (LIVE) ==="
upload_secret "SQUARE_ACCESS_TOKEN" "SQUARE_ACCESS_TOKEN"
upload_secret "SQUARE_LOCATION_ID" "SQUARE_LOCATION_ID"
upload_secret "SQUARE_APP_ID" "SQUARE_APP_ID" "credential"
upload_secret "SQUARE_WEBHOOK_SIGNATURE_KEY" "SQUARE_WEBHOOK_SIGNATURE_KEY"
upload_secret "SQUARE_API_VERSION" "SQUARE_API_VERSION"

echo ""
echo "=== AI/ML APIs (LIVE) ==="
upload_secret "ANTHROPIC_API_KEY" "ANTHROPIC_API_KEY" "credential"
upload_secret "OPENAI_API_KEY" "OPEN_AI_API_KEY"
upload_secret "ELEVENLABS_API_KEY" "ElevenLabs" "credential"
upload_secret "DEEPSEEK_API_KEY" "DEEPSEEK_API_KEY"

echo ""
echo "=== GCP/GOOGLE (LIVE) ==="
upload_secret "GCP_PROJECT_ID" "GCP_PROJECT_ID" "credential"
upload_secret "GOOGLE_API_KEY" "GOOGLE_API_KEY"

echo ""
echo "=== APPLICATION SECRETS ==="
upload_secret "JWT_SECRET_REASONING" "JWT_SECRET_REASONING" "password"
upload_secret "JWT_SECRET_VOICE" "JWT_SECRET_VOICE"
upload_secret "SESSION_JWT_SECRET" "SESSION_JWT_SECRET"

echo ""
echo "=== GCP SERVICE ACCOUNT (LIVE) ==="
# Special handling for JSON service account key
echo "[$(date '+%H:%M:%S')] Uploading GCP_SERVICE_ACCOUNT_JSON..."
op item get "GCP_BIGQUERY_SA_JSON" --vault "$VAULT" --reveal 2>&1 | \
  gcloud secrets create "GCP_SERVICE_ACCOUNT_JSON" \
    --project="$PROJECT_ID" \
    --replication-policy="automatic" \
    --data-file=- >/dev/null 2>&1 || \
  op item get "GCP_BIGQUERY_SA_JSON" --vault "$VAULT" --reveal 2>&1 | \
  gcloud secrets versions add "GCP_SERVICE_ACCOUNT_JSON" \
    --project="$PROJECT_ID" \
    --data-file=- >/dev/null 2>&1
echo "  ✅ GCP_SERVICE_ACCOUNT_JSON uploaded"

echo ""
echo "======================================"
echo "✅ ALL PRODUCTION SECRETS UPLOADED"
echo "======================================"
echo "Completed: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "Secrets uploaded: $(gcloud secrets list --project="$PROJECT_ID" --format='value(name)' | wc -l)"
echo ""
echo "Next: Deploy services with --set-secrets flags"
echo ""

# Optimized: 2025-10-03
# Mission: GCP Secret Manager Migration - LIVE CREDENTIALS ONLY
