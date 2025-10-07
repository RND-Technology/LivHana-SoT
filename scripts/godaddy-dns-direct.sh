#!/bin/bash
# E2E EMPIRE DNS EXECUTION - DIRECT METHOD
# Execute all DNS changes using direct API calls

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${1}"
}

log "${BLUE}🚀 E2E EMPIRE DNS EXECUTION - DIRECT METHOD${NC}"
log "${BLUE}==========================================${NC}"

# API credentials (hardcoded for direct execution)
API_KEY="Uyxkk5nm_VtRR4u7QEPqZTKF19LnyXM"
API_SECRET="2poM2iXi7d3a6emX637VqP"

# E2E Empire domains to update
domains=(
    "aaacbdhempflower.com"
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
    "tier1treecare.com"
    "tokinyoga.com"
)

target="integration-service-plad5efvha-uc.a.run.app"
total_domains=${#domains[@]}
successful=0
failed=0

log "${BLUE}📊 Executing DNS changes for $total_domains domains...${NC}"
log "${BLUE}🎯 Target: $target${NC}"

# Execute DNS changes
for domain in "${domains[@]}"; do
    log "${BLUE}🔄 Updating $domain...${NC}"
    
    # Create DNS record JSON
    dns_record=$(jq -n --arg target "$target" '[{
        "type": "CNAME",
        "name": "@",
        "data": $target,
        "ttl": 600
    }]')
    
    # Execute DNS update
    response=$(curl -s -w "%{http_code}" -o /tmp/dns_response.json \
        -X PUT \
        -H "Authorization: sso-key $API_KEY:$API_SECRET" \
        -H "Content-Type: application/json" \
        -d "$dns_record" \
        "https://api.godaddy.com/v1/domains/$domain/records")
    
    http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        log "${GREEN}✅ $domain - DNS updated successfully${NC}"
        successful=$((successful + 1))
    else
        log "${RED}❌ $domain - DNS update failed (HTTP $http_code)${NC}"
        if [[ -s /tmp/dns_response.json ]]; then
            log "${RED}Response: $(cat /tmp/dns_response.json)${NC}"
        fi
        failed=$((failed + 1))
    fi
    
    # Rate limiting
    sleep 1
done

# Print execution summary
log ""
log "${BLUE}📊 DNS EXECUTION SUMMARY:${NC}"
log "${GREEN}Success: $successful/$total_domains domains${NC}"
log "${RED}Failed: $failed/$total_domains domains${NC}"

if [[ $successful -eq $total_domains ]]; then
    log "${GREEN}🎉 ALL DNS CHANGES EXECUTED SUCCESSFULLY!${NC}"
else
    log "${RED}⚠️ Some DNS changes failed${NC}"
fi

# Verify DNS propagation
log ""
log "${BLUE}🔍 Verifying DNS propagation...${NC}"

verified=0
for domain in "${domains[@]}"; do
    log "${BLUE}🔍 Checking $domain...${NC}"
    
    # Check DNS resolution
    if nslookup "$domain" 2>/dev/null | grep -q "$target"; then
        log "${GREEN}✅ $domain - DNS verified${NC}"
        verified=$((verified + 1))
    else
        log "${YELLOW}⏳ $domain - DNS propagation pending${NC}"
    fi
done

log ""
log "${BLUE}📊 DNS VERIFICATION SUMMARY:${NC}"
log "${GREEN}Verified: $verified/$total_domains domains${NC}"

if [[ $verified -eq $total_domains ]]; then
    log "${GREEN}🎉 MISSION ACCOMPLISHED - ALL DOMAINS LIVE!${NC}"
    log "${GREEN}🚀 E2E EMPIRE DEPLOYMENT 100% COMPLETE!${NC}"
else
    log "${YELLOW}⏳ DNS propagation in progress - check again in 5-10 minutes${NC}"
fi

# Cleanup
rm -f /tmp/dns_response.json

log "${BLUE}📄 Mission report complete${NC}"
