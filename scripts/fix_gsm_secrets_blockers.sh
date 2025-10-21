#!/usr/bin/env bash
set -euo pipefail

# Fix GSM Secrets Blockers Script
# Addresses: GCP permissions + 1Password item lookup issues
# Compliance: LifeWard standard, 21+ age-gate, NIST methods
# Date: 2025-10-21

GCP_PROJECT="${GCP_PROJECT_ID:-reggieanddrodispensary}"
REGION="us-central1"

echo "========================================="
echo "Fix GSM Secrets Blockers"
echo "Project: $GCP_PROJECT"
echo "========================================="
echo

# Function to check GCP permissions
check_gcp_permissions() {
    echo "Checking GCP Secret Manager permissions..."
    
    # Check if we can list secrets
    if gcloud secrets list --project="$GCP_PROJECT" &>/dev/null; then
        echo "✅ Can list secrets"
    else
        echo "❌ Cannot list secrets - permission issue"
        return 1
    fi
    
    # Check if we can create secrets (this will fail if no permission)
    if gcloud secrets create "test-permission-check" --project="$GCP_PROJECT" &>/dev/null; then
        echo "✅ Can create secrets"
        # Clean up test secret
        gcloud secrets delete "test-permission-check" --project="$GCP_PROJECT" --quiet &>/dev/null || true
        return 0
    else
        echo "❌ Cannot create secrets - need Secret Manager Admin role"
        return 1
    fi
}

# Function to extract 1Password values
extract_1password_value() {
    local item_name="$1"
    local field_label="$2"
    
    echo "Extracting $field_label from $item_name..."
    
    # Get the item and extract the specific field
    local value
    value=$(op item get "$item_name" --format json | jq -r ".fields[] | select(.label == \"$field_label\") | .value")
    
    if [[ "$value" == "null" || -z "$value" ]]; then
        echo "❌ No value found for $field_label in $item_name"
        return 1
    else
        echo "✅ Found $field_label: ${value:0:20}..."
        echo "$value"
        return 0
    fi
}

# Function to create secret if permissions allow
create_secret_if_permitted() {
    local secret_name="$1"
    local secret_value="$2"
    local secret_description="$3"
    
    echo "Creating secret: $secret_name"
    
    # Check if secret already exists
    if gcloud secrets describe "$secret_name" --project="$GCP_PROJECT" &>/dev/null; then
        echo "✅ Secret $secret_name already exists"
    else
        # Try to create secret
        if gcloud secrets create "$secret_name" \
            --project="$GCP_PROJECT" \
            --replication-policy="automatic" \
            --labels="env=production,managed_by=trinity"; then
            echo "✅ Created secret: $secret_name"
        else
            echo "❌ Failed to create secret: $secret_name"
            echo "   Need GCP project admin to create this secret or grant Secret Manager Admin role"
            return 1
        fi
    fi
    
    # Add secret value
    if echo "$secret_value" | gcloud secrets versions add "$secret_name" \
        --project="$GCP_PROJECT" \
        --data-file=-; then
        echo "✅ Added value to $secret_name"
        return 0
    else
        echo "❌ Failed to add value to $secret_name"
        return 1
    fi
}

# Main execution
main() {
    echo "Step 1: Checking GCP permissions..."
    if ! check_gcp_permissions; then
        echo
        echo "🚨 GCP PERMISSION BLOCKER DETECTED"
        echo "=================================="
        echo "Your account (jesseniesen@gmail.com) needs one of:"
        echo "1. Secret Manager Admin role, OR"
        echo "2. Project Owner/Admin to create the secrets"
        echo
        echo "Required secrets to create:"
        echo "- Calendar-Agent-Builder"
        echo "- Gmail-Agent-Builder" 
        echo "- Drive-Agent-Builder"
        echo "- LightSpeed-Agent-Builder"
        echo
        echo "Next steps:"
        echo "1. Contact GCP project admin"
        echo "2. Request Secret Manager Admin role OR ask them to run:"
        echo "   gcloud secrets create Calendar-Agent-Builder --project=$GCP_PROJECT"
        echo "   gcloud secrets create Gmail-Agent-Builder --project=$GCP_PROJECT"
        echo "   gcloud secrets create Drive-Agent-Builder --project=$GCP_PROJECT"
        echo "   gcloud secrets create LightSpeed-Agent-Builder --project=$GCP_PROJECT"
        echo
        exit 1
    fi
    
    echo
    echo "Step 2: Extracting 1Password values..."
    
    # Define the mapping between GSM secret names and 1Password items
    declare -A SECRET_MAPPINGS=(
        ["Calendar-Agent-Builder"]="GOOGLE_APPLICATION_CREDENTIALS|credential"
        ["Gmail-Agent-Builder"]="GOOGLE_APPLICATION_CREDENTIALS|credential"
        ["Drive-Agent-Builder"]="GOOGLE_APPLICATION_CREDENTIALS|credential"
        ["LightSpeed-Agent-Builder"]="Lightspeed_Token|credential"
    )
    
    local success_count=0
    local total_count=${#SECRET_MAPPINGS[@]}
    
    for secret_name in "${!SECRET_MAPPINGS[@]}"; do
        local mapping="${SECRET_MAPPINGS[$secret_name]}"
        local item_name="${mapping%|*}"
        local field_label="${mapping#*|}"
        
        echo
        echo "Processing: $secret_name"
        echo "1Password item: $item_name"
        echo "Field: $field_label"
        
        if secret_value=$(extract_1password_value "$item_name" "$field_label"); then
            if create_secret_if_permitted "$secret_name" "$secret_value" "Agent Builder secret for $secret_name"; then
                success_count=$((success_count + 1))
            fi
        fi
    done
    
    echo
    echo "========================================="
    echo "Summary: $success_count/$total_count secrets processed"
    echo "========================================="
    
    if [[ $success_count -eq $total_count ]]; then
        echo "✅ All secrets created successfully!"
        echo
        echo "Running smoke test..."
        bash "$(dirname "$0")/secrets_smoke_test.sh"
    else
        echo "⚠️  Some secrets failed. Check GCP permissions and 1Password access."
        exit 1
    fi
}

# Execute main function
main "$@"
