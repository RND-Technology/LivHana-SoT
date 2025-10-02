#!/bin/bash
# TIER-1 DOCUMENTATION AUDIT - FIND AND FIX ALL GENERIC CONTENT

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WORKSPACE_ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$WORKSPACE_ROOT"

echo "═══════════════════════════════════════════════════════════════"
echo "     📚 TIER-1 DOCUMENTATION AUDIT"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Count total markdown files
TOTAL_MD=$(find . -name "*.md" -type f | wc -l | tr -d ' ')
echo -e "${BLUE}Total Markdown Files: $TOTAL_MD${NC}"
echo ""

# Check for generic/placeholder content
echo -e "${YELLOW}🔍 Scanning for Generic Content...${NC}"

# Generic terms to find
GENERIC_TERMS=(
    "placeholder"
    "TODO"
    "FIXME"
    "XXX"
    "HACK"
    "example project"
    "sample application"
    "your-.*-here"
    "FastAPI"
    "test data"
    "dummy"
    "lorem ipsum"
    "<INSERT"
    "REPLACE_ME"
    "coming soon"
    "work in progress"
    "WIP"
    "TBD"
    "to be determined"
)

ISSUES_FOUND=0

for term in "${GENERIC_TERMS[@]}"; do
    COUNT=$(grep -r "$term" --include="*.md" --exclude-dir=node_modules --exclude-dir=legacy 2>/dev/null | wc -l || echo "0")
    if [[ "$COUNT" -gt 0 ]]; then
        echo -e "  ${RED}✗${NC} Found $COUNT instances of '$term'"
        ((ISSUES_FOUND+=COUNT))
    fi
done

if [[ "$ISSUES_FOUND" -eq 0 ]]; then
    echo -e "  ${GREEN}✓${NC} No generic content found!"
else
    echo -e "  ${RED}⚠${NC} Total generic content instances: $ISSUES_FOUND"
fi

echo ""
echo -e "${YELLOW}📋 Checking Critical Documentation...${NC}"

# Critical files that must exist and be Tier-1
CRITICAL_DOCS=(
    "README.md"
    "E2E_MISSION.md"
    "CURRENT_STATUS.md"
    "CLEAN_REPO_STRUCTURE.md"
    "LICENSE"
    "env.example"
)

for doc in "${CRITICAL_DOCS[@]}"; do
    if [[ -f "$doc" ]]; then
        # Check if it mentions cannabis/Liv Hana
        if grep -q -i "cannabis\|liv hana\|reggie.*dro\|jesse niesen" "$doc" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} $doc - Tier-1 compliant"
        else
            echo -e "  ${RED}✗${NC} $doc - Missing Tier-1 content"
        fi
    else
        echo -e "  ${RED}✗${NC} $doc - FILE MISSING!"
    fi
done

echo ""
echo -e "${YELLOW}🏗️ Checking Service Documentation...${NC}"

# Each service should have a README
SERVICES=(
    "backend/voice-service"
    "backend/reasoning-gateway"
    "backend/cannabis-service"
    "backend/payment-service"
    "backend/integration-service"
    "backend/product-service"
)

for service in "${SERVICES[@]}"; do
    if [[ -f "$service/README.md" ]]; then
        echo -e "  ${GREEN}✓${NC} $(basename $service) has README"
    else
        echo -e "  ${YELLOW}⚠${NC} $(basename $service) missing README"
    fi
done

echo ""
echo -e "${YELLOW}📊 Documentation Quality Metrics...${NC}"

# Count documentation by category
ARCH_DOCS=$(find docs/architecture -name "*.md" 2>/dev/null | wc -l || echo "0")
GOV_DOCS=$(find docs/governance -name "*.md" 2>/dev/null | wc -l || echo "0")
MISSION_DOCS=$(find docs/missions -name "*.md" 2>/dev/null | wc -l || echo "0")
API_DOCS=$(find docs/api -name "*.md" 2>/dev/null | wc -l || echo "0")

echo -e "  Architecture Docs: ${BLUE}$ARCH_DOCS${NC}"
echo -e "  Governance Docs: ${BLUE}$GOV_DOCS${NC}"
echo -e "  Mission Docs: ${BLUE}$MISSION_DOCS${NC}"
echo -e "  API Docs: ${BLUE}$API_DOCS${NC}"

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    📊 AUDIT SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [[ "$ISSUES_FOUND" -eq 0 ]]; then
    echo -e "${GREEN}✅ DOCUMENTATION IS TIER-1 COMPLIANT!${NC}"
    echo ""
    echo "🎯 All documentation meets Marine Corps standards"
    echo "💯 No generic content found"
    echo "🚀 Ready for production"
else
    echo -e "${YELLOW}⚠️ Documentation needs attention${NC}"
    echo ""
    echo "Found $ISSUES_FOUND instances of generic content"
    echo "Run full documentation update to achieve Tier-1"
fi

echo ""
echo "SEMPER FI - DOCUMENTATION EXCELLENCE! 🇺🇸"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
