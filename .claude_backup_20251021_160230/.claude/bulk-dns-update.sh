#!/bin/bash
# BULK DNS UPDATE SCRIPT - GODADDY API
# Updates all Cloud Run domains to point to Cloud Run IPs

set -euo pipefail

# Get GoDaddy API credentials
GODADDY_API_KEY=$(op item get GODADDY_API_KEY --reveal --fields credential)
GODADDY_API_SECRET=$(op item get GODADDY_API_SECRET --reveal --fields credential)

# Cloud Run IPs for load balancing
CLOUD_RUN_IPS=("216.239.32.21" "216.239.34.21" "216.239.36.21" "216.239.38.21")

# 🚨 DO NOT TOUCH DOMAINS - NEVER UPDATE THESE
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

# Domains to update (VERIFIED - excludes DO NOT TOUCH domains)
DOMAINS=(
    "cannabiscookiestexas.com"
    "exoticcanopysolutions.com"
    "exoticcbdhempflower.com"
    "freeweedsanantonio.com"
    "freeweedtexas.com"
    "getlooseyoga.com"
    "herbitrage.com"
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

echo "🚀 BULK DNS UPDATE STARTING"
echo "=========================="
echo "Domains to update: ${#DOMAINS[@]}"
echo ""

success_count=0
error_count=0

for domain in "${DOMAINS[@]}"; do
    # 🚨 SAFETY CHECK: Verify domain is not in DO_NOT_TOUCH list
    if [[ " ${DO_NOT_TOUCH[@]} " =~ " ${domain} " ]]; then
        echo "⛔ SKIPPING $domain (DO NOT TOUCH - PROTECTED)"
        continue
    fi

    echo "🔧 Updating $domain..."

    # Get current DNS records
    current_records=$(curl -s -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" "https://api.godaddy.com/v1/domains/$domain/records")
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to get records for $domain"
        ((error_count++))
        continue
    fi
    
    # Extract NS records and other non-A records
    ns_records=$(echo "$current_records" | jq -r '.[] | select(.type == "NS") | @json')
    cname_records=$(echo "$current_records" | jq -r '.[] | select(.type == "CNAME") | @json')
    txt_records=$(echo "$current_records" | jq -r '.[] | select(.type == "TXT") | @json')
    
    # Create new records array
    new_records="["
    
    # Add Cloud Run A records
    for ip in "${CLOUD_RUN_IPS[@]}"; do
        new_records+='{"data":"'$ip'","name":"@","ttl":600,"type":"A"},'
    done
    
    # Add NS records
    echo "$ns_records" | while read -r record; do
        if [ -n "$record" ]; then
            new_records+="$record,"
        fi
    done
    
    # Add CNAME records
    echo "$cname_records" | while read -r record; do
        if [ -n "$record" ]; then
            new_records+="$record,"
        fi
    done
    
    # Add TXT records
    echo "$txt_records" | while read -r record; do
        if [ -n "$record" ]; then
            new_records+="$record,"
        fi
    done
    
    # Remove trailing comma and close array
    new_records="${new_records%,}]"
    
    # Update DNS records
    response=$(curl -s -X PUT -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" -H "Content-Type: application/json" -d "$new_records" "https://api.godaddy.com/v1/domains/$domain/records")
    
    if [ $? -eq 0 ]; then
        echo "✅ $domain updated successfully"
        ((success_count++))
    else
        echo "❌ Failed to update $domain"
        ((error_count++))
    fi
    
    # Rate limiting
    sleep 1
done

echo ""
echo "🎉 BULK DNS UPDATE COMPLETED"
echo "============================"
echo "✅ Success: $success_count domains"
echo "❌ Errors: $error_count domains"
echo "📊 Total: $((success_count + error_count)) domains"
