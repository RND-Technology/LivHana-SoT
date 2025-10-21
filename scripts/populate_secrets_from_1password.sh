#!/usr/bin/env bash
set -euo pipefail

# Populate GSM Secrets from 1Password
# Assumes secrets already exist (created by admin account)
# Date: 2025-10-21

GCP_PROJECT="${GCP_PROJECT_ID:-reggieanddrodispensary}"

echo "========================================="
echo "Populate GSM Secrets from 1Password"
echo "Project: $GCP_PROJECT"
echo "========================================="
echo

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

# Function to add secret value
add_secret_value() {
    local secret_name="$1"
    local secret_value="$2"
    
    echo "Adding value to secret: $secret_name"
    
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
    echo "Step 1: Extracting 1Password values..."
    
    # Define the mapping between GSM secret names and 1Password items
    local secret_names=("Calendar-Agent-Builder" "Gmail-Agent-Builder" "Drive-Agent-Builder" "LightSpeed-Agent-Builder")
    local item_names=("GOOGLE_APPLICATION_CREDENTIALS" "GOOGLE_APPLICATION_CREDENTIALS" "GOOGLE_APPLICATION_CREDENTIALS" "Lightspeed_Token")
    local field_labels=("credential" "credential" "credential" "credential")
    
    local success_count=0
    local total_count=${#secret_names[@]}
    
    for i in "${!secret_names[@]}"; do
        local secret_name="${secret_names[$i]}"
        local item_name="${item_names[$i]}"
        local field_label="${field_labels[$i]}"
        
        echo
        echo "Processing: $secret_name"
        echo "1Password item: $item_name"
        echo "Field: $field_label"
        
        if secret_value=$(extract_1password_value "$item_name" "$field_label"); then
            if add_secret_value "$secret_name" "$secret_value"; then
                success_count=$((success_count + 1))
            fi
        fi
    done
    
    echo
    echo "========================================="
    echo "Summary: $success_count/$total_count secrets populated"
    echo "========================================="
    
    if [[ $success_count -eq $total_count ]]; then
        echo "✅ All secrets populated successfully!"
        echo
        echo "Running smoke test..."
        bash "$(dirname "$0")/secrets_smoke_test.sh"
    else
        echo "⚠️  Some secrets failed to populate."
        exit 1
    fi
}

# Execute main function
main "$@"
