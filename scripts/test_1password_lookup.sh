#!/usr/bin/env bash
set -euo pipefail

# Test 1Password Lookup Script
# Verifies the 1Password item lookup works correctly
# Date: 2025-10-21

echo "========================================="
echo "Test 1Password Lookup"
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
        return 0
    fi
}

# Test the mappings
echo "Testing 1Password item lookups..."
echo

# Test GOOGLE_APPLICATION_CREDENTIALS
if extract_1password_value "GOOGLE_APPLICATION_CREDENTIALS" "credential"; then
    echo "✅ Google credentials lookup works"
else
    echo "❌ Google credentials lookup failed"
fi

echo

# Test Lightspeed_Token
if extract_1password_value "Lightspeed_Token" "credential"; then
    echo "✅ LightSpeed token lookup works"
else
    echo "❌ LightSpeed token lookup failed"
fi

echo
echo "========================================="
echo "1Password Lookup Test Complete"
echo "========================================="
