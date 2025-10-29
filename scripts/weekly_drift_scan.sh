#!/bin/bash

# Weekly Architectural Drift Scanner
# Checks for compliance with architectural standards and reports any drift

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting weekly architectural drift scan...${NC}"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "----------------------------------------"

ISSUES=0
WARNINGS=0

# Check for direct Redis client creation (should use secureClient)
echo -e "\n${BLUE}Checking for unauthorized Redis client creation...${NC}"
REDIS_VIOLATIONS=$(find backend -type f -name "*.js" -o -name "*.ts" | xargs grep -l "createClient.*redis" 2>/dev/null | grep -v "hardenedQueue.js")
if [ -n "$REDIS_VIOLATIONS" ]; then
    echo -e "${RED}❌ Found direct Redis client creation in:${NC}"
    echo "$REDIS_VIOLATIONS"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ No unauthorized Redis client creation found${NC}"
fi

# Check for ad-hoc BullMQ queue creation
echo -e "\n${BLUE}Checking for ad-hoc queue creation...${NC}"
QUEUE_VIOLATIONS=$(find backend -type f -name "*.js" -o -name "*.ts" | xargs grep -l "new Queue" 2>/dev/null | grep -v "hardenedQueue.js")
if [ -n "$QUEUE_VIOLATIONS" ]; then
    echo -e "${RED}❌ Found ad-hoc queue creation in:${NC}"
    echo "$QUEUE_VIOLATIONS"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ No ad-hoc queue creation found${NC}"
fi

# Verify queue naming conventions
echo -e "\n${BLUE}Checking queue naming conventions...${NC}"
NAMING_VIOLATIONS=$(find backend -type f -name "*.js" -o -name "*.ts" | xargs grep -l "createQueue.*[^a-z0-9-]" 2>/dev/null)
if [ -n "$NAMING_VIOLATIONS" ]; then
    echo -e "${YELLOW}⚠️ Queue names may violate naming convention in:${NC}"
    echo "$NAMING_VIOLATIONS"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ Queue naming conventions verified${NC}"
fi

# Check for rate limit configuration
echo -e "\n${BLUE}Checking rate limit configuration...${NC}"
RATE_LIMIT_MISSING=$(find backend -type f -name "*.js" -o -name "*.ts" | xargs grep -l "createHardenedQueue" 2>/dev/null | xargs grep -L "rateLimitOpts" 2>/dev/null)
if [ -n "$RATE_LIMIT_MISSING" ]; then
    echo -e "${YELLOW}⚠️ Missing rate limit configuration in:${NC}"
    echo "$RATE_LIMIT_MISSING"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ Rate limits properly configured${NC}"
fi

# Check documentation freshness
echo -e "\n${BLUE}Checking documentation freshness...${NC}"
STALE_DOCS=$(find backend -name "README.md" -mtime +7 2>/dev/null)
if [ -n "$STALE_DOCS" ]; then
    echo -e "${YELLOW}⚠️ Documentation not updated in last 7 days:${NC}"
    echo "$STALE_DOCS"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ Documentation is up to date${NC}"
fi

# Check test coverage for queue-related code
echo -e "\n${BLUE}Checking test coverage...${NC}"
if [ -f "backend/common/tests/queue.test.js" ]; then
    TEST_COUNT=$(grep -c "test(" backend/common/tests/queue.test.js)
    if [ "$TEST_COUNT" -lt 5 ]; then
        echo -e "${YELLOW}⚠️ Low test coverage (${TEST_COUNT} tests)${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✓ Test coverage acceptable (${TEST_COUNT} tests)${NC}"
    fi
else
    echo -e "${RED}❌ Queue tests missing${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check for compliance service integration
echo -e "\n${BLUE}Checking compliance service integration...${NC}"
if [ ! -f "backend/compliance-service/src/index.js" ]; then
    echo -e "${RED}❌ Compliance service not implemented${NC}"
    ISSUES=$((ISSUES + 1))
else
    VERIFIER_COUNT=$(grep -c "Adapter" backend/compliance-service/src/index.js 2>/dev/null)
    if [ "$VERIFIER_COUNT" -lt 2 ]; then
        echo -e "${YELLOW}⚠️ Missing compliance adapters${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✓ Compliance service properly integrated${NC}"
    fi
fi

# Summary
echo -e "\n${BLUE}Drift Scan Summary${NC}"
echo "----------------------------------------"
echo -e "Critical Issues: ${RED}${ISSUES}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"

# Generate report
REPORT="drift_scan_$(date +%Y%m%d).md"
{
    echo "# Architectural Drift Scan Report"
    echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo
    echo "## Summary"
    echo "- Critical Issues: ${ISSUES}"
    echo "- Warnings: ${WARNINGS}"
    echo
    echo "## Action Items"
    if [ "$ISSUES" -gt 0 ]; then
        echo "### Critical (Must Fix)"
        [ -n "$REDIS_VIOLATIONS" ] && echo "- Replace direct Redis client creation with secureClient"
        [ -n "$QUEUE_VIOLATIONS" ] && echo "- Replace ad-hoc queue creation with hardenedQueue factory"
        [ ! -f "backend/common/tests/queue.test.js" ] && echo "- Implement missing queue tests"
        [ ! -f "backend/compliance-service/src/index.js" ] && echo "- Implement compliance service"
    fi
    if [ "$WARNINGS" -gt 0 ]; then
        echo "### Warnings (Should Fix)"
        [ -n "$NAMING_VIOLATIONS" ] && echo "- Review queue naming conventions"
        [ -n "$RATE_LIMIT_MISSING" ] && echo "- Add missing rate limit configurations"
        [ -n "$STALE_DOCS" ] && echo "- Update stale documentation"
        [ "$VERIFIER_COUNT" -lt 2 ] && echo "- Add missing compliance adapters"
    fi
} > "reports/${REPORT}"

echo -e "\n${BLUE}Report generated:${NC} reports/${REPORT}"

# Exit with error if critical issues found
[ "$ISSUES" -gt 0 ] && exit 1
exit 0
