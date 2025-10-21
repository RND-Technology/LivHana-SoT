#!/usr/bin/env bash
set -euo pipefail

# Grant Secret Manager permissions to jesseniesen@gmail.com
# Run with admin account (high@reggieanddro.com)
# Date: 2025-10-21

GCP_PROJECT="${GCP_PROJECT_ID:-reggieanddrodispensary}"
USER_EMAIL="jesseniesen@gmail.com"

echo "========================================="
echo "Grant Secret Manager Permissions"
echo "Project: $GCP_PROJECT"
echo "User: $USER_EMAIL"
echo "========================================="
echo

echo "Current account: $(gcloud config get-value account)"
echo

# Grant Secret Manager Admin role
echo "Granting Secret Manager Admin role to $USER_EMAIL..."
if gcloud projects add-iam-policy-binding "$GCP_PROJECT" \
    --member="user:$USER_EMAIL" \
    --role="roles/secretmanager.admin"; then
    echo "✅ Granted Secret Manager Admin role to $USER_EMAIL"
else
    echo "❌ Failed to grant Secret Manager Admin role"
    exit 1
fi

echo
echo "Testing permissions..."
echo "Switching to $USER_EMAIL account..."

# Switch to user account and test
gcloud config set account "$USER_EMAIL"

echo "Testing secret access..."
if gcloud secrets list --project="$GCP_PROJECT" &>/dev/null; then
    echo "✅ Can list secrets"
else
    echo "❌ Cannot list secrets"
    exit 1
fi

if gcloud secrets describe "Calendar-Agent-Builder" --project="$GCP_PROJECT" &>/dev/null; then
    echo "✅ Can access Calendar-Agent-Builder"
else
    echo "❌ Cannot access Calendar-Agent-Builder"
    exit 1
fi

echo
echo "✅ SUCCESS: $USER_EMAIL now has Secret Manager Admin permissions"
echo "You can now run: bash scripts/secrets_smoke_test.sh"
