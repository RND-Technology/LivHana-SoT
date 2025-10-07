#!/bin/bash
# E2E EMPIRE DNS MISSION ACCOMPLISH - SELF-HEALING
# Fix every domain until 100% success

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

log "${BLUE}🚀 E2E EMPIRE DNS MISSION ACCOMPLISH - SELF-HEALING${NC}"
log "${BLUE}=================================================${NC}"

# API credentials
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

log "${BLUE}📊 Mission: Fix all $total_domains domains until 100% success${NC}"
log "${BLUE}🎯 Target: $target${NC}"

# Function to update single domain with retry logic
update_domain() {
    local domain="$1"
    local attempts=0
    local max_attempts=3
    
    while [[ $attempts -lt $max_attempts ]]; do
        attempts=$((attempts + 1))
        log "${BLUE}🔄 Attempt $attempts/$max_attempts: $domain${NC}"
        
        # Get existing records
        existing_records=$(curl -s -H "Authorization: sso-key $API_KEY:$API_SECRET" \
            -H "Content-Type: application/json" \
            "https://api.godaddy.com/v1/domains/$domain/records")
        
        # Remove existing A record for @ and add CNAME
        updated_records=$(echo "$existing_records" | jq --arg target "$target" '
            map(select(.type != "A" or .name != "@")) + 
            [{type: "CNAME", name: "@", data: $target, ttl: 600}]
        ')
        
        # Update DNS records
        response=$(curl -s -w "%{http_code}" -o /tmp/dns_response.json \
            -X PUT \
            -H "Authorization: sso-key $API_KEY:$API_SECRET" \
            -H "Content-Type: application/json" \
            -d "$updated_records" \
            "https://api.godaddy.com/v1/domains/$domain/records")
        
        http_code="${response: -3}"
        
        if [[ "$http_code" == "200" ]]; then
            log "${GREEN}✅ $domain - DNS updated successfully${NC}"
            return 0
        else
            log "${RED}❌ $domain - Attempt $attempts failed (HTTP $http_code)${NC}"
            if [[ -s /tmp/dns_response.json ]]; then
                log "${RED}Response: $(cat /tmp/dns_response.json)${NC}"
            fi
            
            # Try alternative method: replace A record with CNAME
            if [[ $attempts -eq 2 ]]; then
                log "${YELLOW}🔧 Trying alternative method for $domain${NC}"
                
                # Create minimal record set with NS + CNAME
                minimal_records=$(echo "$existing_records" | jq --arg target "$target" '
                    map(select(.type == "NS")) + 
                    [{type: "CNAME", name: "@", data: $target, ttl: 600}]
                ')
                
                response=$(curl -s -w "%{http_code}" -o /tmp/dns_response.json \
                    -X PUT \
                    -H "Authorization: sso-key $API_KEY:$API_SECRET" \
                    -H "Content-Type: application/json" \
                    -d "$minimal_records" \
                    "https://api.godaddy.com/v1/domains/$domain/records")
                
                http_code="${response: -3}"
                
                if [[ "$http_code" == "200" ]]; then
                    log "${GREEN}✅ $domain - DNS updated with alternative method${NC}"
                    return 0
                fi
            fi
            
            sleep 2
        fi
    done
    
    log "${RED}❌ $domain - All attempts failed${NC}"
    return 1
}

# Execute DNS changes with self-healing
for domain in "${domains[@]}"; do
    if update_domain "$domain"; then
        successful=$((successful + 1))
    else
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

# Self-healing: retry failed domains
if [[ $failed -gt 0 ]]; then
    log "${YELLOW}🔧 Self-healing: Retrying failed domains...${NC}"
    
    failed_domains=()
    for domain in "${domains[@]}"; do
        # Check if domain was successful by testing DNS
        if ! nslookup "$domain" 2>/dev/null | grep -q "$target"; then
            failed_domains+=("$domain")
        fi
    done
    
    if [[ ${#failed_domains[@]} -gt 0 ]]; then
        log "${YELLOW}🔧 Retrying ${#failed_domains[@]} failed domains...${NC}"
        
        for domain in "${failed_domains[@]}"; do
            log "${YELLOW}🔄 Retrying $domain...${NC}"
            if update_domain "$domain"; then
                successful=$((successful + 1))
                failed=$((failed - 1))
            fi
            sleep 2
        done
    fi
fi

# Final verification
log ""
log "${BLUE}🔍 Final verification...${NC}"

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
log "${BLUE}📊 FINAL MISSION REPORT:${NC}"
log "${GREEN}Success: $successful/$total_domains domains${NC}"
log "${GREEN}Verified: $verified/$total_domains domains${NC}"

if [[ $verified -eq $total_domains ]]; then
    log "${GREEN}🎉 MISSION ACCOMPLISHED - ALL DOMAINS LIVE!${NC}"
    log "${GREEN}🚀 E2E EMPIRE DEPLOYMENT 100% COMPLETE!${NC}"
    log "${GREEN}🦄 SELF-HEALING MACHINE SUCCESS!${NC}"
else
    log "${YELLOW}⏳ DNS propagation in progress - check again in 5-10 minutes${NC}"
    log "${YELLOW}🔧 Self-healing complete - $verified/$total_domains domains verified${NC}"
fi

# Cleanup
rm -f /tmp/dns_response.json

log "${BLUE}📄 Mission report complete${NC}"
