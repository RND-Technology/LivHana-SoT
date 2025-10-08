#!/bin/bash
# UPDATE DNS TO CLOUD RUN IPS - UNBLOCK SSL CERTIFICATE PROVISIONING
# This script updates GoDaddy DNS records to point to Cloud Run IP addresses
# Required: GODADDY_API_KEY and GODADDY_API_SECRET environment variables

set -euo pipefail

echo "🌐 DNS UPDATE TO CLOUD RUN IPS"
echo "=============================="
echo ""

# Check for required credentials
if [[ -z "${GODADDY_API_KEY:-}" ]] || [[ -z "${GODADDY_API_SECRET:-}" ]]; then
    echo "❌ ERROR: GoDaddy API credentials not found"
    echo ""
    echo "Required environment variables:"
    echo "  - GODADDY_API_KEY"
    echo "  - GODADDY_API_SECRET"
    echo ""
    echo "To set credentials:"
    echo "  export GODADDY_API_KEY='your-key-here'"
    echo "  export GODADDY_API_SECRET='your-secret-here'"
    echo ""
    echo "Or get from 1Password:"
    echo "  export GODADDY_API_KEY=\$(op item get GoDaddy --fields api_key)"
    echo "  export GODADDY_API_SECRET=\$(op item get GoDaddy --fields api_secret)"
    exit 1
fi

# Cloud Run IP addresses (for A records)
CLOUD_RUN_IPS=(
    "216.239.32.21"
    "216.239.34.21"
    "216.239.36.21"
    "216.239.38.21"
)

# Critical guardrails — NEVER touch these domains without Jesse's explicit authorization
DO_NOT_TOUCH=(
    "airbnbwaterfall.com"
    "reggieanddro.com"
    "reggieanddroalice.com"
    "reggieanddrodispensary.com"
    "hempress3.com"
    "tier1treecare.com"
)

# Domains to update (all domains currently pointing to 34.143.72.2) — filtered at runtime against DO_NOT_TOUCH
DOMAINS=(
    "aaacbdhempflower.com"
    "cannabiscookiestexas.com"
    "exoticcanopysolutions.com"
    "exoticcbdhempflower.com"
    "freeweedsanantonio.com"
    "freeweedtexas.com"
    "getlooseyoga.com"
    "highfromhemp.com"
    "jesseniesen.com"
    "loudcbdbuds.com"
    "loudcbdflower.com"
    "oneplantsolution.com"
    "smokingyoga.com"
    "terpwerk.com"
    "texascannabiscookies.com"
    "thcacannabisdispensary.com"
    "thcaflowerstx.com"
    "thcaflowertx.com"
    "thcasanantonio.com"
    "tokinyoga.com"
)

# Subdomains use CNAME instead of A records
SUBDOMAINS=(
    "brain.reggieanddro.com"
    "shop.reggieanddro.com"
)

# GoDaddy API endpoint
GODADDY_API="https://api.godaddy.com/v1"

is_do_not_touch() {
    local domain="$1"
    for blocked in "${DO_NOT_TOUCH[@]}"; do
        if [[ "$domain" == "$blocked" ]]; then
            return 0
        fi
    done
    return 1
}

# Function to update A records for a domain
update_domain_a_records() {
    local domain="$1"

    if is_do_not_touch "$domain"; then
        echo "⛔ SKIPPING $domain (DO NOT TOUCH LIST)"
        return
    fi

    echo "📝 Updating $domain..."

    # Build JSON payload with all 4 IP addresses
    local json_payload="["
    for i in "${!CLOUD_RUN_IPS[@]}"; do
        if [ $i -gt 0 ]; then
            json_payload+=","
        fi
        json_payload+="{\"data\":\"${CLOUD_RUN_IPS[$i]}\",\"ttl\":600}"
    done
    json_payload+="]"

    # Update @ record (root domain)
    response=$(curl -s -w "\n%{http_code}" -X PUT \
        "${GODADDY_API}/domains/${domain}/records/A/@" \
        -H "Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}" \
        -H "Content-Type: application/json" \
        -d "$json_payload")

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        echo "  ✅ ${domain} A records updated to Cloud Run IPs"
    else
        echo "  ❌ Failed to update ${domain} (HTTP $http_code)"
        echo "  Response: $(echo "$response" | head -n-1)"
    fi
}

# Function to verify CNAME records for subdomains
verify_subdomain_cname() {
    local full_domain="$1"
    local subdomain="${full_domain%%.*}"
    local domain="${full_domain#*.}"

    echo "🔍 Verifying CNAME for $full_domain..."

    # Get current CNAME record
    response=$(curl -s -w "\n%{http_code}" \
        "${GODADDY_API}/domains/${domain}/records/CNAME/${subdomain}" \
        -H "Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ]; then
        echo "  ✅ ${full_domain} CNAME exists: $body"
    else
        echo "  ⚠️  ${full_domain} CNAME may need update (HTTP $http_code)"
    fi
}

echo "🎯 Updating ${#DOMAINS[@]} domains to Cloud Run IPs..."
echo ""

# Update all root domains
for domain in "${DOMAINS[@]}"; do
    update_domain_a_records "$domain"
    sleep 1  # Rate limiting
done

echo ""
echo "🔍 Verifying ${#SUBDOMAINS[@]} subdomains..."
echo ""

# Verify subdomains (already use CNAME)
for subdomain in "${SUBDOMAINS[@]}"; do
    if is_do_not_touch "${subdomain#*.}"; then
        echo "⛔ SKIPPING $subdomain (root domain on DO NOT TOUCH LIST)"
        continue
    fi
    verify_subdomain_cname "$subdomain"
    sleep 1  # Rate limiting
done

echo ""
echo "✅ DNS UPDATE COMPLETE"
echo ""
echo "📊 Summary:"
echo "  - Updated: ${#DOMAINS[@]} domains → 4 Cloud Run IPs each"
echo "  - Verified: ${#SUBDOMAINS[@]} subdomains (CNAME)"
echo "  - DNS propagation: 5-15 minutes"
echo "  - SSL certificate provisioning: 5-10 minutes after propagation"
echo ""
echo "🔍 Monitor progress:"
echo "  gcloud beta run domain-mappings list --region us-central1 --project reggieanddrodispensary"
echo ""
echo "Expected result: 'CertificateProvisioned: True' for all domains"
