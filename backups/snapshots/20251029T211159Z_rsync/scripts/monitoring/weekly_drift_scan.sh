#!/bin/bash

# Weekly Architectural Drift Scan (PO1 Loop 3)
# Scans for: service boundaries, queue naming, compliance rule updates, docs freshness
# Marine Corps standard: Zero drift tolerance

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT}"
REPORT_DIR="$REPO_ROOT/.claude/drift-reports"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
REPORT_FILE="$REPORT_DIR/drift_scan_$TIMESTAMP.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Drift counters
DRIFT_SCORE=0
WARNINGS=()
ERRORS=()

log() {
  echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1"
}

warn() {
  echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️  $1"
  WARNINGS+=("$1")
  ((DRIFT_SCORE+=5)) || true
}

error() {
  echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1"
  ERRORS+=("$1")
  ((DRIFT_SCORE+=20)) || true
}

# Create report directory
mkdir -p "$REPORT_DIR"

log "🔍 Weekly Architectural Drift Scan Starting"
log "Repo: $REPO_ROOT"
log "Report: $REPORT_FILE"

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# Weekly Architectural Drift Scan

**Date:** $(date '+%Y-%m-%d %H:%M:%S %Z')
**Scan Type:** PO1 Loop 3 - Architecture Compliance
**Standard:** Marine Corps Zero Drift Tolerance

---

## Executive Summary

EOF

# 1. Service Boundary Drift
log "Scanning service boundaries..."
BOUNDARY_DRIFT=0

# Check for cross-service imports (bad)
CROSS_IMPORTS=$(find "$REPO_ROOT/backend" -name "*.ts" -o -name "*.js" | xargs grep -l "from.*backend/.*service" | grep -v node_modules || true)

if [[ -n "$CROSS_IMPORTS" ]]; then
  error "Cross-service imports detected (violates service boundary)"
  echo "## ❌ Service Boundary Violations" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "$CROSS_IMPORTS" | while read -r file; do
    echo "- \`$file\`" >> "$REPORT_FILE"
  done
  echo "" >> "$REPORT_FILE"
  ((BOUNDARY_DRIFT++)) || true
fi

# Check for shared common/ usage (good)
COMMON_USAGE=$(find "$REPO_ROOT/backend" -name "*.ts" -o -name "*.js" | xargs grep -l "from.*common/" | wc -l || echo 0)
success "Common module usage: $COMMON_USAGE files"

if [[ $BOUNDARY_DRIFT -eq 0 ]]; then
  echo "## ✅ Service Boundaries: CLEAN" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
fi

# 2. Queue Naming Conventions
log "Checking queue naming conventions..."
QUEUE_DRIFT=0

# Find all queue instantiations
QUEUES=$(grep -r "createHardenedQueue\|createQueue\|new Queue" "$REPO_ROOT/backend" --include="*.ts" --include="*.js" | grep -v node_modules || true)

# Check for non-standard names
NON_STANDARD_QUEUES=$(echo "$QUEUES" | grep -v "\-queue\|\-worker\|Queue(" || true)

if [[ -n "$NON_STANDARD_QUEUES" ]]; then
  warn "Non-standard queue naming detected"
  echo "## ⚠️  Queue Naming Drift" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
  echo "$NON_STANDARD_QUEUES" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  ((QUEUE_DRIFT++)) || true
fi

# Check for direct BullMQ usage (should use hardenedQueue)
DIRECT_BULLMQ=$(grep -r "from 'bullmq'" "$REPO_ROOT/backend" --include="*.ts" --include="*.js" | grep -v "common/queue" | grep -v node_modules || true)

if [[ -n "$DIRECT_BULLMQ" ]]; then
  error "Direct BullMQ usage detected (should use hardenedQueue)"
  echo "## ❌ Direct BullMQ Usage (Bypass Hardened Queue)" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
  echo "$DIRECT_BULLMQ" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
fi

if [[ $QUEUE_DRIFT -eq 0 ]]; then
  success "Queue naming: COMPLIANT"
  echo "## ✅ Queue Naming: COMPLIANT" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
fi

# 3. Redis Client Security (TLS + ACL)
log "Checking Redis client security..."
REDIS_DRIFT=0

# Find direct Redis instantiations
DIRECT_REDIS=$(grep -r "new Redis\|redis\.createClient" "$REPO_ROOT/backend" --include="*.ts" --include="*.js" | grep -v "common/queue" | grep -v node_modules | grep -v "// Use secure" || true)

if [[ -n "$DIRECT_REDIS" ]]; then
  error "Direct Redis client usage (should use createSecureRedisClient)"
  echo "## ❌ Insecure Redis Clients" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
  echo "$DIRECT_REDIS" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  ((REDIS_DRIFT++)) || true
fi

if [[ $REDIS_DRIFT -eq 0 ]]; then
  success "Redis security: ENFORCED"
  echo "## ✅ Redis Security: ENFORCED" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
fi

# 4. Documentation Freshness
log "Checking documentation freshness..."
DOCS_DRIFT=0

# Find all README files
READMES=$(find "$REPO_ROOT/backend" -name "README.md" -o -name "readme.md")

# Check for audit tags
STALE_DOCS=()
while IFS= read -r readme; do
  if ! grep -q "last-audited\|Last Audited" "$readme"; then
    STALE_DOCS+=("$readme")
    ((DOCS_DRIFT++)) || true
  fi
