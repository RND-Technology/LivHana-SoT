#!/bin/bash
# Test GoDaddy API Access using op run

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

log "${BLUE}🚀 Testing GoDaddy API with op run...${NC}"

# Export environment variables for op run
export GODADDY_API_KEY="op://LivHana-Ops-Keys/GODADDY_API_KEY/credential"
export GODADDY_API_SECRET="op://LivHana-Ops-Keys/GODADDY_API_SECRET/credential"

# Test API access using op run
log "${BLUE}🔍 Testing GoDaddy API access...${NC}"

# Test 1: List domains
log "${BLUE}📋 Test 1: Listing domains...${NC}"

# Use op run to execute curl with environment variables
op run -- curl -s -w "%{http_code}" -o /tmp/godaddy_domains.json \
    -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
    -H "Content-Type: application/json" \
    "https://api.godaddy.com/v1/domains"

http_code=$(tail -c 3 /tmp/godaddy_domains.json)
response_body=$(head -c -3 /tmp/godaddy_domains.json)

log "${BLUE}HTTP Code: $http_code${NC}"
log "${BLUE}Response: $response_body${NC}"

case $http_code in
    200)
        domain_count=$(echo "$response_body" | jq length)
        log "${GREEN}✅ Domain listing successful - $domain_count domains found${NC}"
        
        # Show first few domains
        log "${BLUE}📋 Sample domains:${NC}"
        echo "$response_body" | jq -r '.[0:5][] | "  - \(.domain)"'
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
        log "${RED}Response: $response_body${NC}"
        exit 1
        ;;
esac

# Cleanup
rm -f /tmp/godaddy_domains.json

log "${GREEN}🎉 GoDaddy API Test Complete!${NC}"
log "${GREEN}✅ API credentials valid${NC}"
log "${GREEN}✅ Domain access confirmed${NC}"
log "${GREEN}✅ Ready for E2E Empire DNS automation${NC}"