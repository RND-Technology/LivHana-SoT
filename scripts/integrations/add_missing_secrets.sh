#!/usr/bin/env bash
set -euo pipefail

# Add Missing Secrets to Google Secret Manager
# Compliance: LifeWard standard, 21+ age-gate, NIST methods
# Date: 2025-10-21

GCP_PROJECT="${GCP_PROJECT_ID:-reggieanddrodispensary}"
REGION="us-central1"

echo "========================================="
echo "Add Missing Secrets to GSM"
echo "Project: $GCP_PROJECT"
echo "========================================="
echo

# Function to add or update secret
add_secret() {
  local SECRET_NAME="$1"
  local SECRET_DESCRIPTION="$2"
  local PROMPT_MSG="$3"
  
  echo "Adding secret: $SECRET_NAME"
  echo "Description: $SECRET_DESCRIPTION"
  
  # Check if secret already exists
  if gcloud secrets describe "$SECRET_NAME" --project="$GCP_PROJECT" &>/dev/null; then
    echo "✅ Secret $SECRET_NAME already exists"
    read -p "Do you want to update it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Skipping $SECRET_NAME"
      echo
      return 0
    fi
  else
    # Create secret
    gcloud secrets create "$SECRET_NAME" \
      --project="$GCP_PROJECT" \
      --replication-policy="automatic" \
      --labels="env=production,managed_by=trinity"
    echo "✅ Created secret: $SECRET_NAME"
  fi
  
  # Prompt for secret value
  echo "$PROMPT_MSG"
  read -s -p "Enter secret value (input hidden): " SECRET_VALUE
  echo
  
  if [[ -z "$SECRET_VALUE" ]]; then
    echo "⚠️  Empty value provided. Skipping."
    echo
    return 1
  fi
  
  # Add new version
  echo "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" \
    --project="$GCP_PROJECT" \
    --data-file=-
  
  echo "✅ Added new version to $SECRET_NAME"
  echo
}

# Function to create alias/reference
create_alias() {
  local ALIAS_NAME="$1"
  local TARGET_SECRET="$2"
  
  echo "Creating alias: $ALIAS_NAME -> $TARGET_SECRET"
  
  # Check if alias already exists
  if gcloud secrets describe "$ALIAS_NAME" --project="$GCP_PROJECT" &>/dev/null; then
    echo "✅ Alias $ALIAS_NAME already exists"
    echo
    return 0
  fi
  
  # Get the latest version value from target secret
  TARGET_VALUE=$(gcloud secrets versions access latest \
    --secret="$TARGET_SECRET" \
    --project="$GCP_PROJECT")
  
  # Create alias secret with same value
  gcloud secrets create "$ALIAS_NAME" \
    --project="$GCP_PROJECT" \
    --replication-policy="automatic" \
    --labels="env=production,managed_by=trinity,alias_of=$TARGET_SECRET"
  
  echo "$TARGET_VALUE" | gcloud secrets versions add "$ALIAS_NAME" \
    --project="$GCP_PROJECT" \
    --data-file=-
  
  echo "✅ Created alias: $ALIAS_NAME"
  echo
}

# 1. Add DEEPSEEK_API_KEY
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1/4: DEEPSEEK_API_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_secret \
  "DEEPSEEK_API_KEY" \
  "DeepSeek AI API key for reasoning gateway" \
  "Get your DeepSeek API key from: https://platform.deepseek.com/api_keys"

# 2. Add BLUECHECK_API_KEY
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2/4: BLUECHECK_API_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_secret \
  "BLUECHECK_API_KEY" \
  "BlueCheck age verification API key (21+ compliance)" \
  "Get your BlueCheck API key from: https://www.bluecheck.me/for-developers"

# 3. Add GITHUB_PERSONAL_ACCESS_TOKEN
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3/4: GITHUB_PERSONAL_ACCESS_TOKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_secret \
  "GITHUB_PERSONAL_ACCESS_TOKEN" \
  "GitHub PAT for repo access and automation" \
  "Generate GitHub PAT from: https://github.com/settings/tokens/new (scopes: repo, workflow)"

# 4. Add JWT_SECRET1 (primary JWT secret)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4/4: JWT_SECRET1"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if add_secret \
  "JWT_SECRET1" \
  "Primary JWT secret for voice and reasoning services" \
  "Generate a strong random secret (min 64 chars). Suggestion: openssl rand -hex 64"; then
  
  # Create aliases for JWT_SECRET_REASONING and JWT_SECRET_VOICE
  echo
  echo "Creating JWT aliases..."
  create_alias "JWT_SECRET_REASONING" "JWT_SECRET1"
  create_alias "JWT_SECRET_VOICE" "JWT_SECRET1"
fi

## 5. Add Calendar-Agent-Builder (GSM)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5/8: Calendar-Agent-Builder"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_secret \
  "Calendar-Agent-Builder" \
  "Google Calendar Agent Builder credentials/token (used by node_14)" \
  "Paste Google Calendar credentials/token (JSON as one line or base64-encoded)"

## 6. Add Gmail-Agent-Builder (GSM)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6/8: Gmail-Agent-Builder"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_secret \
  "Gmail-Agent-Builder" \
  "Gmail Agent Builder credentials/token (used by node_15)" \
  "Paste Gmail credentials/token (JSON as one line or base64-encoded)"

## 7. Add Drive-Agent-Builder (GSM)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7/8: Drive-Agent-Builder"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_secret \
  "Drive-Agent-Builder" \
  "Google Drive Agent Builder credentials/token (used by node_16)" \
  "Paste Google Drive credentials/token (JSON as one line or base64-encoded)"

## 8. Add LightSpeed-Agent-Builder (GSM)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8/8: LightSpeed-Agent-Builder"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_secret \
  "LightSpeed-Agent-Builder" \
  "LightSpeed POS API token for business tool integration (node_17)" \
  "Paste LightSpeed POS API token"

echo "========================================="
echo "Secret Addition Complete!"
echo "========================================="
echo
echo "Running smoke test to verify..."
bash "$(dirname "$0")/secrets_smoke_test.sh"
EXIT_CODE=$?

if [[ $EXIT_CODE -eq 0 ]]; then
  echo
  echo "✅ SUCCESS: All required secrets are now configured"
else
  echo
  echo "⚠️  Some secrets are still missing. Re-run this script to add them."
  exit 1
fi

