#!/usr/bin/env bash
set -euo pipefail

# GCP Admin Script: Create Required Secrets
# For GCP project administrators to create the required secrets
# Compliance: LifeWard standard, 21+ age-gate, NIST methods
# Date: 2025-10-21

GCP_PROJECT="${GCP_PROJECT_ID:-reggieanddrodispensary}"
REGION="us-central1"

echo "========================================="
echo "GCP Admin: Create Required Secrets"
echo "Project: $GCP_PROJECT"
echo "========================================="
echo

# Function to create secret
create_secret() {
    local secret_name="$1"
    local secret_description="$2"
    
    echo "Creating secret: $secret_name"
    
    # Check if secret already exists
    if gcloud secrets describe "$secret_name" --project="$GCP_PROJECT" &>/dev/null; then
        echo "✅ Secret $secret_name already exists"
        return 0
    fi
    
    # Create secret
    if gcloud secrets create "$secret_name" \
        --project="$GCP_PROJECT" \
        --replication-policy="automatic" \
        --labels="env=production,managed_by=trinity" \
        --data-file=/dev/null; then
        echo "✅ Created secret: $secret_name"
        return 0
    else
        echo "❌ Failed to create secret: $secret_name"
        return 1
    fi
}

# Function to grant permissions
grant_permissions() {
    local user_email="$1"
    
    echo "Granting Secret Manager Admin role to: $user_email"
    
    if gcloud projects add-iam-policy-binding "$GCP_PROJECT" \
        --member="user:$user_email" \
        --role="roles/secretmanager.admin"; then
        echo "✅ Granted Secret Manager Admin role to $user_email"
        return 0
    else
        echo "❌ Failed to grant permissions to $user_email"
        return 1
    fi
}

# Main execution
main() {
    echo "This script will create the required secrets for the Liv Hana Agent Builder."
    echo
    echo "Required secrets:"
    echo "- Calendar-Agent-Builder"
    echo "- Gmail-Agent-Builder"
    echo "- Drive-Agent-Builder"
    echo "- LightSpeed-Agent-Builder"
    echo
    
    read -p "Do you want to create these secrets? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
    
    local success_count=0
    local total_count=4
    
    # Create each secret
    if create_secret "Calendar-Agent-Builder" "Google Calendar API key for Agent Builder"; then
        success_count=$((success_count + 1))
    fi
    
    if create_secret "Gmail-Agent-Builder" "Gmail API key for Agent Builder"; then
        success_count=$((success_count + 1))
    fi
    
    if create_secret "Drive-Agent-Builder" "Google Drive API key for Agent Builder"; then
        success_count=$((success_count + 1))
    fi
    
    if create_secret "LightSpeed-Agent-Builder" "LightSpeed POS API token for Agent Builder"; then
        success_count=$((success_count + 1))
    fi
    
    echo
    echo "========================================="
    echo "Summary: $success_count/$total_count secrets created"
    echo "========================================="
    
    if [[ $success_count -eq $total_count ]]; then
        echo "✅ All secrets created successfully!"
        echo
        echo "Next steps:"
        echo "1. Grant Secret Manager Admin role to jesseniesen@gmail.com:"
        echo "   gcloud projects add-iam-policy-binding $GCP_PROJECT \\"
        echo "     --member=user:jesseniesen@gmail.com \\"
        echo "     --role=roles/secretmanager.admin"
        echo
        echo "2. Or run this script with --grant-permissions flag"
        echo
        echo "3. Then jesseniesen@gmail.com can run:"
        echo "   bash scripts/fix_gsm_secrets_blockers.sh"
    else
        echo "⚠️  Some secrets failed to create."
        exit 1
    fi
}

# Check for grant permissions flag
if [[ "${1:-}" == "--grant-permissions" ]]; then
    echo "Granting permissions to jesseniesen@gmail.com..."
    if grant_permissions "jesseniesen@gmail.com"; then
        echo "✅ Permissions granted successfully!"
        echo "jesseniesen@gmail.com can now run: bash scripts/fix_gsm_secrets_blockers.sh"
    else
        echo "❌ Failed to grant permissions"
        exit 1
    fi
else
    main "$@"
fi
