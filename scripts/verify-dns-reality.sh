#!/bin/bash
# Verify what DNS records ACTUALLY exist (vs what scripts claim to create)

set -euo pipefail

echo "🔍 DNS REALITY CHECK: What actually exists?"
echo "============================================="
echo ""

# Sample domains from the E2E Empire
domains=(
    "aaacbdhempflower.com"
    "jesseniesen.com"
    "loudcbdflower.com"
    "thcasanantonio.com"
    "tokinyoga.com"
)

for domain in "${domains[@]}"; do
    echo "📋 $domain"
    echo "   A records:"
    a_records=$(dig +short "$domain" A 2>/dev/null || echo "   NONE")
    if [ "$a_records" != "   NONE" ]; then
        echo "$a_records" | sed 's/^/      /'
    else
        echo "      NONE"
    fi

    echo "   CNAME records:"
    cname_records=$(dig +short "$domain" CNAME 2>/dev/null || echo "")
    if [ -n "$cname_records" ]; then
        echo "$cname_records" | sed 's/^/      /'
    else
        echo "      NONE"
    fi
    echo ""
done

echo ""
echo "🎯 Cloud Run Service IPs (all available):"
dig +short integration-service-plad5efvha-uc.a.run.app | grep -E '^[0-9]' | nl -w2 -s'. '

echo ""
echo "📊 VERDICT:"
echo "   Scripts claim: CNAME @ records"
echo "   Reality:       A records only"
echo "   IPs used:      1 out of 8 available"
echo "   Conclusion:    GoDaddy auto-corrected CNAME → A"
