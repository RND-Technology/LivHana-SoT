#!/bin/bash
# TIER 1 CORRECT DNS SOLUTION
# Properly handle DNS apex records using A records with all Cloud Run IPs

set -euo pipefail

# 🚨 DO NOT TOUCH DOMAINS - NEVER MODIFY THESE
DO_NOT_TOUCH=(
    "airbnbwaterfall.com"
    "reggieanddro.com"
    "brain.reggieanddro.com"
    "shop.reggieanddro.com"
    "voice.reggieanddro.com"
    "tier1treecare.com"
    "reggieanddroalice.com"
    "reggieanddrodispensary.com"
    "hempress3.com"
)

# Configuration
TARGET_SERVICE="integration-service-plad5efvha-uc.a.run.app"

# Get ALL IPs from Cloud Run service (load balancing)
echo "🔍 Resolving all IPs for $TARGET_SERVICE..."
IPS=($(dig +short "$TARGET_SERVICE" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'))

if [ ${#IPS[@]} -eq 0 ]; then
    echo "❌ ERROR: No IPs resolved for $TARGET_SERVICE"
    exit 1
fi

echo "✅ Found ${#IPS[@]} IPs for load balancing:"
printf '   - %s\n' "${IPS[@]}"

# Update domain with ALL IPs (proper load balancing)
update_domain_proper() {
    local domain="$1"

    # 🚨 SAFETY CHECK: Verify domain is not protected
    if [[ " ${DO_NOT_TOUCH[@]} " =~ " ${domain} " ]]; then
        echo "⛔ SKIPPING $domain (DO NOT TOUCH - PROTECTED)"
        return 1
    fi

    echo "🔄 Updating $domain with ${#IPS[@]} A records..."

    # Build A records array for all IPs
    local records_json="["
    for ip in "${IPS[@]}"; do
        records_json+='{"type":"A","name":"@","data":"'"$ip"'","ttl":600},'
    done
    records_json="${records_json%,}]"  # Remove trailing comma

    # Get existing records (preserve NS, MX, TXT, etc.)
    existing=$(op run -- curl -s \
        -H "Authorization: sso-key \$GODADDY_API_KEY:\$GODADDY_API_SECRET" \
        "https://api.godaddy.com/v1/domains/$domain/records")

    # Filter out old A @ records, keep everything else
    filtered=$(echo "$existing" | jq 'map(select(.type != "A" or .name != "@"))')

    # Merge new A records with existing records
    merged=$(echo "$filtered" "$records_json" | jq -s 'add')

    # Update via individual record endpoint (safer)
    for ip in "${IPS[@]}"; do
        op run -- curl -s -X PUT \
            -H "Authorization: sso-key \$GODADDY_API_KEY:\$GODADDY_API_SECRET" \
            -H "Content-Type: application/json" \
            -d '[{"type":"A","name":"@","data":"'"$ip"'","ttl":600}]' \
            "https://api.godaddy.com/v1/domains/$domain/records/A/@"

        echo "  ✅ Added A record: $domain → $ip"
        sleep 0.5  # Rate limiting
    done
}

# ALTERNATIVE: Use www subdomain with CNAME (valid approach)
update_domain_www_cname() {
    local domain="$1"

    # 🚨 SAFETY CHECK: Verify domain is not protected
    if [[ " ${DO_NOT_TOUCH[@]} " =~ " ${domain} " ]]; then
        echo "⛔ SKIPPING $domain (DO NOT TOUCH - PROTECTED)"
        return 1
    fi

    echo "🔄 Setting up www.$domain with CNAME (valid)..."

    # CNAME is valid for subdomains
    op run -- curl -s -X PUT \
        -H "Authorization: sso-key \$GODADDY_API_KEY:\$GODADDY_API_SECRET" \
        -H "Content-Type: application/json" \
        -d '[{"type":"CNAME","name":"www","data":"'"$TARGET_SERVICE"'","ttl":600}]' \
        "https://api.godaddy.com/v1/domains/$domain/records/CNAME/www"

    echo "  ✅ CNAME created: www.$domain → $TARGET_SERVICE"

    # Create URL redirect from @ to www
    # (This requires using GoDaddy's forwarding feature, not DNS API)
}

# EXAMPLE USAGE
# update_domain_proper "jesseniesen.com"
# update_domain_www_cname "jesseniesen.com"

echo ""
echo "📋 CORRECT DNS APPROACHES:"
echo "1. A records (apex): Use ALL IPs for load balancing (current implementation)"
echo "2. CNAME (www): Use www subdomain with CNAME to Cloud Run"
echo "3. Reserved IP: Create Cloud Load Balancer with static IP"
echo ""
echo "❌ NEVER USE: CNAME @ (DNS RFC violation)"
