#!/bin/bash
# TIER-1 COMPREHENSIVE AUDIT - 100% TRUTH VERIFICATION

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WORKSPACE_ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$WORKSPACE_ROOT"

ISSUES_FOUND=0
CHECKS_PASSED=0

echo "═══════════════════════════════════════════════════════════════"
echo "     🔍 TIER-1 COMPREHENSIVE TRUTH AUDIT"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Check for TODOs
echo -e "${YELLOW}📋 Checking for TODOs...${NC}"
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX\|HACK" --include="*.js" --include="*.py" --include="*.jsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=legacy 2>/dev/null | wc -l || echo "0")
if [[ "$TODO_COUNT" -gt 0 ]]; then
    echo -e "  ${RED}✗${NC} Found $TODO_COUNT TODOs/FIXMEs"
    ((ISSUES_FOUND++))
else
    echo -e "  ${GREEN}✓${NC} No TODOs found"
    ((CHECKS_PASSED++))
fi

# 2. Check all services have Dockerfiles
echo -e "${YELLOW}🐳 Checking Dockerfiles...${NC}"
for service in backend/*/; do
    if [[ -d "$service" ]] && [[ ! "$service" =~ "common" ]] && [[ ! "$service" =~ "shared" ]]; then
        if [[ -f "$service/Dockerfile" ]]; then
            echo -e "  ${GREEN}✓${NC} $(basename $service) has Dockerfile"
            ((CHECKS_PASSED++))
        else
            echo -e "  ${RED}✗${NC} $(basename $service) missing Dockerfile"
            ((ISSUES_FOUND++))
        fi
    fi
done

# 3. Check all services have index.js
echo -e "${YELLOW}📦 Checking service entry points...${NC}"
for service in backend/*/; do
    if [[ -d "$service/src" ]]; then
        if [[ -f "$service/src/index.js" ]]; then
            echo -e "  ${GREEN}✓${NC} $(basename $service) has index.js"
            ((CHECKS_PASSED++))
        else
            echo -e "  ${RED}✗${NC} $(basename $service) missing index.js"
            ((ISSUES_FOUND++))
        fi
    fi
done

# 4. Check environment configuration
echo -e "${YELLOW}⚙️ Checking environment config...${NC}"
if [[ -f "env.example" ]] || [[ -f ".env.example" ]]; then
    echo -e "  ${GREEN}✓${NC} Environment example file exists"
    ((CHECKS_PASSED++))
else
    echo -e "  ${RED}✗${NC} Missing env.example file"
    ((ISSUES_FOUND++))
fi

# 5. Check for hardcoded secrets
echo -e "${YELLOW}🔐 Checking for hardcoded secrets...${NC}"
SECRET_PATTERNS="sk-[a-zA-Z0-9]{48}|AIza[a-zA-Z0-9]{35}|sq0atp-[a-zA-Z0-9]{22}|eyJ[a-zA-Z0-9]+"
SECRET_COUNT=$(grep -r -E "$SECRET_PATTERNS" --include="*.js" --include="*.py" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=legacy 2>/dev/null | wc -l || echo "0")
if [[ "$SECRET_COUNT" -gt 0 ]]; then
    echo -e "  ${RED}✗${NC} Found $SECRET_COUNT potential hardcoded secrets"
    ((ISSUES_FOUND++))
else
    echo -e "  ${GREEN}✓${NC} No hardcoded secrets found"
    ((CHECKS_PASSED++))
fi

# 6. Check Docker health
echo -e "${YELLOW}🐳 Checking Docker containers...${NC}"
RUNNING_CONTAINERS=$(docker ps --format "{{.Names}}" | wc -l)
FAILED_CONTAINERS=$(docker ps -a --filter "status=exited" --filter "status=dead" --format "{{.Names}}" | wc -l)
if [[ "$FAILED_CONTAINERS" -gt 0 ]]; then
    echo -e "  ${YELLOW}⚠${NC} $FAILED_CONTAINERS containers have failed"
    ((ISSUES_FOUND++))
