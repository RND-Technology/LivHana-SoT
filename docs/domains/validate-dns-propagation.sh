#!/bin/bash
# E2E EMPIRE DNS VALIDATION SCRIPT
# Validates DNS propagation for all domains

echo "🚀 E2E EMPIRE DNS VALIDATION - 100% DEPLOYMENT"
echo "=============================================="
echo ""

INTEGRATION_URL="integration-service-plad5efvha-uc.a.run.app"
DOMAINS_FILE="domains-requiring-dns.txt"

if [ ! -f "$DOMAINS_FILE" ]; then
    echo "❌ Error: $DOMAINS_FILE not found"
    exit 1
fi

echo "📊 Validating $(wc -l < $DOMAINS_FILE) domains..."
echo ""

SUCCESS_COUNT=0
TOTAL_COUNT=0

while IFS= read -r domain; do
    if [ -n "$domain" ]; then
        TOTAL_COUNT=$((TOTAL_COUNT + 1))
        echo -n "🔍 Testing $domain... "
        
        # Test DNS resolution
        if nslookup "$domain" 2>/dev/null | grep -q "$INTEGRATION_URL"; then
            echo "✅ DNS OK"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo "⏳ DNS Pending"
        fi
    fi
done < "$DOMAINS_FILE"

echo ""
echo "📊 VALIDATION RESULTS:"
echo "Success: $SUCCESS_COUNT/$TOTAL_COUNT domains"
echo "Progress: $((SUCCESS_COUNT * 100 / TOTAL_COUNT))%"

if [ $SUCCESS_COUNT -eq $TOTAL_COUNT ]; then
    echo "🎉 E2E EMPIRE DEPLOYMENT 100% COMPLETE!"
else
    echo "⏳ DNS propagation in progress..."
fi

echo ""
echo "🔄 Run again in 5-10 minutes for updated results"
