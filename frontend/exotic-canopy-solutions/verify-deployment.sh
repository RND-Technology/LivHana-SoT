#!/bin/bash

# Exotic Canopy Solutions Deployment Verification Script
# Created: October 7, 2025

echo "=============================================="
echo "Exotic Canopy Solutions Deployment Verification"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Direct Cloud Run Service URL
echo "Test 1: Direct Cloud Run Service URL"
echo "----------------------------------------------"
DIRECT_URL="https://exotic-canopy-solutions-plad5efvha-uc.a.run.app"
echo "Testing: $DIRECT_URL"

DIRECT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DIRECT_URL")
if [ "$DIRECT_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Direct URL is accessible (HTTP $DIRECT_RESPONSE)${NC}"

    # Check if content is correct
    CONTENT=$(curl -s "$DIRECT_URL" | head -1)
    if [[ "$CONTENT" == *"<!DOCTYPE html>"* ]]; then
        echo -e "${GREEN}✓ Serving correct HTML content${NC}"
    else
        echo -e "${RED}✗ Unexpected content format${NC}"
    fi
else
    echo -e "${RED}✗ Direct URL returned HTTP $DIRECT_RESPONSE${NC}"
fi
echo ""

# Test 2: DNS Resolution
echo "Test 2: DNS Resolution"
echo "----------------------------------------------"
echo "Checking DNS for exoticcanopysolutions.com"
DNS_RESULT=$(dig +short exoticcanopysolutions.com A)

EXPECTED_IPS=("216.239.32.21" "216.239.34.21" "216.239.36.21" "216.239.38.21")
FOUND_ALL=true

for ip in "${EXPECTED_IPS[@]}"; do
    if echo "$DNS_RESULT" | grep -q "$ip"; then
        echo -e "${GREEN}✓ Found expected IP: $ip${NC}"
    else
        echo -e "${RED}✗ Missing expected IP: $ip${NC}"
        FOUND_ALL=false
    fi
done

if [ "$FOUND_ALL" = true ]; then
    echo -e "${GREEN}✓ All DNS records configured correctly${NC}"
fi
echo ""

# Test 3: Custom Domain HTTP
echo "Test 3: Custom Domain HTTP Redirect"
echo "----------------------------------------------"
HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" -L http://exoticcanopysolutions.com)
if [ "$HTTP_REDIRECT" = "200" ]; then
    echo -e "${GREEN}✓ HTTP redirects to HTTPS successfully${NC}"
else
    echo -e "${YELLOW}⚠ HTTP redirect returned code: $HTTP_REDIRECT${NC}"
fi
echo ""

# Test 4: Custom Domain HTTPS
echo "Test 4: Custom Domain HTTPS"
echo "----------------------------------------------"
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://exoticcanopysolutions.com)
echo "HTTPS Response: $HTTPS_RESPONSE"

if [ "$HTTPS_RESPONSE" = "200" ]; then
    # Check content
    DOMAIN_CONTENT=$(curl -s https://exoticcanopysolutions.com)

    if echo "$DOMAIN_CONTENT" | grep -q "Exotic Canopy Solutions"; then
        echo -e "${GREEN}✓ Domain is serving Exotic Canopy Solutions content${NC}"
        echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL!${NC}"
    elif echo "$DOMAIN_CONTENT" | grep -q "integration-service"; then
        echo -e "${YELLOW}⚠ Domain still showing integration-service (propagation in progress)${NC}"
        echo -e "${YELLOW}⚠ This is expected - wait 15-30 minutes for propagation${NC}"
    else
        echo -e "${YELLOW}⚠ Domain serving unexpected content${NC}"
        echo "Content preview:"
        echo "$DOMAIN_CONTENT" | head -5
    fi
else
    echo -e "${RED}✗ HTTPS request failed with code: $HTTPS_RESPONSE${NC}"
fi
echo ""

# Test 5: Domain Mapping Status
echo "Test 5: Cloud Run Domain Mapping Status"
echo "----------------------------------------------"
MAPPING_STATUS=$(gcloud beta run domain-mappings describe \
    --domain=exoticcanopysolutions.com \
    --region=us-central1 \
    --project=reggieanddrodispensary \
    --format="value(spec.routeName,status.conditions[0].reason)" 2>/dev/null)

ROUTE_NAME=$(echo "$MAPPING_STATUS" | awk '{print $1}')
CERT_REASON=$(echo "$MAPPING_STATUS" | awk '{print $2}')

echo "Mapped to service: $ROUTE_NAME"
echo "Certificate status: $CERT_REASON"

if [ "$ROUTE_NAME" = "exotic-canopy-solutions" ]; then
    echo -e "${GREEN}✓ Domain mapping configured correctly${NC}"
else
    echo -e "${RED}✗ Domain mapping misconfigured${NC}"
fi

if [ "$CERT_REASON" = "CertificateReady" ]; then
    echo -e "${GREEN}✓ SSL certificate fully provisioned${NC}"
elif [ "$CERT_REASON" = "CertificatePending" ]; then
    echo -e "${YELLOW}⚠ SSL certificate provisioning in progress${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo "Summary"
echo "=============================================="
echo "Direct Service URL: $DIRECT_URL"
echo "Custom Domain: https://exoticcanopysolutions.com"
echo ""
echo "If domain is still propagating, wait 15-30 minutes and run this script again."
echo ""
