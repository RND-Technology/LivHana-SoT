#!/bin/bash
# Simple GoDaddy API Test

set -euo pipefail

echo "🚀 Simple GoDaddy API Test"
echo "========================="

# Export environment variables for op run
export GODADDY_API_KEY="op://LivHana-Ops-Keys/GODADDY_API_KEY/credential"
export GODADDY_API_SECRET="op://LivHana-Ops-Keys/GODADDY_API_SECRET/credential"

echo "🔍 Testing API access..."

# Test API call
op run -- curl -s -w "\nHTTP_CODE:%{http_code}\n" \
    -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
    -H "Content-Type: application/json" \
    "https://api.godaddy.com/v1/domains"

echo "✅ Test complete"