done <<< "$READMES"

if [[ ${#STALE_DOCS[@]} -gt 0 ]]; then
  warn "Documentation missing audit tags: ${#STALE_DOCS[@]} files"
  echo "## ⚠️  Stale Documentation (No Audit Tags)" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  for doc in "${STALE_DOCS[@]}"; do
    echo "- \`$doc\`" >> "$REPORT_FILE"
  done
  echo "" >> "$REPORT_FILE"
else
  success "All docs have audit tags"
  echo "## ✅ Documentation Freshness: TRACKED" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
fi

# 5. Compliance Rule Updates
log "Checking compliance service implementation..."
COMPLIANCE_DRIFT=0

# Check for mock verifiers (should be replaced with adapters)
MOCK_VERIFIERS=$(grep -r "mockVerification\|MockVerifier" "$REPO_ROOT/backend/compliance-service" --include="*.ts" --include="*.js" | grep -v node_modules || true)

if [[ -n "$MOCK_VERIFIERS" ]]; then
  error "Mock verification still in use (COA validation risk)"
  echo "## ❌ Compliance: Mock Verifiers Detected" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
  echo "$MOCK_VERIFIERS" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  ((COMPLIANCE_DRIFT++)) || true
fi

# Check for adapter pattern
ADAPTERS=$(find "$REPO_ROOT/backend/compliance-service" -name "*adapter.ts" -o -name "*Adapter.ts" | wc -l)

if [[ $ADAPTERS -gt 0 ]]; then
  success "Compliance adapters: $ADAPTERS found"
  echo "## ✅ Compliance Adapters: $ADAPTERS" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
else
  warn "No compliance adapters found (should have veriffAdapter, coaAdapter)"
fi

# 6. Test Coverage
log "Checking test coverage for critical modules..."
TEST_DRIFT=0

CRITICAL_MODULES=("common/queue" "common/health" "reasoning-gateway/src/worker")

for module in "${CRITICAL_MODULES[@]}"; do
  MODULE_PATH="$REPO_ROOT/backend/$module"
  if [[ -d "$MODULE_PATH" ]]; then
    # Count .test.ts or .spec.ts files
    TEST_FILES=$(find "$MODULE_PATH" -name "*.test.ts" -o -name "*.spec.ts" -o -name "*.test.js" -o -name "*.spec.js" | wc -l)

    if [[ $TEST_FILES -eq 0 ]]; then
      warn "No tests found for critical module: $module"
      ((TEST_DRIFT++)) || true
    else
      success "Tests found for $module: $TEST_FILES files"
    fi
  fi
done

if [[ $TEST_DRIFT -gt 0 ]]; then
  echo "## ⚠️  Test Coverage Gaps: $TEST_DRIFT modules" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
else
  echo "## ✅ Test Coverage: ADEQUATE" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
fi

# 7. START.sh Dependencies
log "Checking START.sh dependency timestamps..."
START_DRIFT=0

START_SH="$REPO_ROOT/START.sh"
if [[ -f "$START_SH" ]]; then
  START_TIMESTAMP=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$START_SH" 2>/dev/null || stat -c "%y" "$START_SH" 2>/dev/null | cut -d'.' -f1)
  success "START.sh last modified: $START_TIMESTAMP"

  # Check if START.sh is older than 7 days
  START_AGE=$(find "$START_SH" -mtime +7 | wc -l)
  if [[ $START_AGE -gt 0 ]]; then
    warn "START.sh not updated in 7+ days"
    ((START_DRIFT++)) || true
  fi
else
  error "START.sh not found"
fi

# Final Drift Score Report
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Drift Score: $DRIFT_SCORE" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [[ $DRIFT_SCORE -eq 0 ]]; then
  echo "**Status:** 🎖️  MARINE CORPS STANDARD - ZERO DRIFT" >> "$REPORT_FILE"
  success "🎖️  ZERO DRIFT - Marine Corps Standard Maintained"
elif [[ $DRIFT_SCORE -lt 20 ]]; then
  echo "**Status:** ✅ ACCEPTABLE - Minor Corrections Needed" >> "$REPORT_FILE"
  warn "Drift score: $DRIFT_SCORE (Acceptable but needs attention)"
elif [[ $DRIFT_SCORE -lt 50 ]]; then
  echo "**Status:** ⚠️  WARNING - Immediate Action Required" >> "$REPORT_FILE"
  warn "Drift score: $DRIFT_SCORE (WARNING - Immediate action required)"
else
  echo "**Status:** ❌ CRITICAL - Architecture Compromise" >> "$REPORT_FILE"
  error "Drift score: $DRIFT_SCORE (CRITICAL - Architecture compromised)"
fi

echo "" >> "$REPORT_FILE"
echo "### Warnings: ${#WARNINGS[@]}" >> "$REPORT_FILE"
for warning in "${WARNINGS[@]}"; do
  echo "- $warning" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "### Errors: ${#ERRORS[@]}" >> "$REPORT_FILE"
for err in "${ERRORS[@]}"; do
  echo "- $err" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "**Scan completed:** $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$REPORT_FILE"
echo "**Report:** \`$REPORT_FILE\`" >> "$REPORT_FILE"

log "Scan complete! Drift score: $DRIFT_SCORE"
log "Report saved to: $REPORT_FILE"

# Open report if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$REPORT_FILE"
fi

exit 0
