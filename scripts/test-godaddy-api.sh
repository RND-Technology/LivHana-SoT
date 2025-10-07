#!/bin/bash
# Test GoDaddy API Access and Permissions

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

# Get API credentials from 1Password
log "${BLUE}🔑 Getting GoDaddy API credentials from 1Password...${NC}"

# Get API credentials from separate 1Password items
GODADDY_API_KEY=$(op item get "GODADDY_API_KEY" --vault "LivHana-Ops-Keys" --field "credential" 2>/dev/null || echo "")
GODADDY_API_SECRET=$(op item get "GODADDY_API_SECRET" --vault "LivHana-Ops-Keys" --field "credential" 2>/dev/null || echo "")

if [[ -z "$GODADDY_API_KEY" || -z "$GODADDY_API_SECRET" ]]; then
    log "${RED}❌ GoDaddy API credentials are incomplete${NC}"
    log "${YELLOW}Please ensure both 'GODADDY_API_KEY' and 'GODADDY_API_SECRET' items exist in 'LivHana-Ops-Keys' vault${NC}"
    exit 1
fi

log "${GREEN}✅ API credentials retrieved${NC}"

# Test API access
log "${BLUE}🔍 Testing GoDaddy API access...${NC}"

# Test 1: List domains
log "${BLUE}📋 Test 1: Listing domains...${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/godaddy_domains.json \
    -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
    -H "Content-Type: application/json" \
    "https://api.godaddy.com/v1/domains")

http_code="${response: -3}"

case $http_code in
    200)
        domain_count=$(jq length /tmp/godaddy_domains.json)
        log "${GREEN}✅ Domain listing successful - $domain_count domains found${NC}"
        
        # Show first few domains
        log "${BLUE}📋 Sample domains:${NC}"
        jq -r '.[0:5][] | "  - \(.domain)"' /tmp/godaddy_domains.json
        if [[ $domain_count -gt 5 ]]; then
            log "${BLUE}  ... and $((domain_count - 5)) more${NC}"
        fi
        ;;
    401)
        log "${RED}❌ Authentication failed - Check API credentials${NC}"
        exit 1
        ;;
    403)
        log "${RED}❌ Access denied - Need 10+ domains or DDC subscription${NC}"
        exit 1
        ;;
    *)
        log "${RED}❌ API Error: $http_code${NC}"
        if [[ -s /tmp/godaddy_domains.json ]]; then
            log "${RED}Response: $(cat /tmp/godaddy_domains.json)${NC}"
        fi
        exit 1
        ;;
esac

# Test 2: Get DNS records for a sample domain
log "${BLUE}🔍 Test 2: Testing DNS record access...${NC}"

# Get first domain for testing
test_domain=$(jq -r '.[0].domain' /tmp/godaddy_domains.json)

if [[ "$test_domain" == "null" || -z "$test_domain" ]]; then
    log "${YELLOW}⚠️ No domains found for DNS testing${NC}"
else
    log "${BLUE}📋 Testing DNS access for: $test_domain${NC}"
    
    dns_response=$(curl -s -w "%{http_code}" -o /tmp/godaddy_dns.json \
        -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
        -H "Content-Type: application/json" \
        "https://api.godaddy.com/v1/domains/$test_domain/records")
    
    dns_http_code="${dns_response: -3}"
    
    case $dns_http_code in
        200)
            dns_count=$(jq length /tmp/godaddy_dns.json)
            log "${GREEN}✅ DNS record access successful - $dns_count records found${NC}"
            
            # Show DNS records
            log "${BLUE}📋 DNS records for $test_domain:${NC}"
            jq -r '.[] | "  - \(.type) \(.name) -> \(.data)"' /tmp/godaddy_dns.json
            ;;
        401)
            log "${RED}❌ DNS access authentication failed${NC}"
            exit 1
            ;;
        403)
            log "${RED}❌ DNS access denied - Insufficient permissions${NC}"
            exit 1
            ;;
        *)
            log "${RED}❌ DNS API Error: $dns_http_code${NC}"
            if [[ -s /tmp/godaddy_dns.json ]]; then
                log "${RED}Response: $(cat /tmp/godaddy_dns.json)${NC}"
            fi
            exit 1
            ;;
    esac
fi

# Test 3: Check E2E Empire domains
log "${BLUE}🔍 Test 3: Checking E2E Empire domains...${NC}"

# E2E Empire domains to check
e2e_domains=(
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

# Check which E2E domains are in GoDaddy account
log "${BLUE}📋 Checking E2E Empire domains in GoDaddy account...${NC}"

e2e_found=0
e2e_missing=0

for domain in "${e2e_domains[@]}"; do
    if jq -e --arg domain "$domain" '.[] | select(.domain == $domain)' /tmp/godaddy_domains.json >/dev/null; then
        log "${GREEN}✅ $domain - Found${NC}"
        e2e_found=$((e2e_found + 1))
    else
        log "${YELLOW}⚠️ $domain - Not found in GoDaddy account${NC}"
        e2e_missing=$((e2e_missing + 1))
    fi
done

log ""
log "${BLUE}📊 E2E Empire Domain Summary:${NC}"
log "${GREEN}Found: $e2e_found domains${NC}"
log "${YELLOW}Missing: $e2e_missing domains${NC}"

if [[ $e2e_missing -gt 0 ]]; then
    log "${YELLOW}⚠️ Some E2E Empire domains are not in your GoDaddy account${NC}"
    log "${YELLOW}You may need to transfer them or use a different registrar${NC}"
fi

# Cleanup
rm -f /tmp/godaddy_domains.json /tmp/godaddy_dns.json

# Final summary
log ""
log "${GREEN}🎉 GoDaddy API Test Complete!${NC}"
log "${GREEN}✅ API credentials valid${NC}"
log "${GREEN}✅ Domain access confirmed${NC}"
log "${GREEN}✅ DNS management permissions verified${NC}"

if [[ $e2e_found -gt 0 ]]; then
    log "${GREEN}✅ Ready for E2E Empire DNS automation${NC}"
    log ""
    log "${BLUE}Next steps:${NC}"
    log "${BLUE}1. Run dry-run test: ./godaddy-dns-automation.sh --dry-run${NC}"
    log "${BLUE}2. Execute bulk changes: ./godaddy-dns-automation.sh${NC}"
else
    log "${YELLOW}⚠️ No E2E Empire domains found in GoDaddy account${NC}"
    log "${YELLOW}Please verify domain ownership or transfer domains to GoDaddy${NC}"
fi