else
    echo -e "  ${GREEN}✓${NC} No failed containers"
    ((CHECKS_PASSED++))
fi
echo -e "  ${BLUE}ℹ${NC} $RUNNING_CONTAINERS containers running"

# 7. Check for broken imports
echo -e "${YELLOW}📦 Checking imports...${NC}"
BROKEN_IMPORTS=$(grep -r "from '\./\.\./\.\./\.\." --include="*.js" --include="*.jsx" --exclude-dir=node_modules 2>/dev/null | wc -l || echo "0")
if [[ "$BROKEN_IMPORTS" -gt 0 ]]; then
    echo -e "  ${YELLOW}⚠${NC} Found $BROKEN_IMPORTS deep relative imports (potential issues)"
    ((ISSUES_FOUND++))
else
    echo -e "  ${GREEN}✓${NC} Import paths look good"
    ((CHECKS_PASSED++))
fi

# 8. Check for console.log statements
echo -e "${YELLOW}🔍 Checking for debug statements...${NC}"
CONSOLE_COUNT=$(grep -r "console\.log\|console\.error" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=legacy 2>/dev/null | wc -l || echo "0")
if [[ "$CONSOLE_COUNT" -gt 20 ]]; then
    echo -e "  ${YELLOW}⚠${NC} Found $CONSOLE_COUNT console statements (consider using logger)"
    ((ISSUES_FOUND++))
else
    echo -e "  ${GREEN}✓${NC} Console usage acceptable ($CONSOLE_COUNT)"
    ((CHECKS_PASSED++))
fi

# 9. Check Git status
echo -e "${YELLOW}📊 Checking Git status...${NC}"
UNCOMMITTED=$(git status --porcelain | wc -l)
if [[ "$UNCOMMITTED" -gt 0 ]]; then
    echo -e "  ${YELLOW}⚠${NC} $UNCOMMITTED uncommitted changes"
    ((ISSUES_FOUND++))
else
    echo -e "  ${GREEN}✓${NC} Working tree clean"
    ((CHECKS_PASSED++))
fi

# 10. Check Cursor rules
echo -e "${YELLOW}📚 Checking Cursor rules...${NC}"
RULE_COUNT=$(ls -1 .cursor/rules/*.mdc 2>/dev/null | wc -l || echo "0")
if [[ "$RULE_COUNT" -ge 10 ]]; then
    echo -e "  ${GREEN}✓${NC} $RULE_COUNT Cursor rules configured"
    ((CHECKS_PASSED++))
else
    echo -e "  ${RED}✗${NC} Only $RULE_COUNT Cursor rules (expected 10+)"
    ((ISSUES_FOUND++))
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    📊 AUDIT SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo ""

TOTAL_CHECKS=$((CHECKS_PASSED + ISSUES_FOUND))
PERCENTAGE=$((CHECKS_PASSED * 100 / TOTAL_CHECKS))

echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}/$TOTAL_CHECKS"
echo -e "Issues Found:  ${RED}$ISSUES_FOUND${NC}"
echo -e "Truth Score:   ${BLUE}$PERCENTAGE%${NC}"
echo ""

if [[ "$ISSUES_FOUND" -eq 0 ]]; then
    echo -e "${GREEN}✅ 100% TRUTH ACHIEVED! WE ARE STRAIGHT!${NC}"
    echo ""
    echo "🎯 TIER-1 CERTIFICATION: PASSED"
    echo "🏆 MARINE CORPS PRECISION: ACHIEVED"
    echo "💯 REPOSITORY STATUS: PURE"
    exit 0
else
    echo -e "${YELLOW}⚠️  ${ISSUES_FOUND} issues need attention${NC}"
    echo ""
    echo "Run './automation/scripts/tier1_comprehensive_audit.sh' after fixes"
    exit 1
fi

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
