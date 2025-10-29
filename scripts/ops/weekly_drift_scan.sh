#!/usr/bin/env bash
# Weekly Architectural Drift Scan (Loop 3 - Weekly Cycle)
# Scans for architectural drift, service boundary violations, queue naming issues
# Part of PO1 Marine Corps Standard Triple Loop System
# Created: 2025-10-29 by Liv Hana (Tier-1)
# Owner: Jesse CEO

set -euo pipefail

# Configuration
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)"
LOG="$ROOT/logs/weekly_drift_scan_$(date +%Y%m%d_%H%M%S).log"
REPORT="$ROOT/.claude/drift_reports/DRIFT_SCAN_$(date +%Y-%m-%d).md"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1" | tee -a "$LOG"; }
warning() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️  $1" | tee -a "$LOG"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1" | tee -a "$LOG"; }

# Initialize
mkdir -p "$(dirname "$LOG")" "$(dirname "$REPORT")"

info "=== Weekly Architectural Drift Scan Started ==="
info "Root: $ROOT"
info "Report: $REPORT"

# Start report
cat > "$REPORT" <<EOF
# Weekly Architectural Drift Scan
**Date:** $(date '+%Y-%m-%d %H:%M:%S %Z')
**PO1:** Mobile Control Branch Stabilization
**Marine Corps Standard:** Triple Loop Operational Cycles

---

## Executive Summary

EOF

# 1. Service Boundary Violations
info "Scanning for service boundary violations..."
violation_count=0

cat >> "$REPORT" <<EOF
## 1. Service Boundary Violations

EOF

# Check for direct imports across service boundaries
for service_dir in backend/*-service backend/*-gateway; do
  if [[ -d "$service_dir/src" ]]; then
    service_name=$(basename "$service_dir")

    # Find cross-service imports (should use message queue, not direct imports)
    cross_imports=$(grep -r "from.*backend/" "$service_dir/src" 2>/dev/null | grep -v "node_modules" | grep -v "$service_name" || true)

    if [[ -n "$cross_imports" ]]; then
      violation_count=$((violation_count + 1))
      warning "Service boundary violation in $service_name"

      cat >> "$REPORT" <<EOF
### ❌ $service_name
**Violation:** Direct cross-service imports detected
\`\`\`
$cross_imports
\`\`\`
**Fix:** Use message queue (BullMQ) for inter-service communication

EOF
    fi
  fi
done

if [[ $violation_count -eq 0 ]]; then
  success "No service boundary violations detected"
  cat >> "$REPORT" <<EOF
✅ **No violations detected** - All services properly isolated

EOF
fi

# 2. Queue Naming Conventions
info "Checking queue naming conventions..."
queue_issues=0

cat >> "$REPORT" <<EOF
## 2. Queue Naming Conventions

EOF

# Check for inconsistent queue names (should follow pattern: service.action)
queue_patterns=$(grep -r "createQueue\|Queue(" backend/*/src 2>/dev/null | grep -v "node_modules" || true)

while IFS= read -r line; do
  if echo "$line" | grep -vqE "'[a-z]+-[a-z]+\.[a-z]+'|\"[a-z]+-[a-z]+\.[a-z]+\""; then
    queue_issues=$((queue_issues + 1))
    warning "Non-standard queue naming: $line"

    cat >> "$REPORT" <<EOF
⚠️ **Non-standard queue name:**
\`\`\`
$line
\`\`\`

EOF
  fi
done <<< "$queue_patterns"

if [[ $queue_issues -eq 0 ]]; then
  success "All queue names follow naming convention"
  cat >> "$REPORT" <<EOF
✅ **Naming convention followed** - All queues use 'service.action' pattern

EOF
fi

# 3. Redis Client Usage
info "Checking Redis client usage..."
redis_issues=0

cat >> "$REPORT" <<EOF
## 3. Redis Client Security

EOF

# Check for direct redis.createClient() calls (should use secureClient)
direct_redis=$(grep -r "redis\.createClient\|createClient()" backend/*/src 2>/dev/null | grep -v "node_modules" | grep -v "secureClient" || true)

if [[ -n "$direct_redis" ]]; then
  redis_issues=$(echo "$direct_redis" | wc -l | tr -d ' ')
  error "$redis_issues instances of direct Redis client creation found"

  cat >> "$REPORT" <<EOF
❌ **Insecure Redis Client Usage**
**Count:** $redis_issues instances
\`\`\`
$direct_redis
\`\`\`
**Fix:** Use \`createSecureClient()\` from \`backend/common/redis/secureClient.ts\`
**Security Risk:** HIGH - Missing ACL and TLS enforcement

EOF
else
  success "All Redis clients use secure wrapper"
  cat >> "$REPORT" <<EOF
✅ **Secure Redis usage** - All clients use \`createSecureClient()\`

EOF
fi

# 4. Documentation Freshness
info "Checking documentation audit status..."
stale_docs=0

cat >> "$REPORT" <<EOF
## 4. Documentation Audit Status

EOF

for readme in backend/*/README.md; do
  if [[ -f "$readme" ]]; then
    service_name=$(dirname "$readme" | xargs basename)

    # Check for audit tag
    if ! grep -q "Last Audited:" "$readme"; then
      stale_docs=$((stale_docs + 1))
      warning "Missing audit tag: $service_name"

      cat >> "$REPORT" <<EOF
⚠️ **$service_name** - Missing \`Last Audited\` tag

EOF
    else
      audit_date=$(grep "Last Audited:" "$readme" | head -1)
      audit_timestamp=$(echo "$audit_date" | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}")

      if [[ -n "$audit_timestamp" ]]; then
        days_old=$(( ($(date +%s) - $(date -j -f "%Y-%m-%d" "$audit_timestamp" +%s 2>/dev/null || echo 0)) / 86400 ))

        if [[ $days_old -gt 30 ]]; then
          stale_docs=$((stale_docs + 1))
          warning "$service_name docs are $days_old days old"

          cat >> "$REPORT" <<EOF
⚠️ **$service_name** - Last audited $days_old days ago ($audit_timestamp)

EOF
        fi
      fi
    fi
  fi
done

if [[ $stale_docs -eq 0 ]]; then
  success "All documentation is current"
  cat >> "$REPORT" <<EOF
✅ **Documentation fresh** - All READMEs audited within 30 days

EOF
fi

# 5. Test Coverage Delta
info "Checking test coverage..."

cat >> "$REPORT" <<EOF
## 5. Test Coverage Analysis

EOF

# Check if tests exist for key modules
critical_modules=(
  "backend/common/queues/queueFactory.ts"
  "backend/common/redis/secureClient.ts"
  "backend/reasoning-gateway/src/worker/autoScaler.ts"
  "backend/common/health/anomalyDetector.ts"
  "backend/common/health/latencyMonitor.ts"
)

missing_tests=0
for module in "${critical_modules[@]}"; do
  if [[ -f "$ROOT/$module" ]]; then
    module_name=$(basename "$module" .ts)
    test_file="${module%.*}.test.ts"

    if [[ ! -f "$ROOT/$test_file" ]]; then
      missing_tests=$((missing_tests + 1))
      warning "Missing test: $module"

      cat >> "$REPORT" <<EOF
❌ **Missing test:** \`$module\`
**Expected:** \`$test_file\`

EOF
    fi
  fi
done

if [[ $missing_tests -eq 0 ]]; then
  success "All critical modules have tests"
  cat >> "$REPORT" <<EOF
✅ **Test coverage complete** - All critical modules tested

EOF
fi

# 6. Compliance Rules Update Check
info "Checking compliance service rules..."

cat >> "$REPORT" <<EOF
## 6. Compliance Rules Status

EOF

if [[ -f "$ROOT/backend/compliance-service/src/rules/ruleEngine.ts" ]]; then
  # Check for mock/TODO markers
  mock_count=$(grep -c "TODO\|MOCK\|PLACEHOLDER" "$ROOT/backend/compliance-service/src/rules/ruleEngine.ts" || echo 0)

  if [[ $mock_count -gt 0 ]]; then
    error "Compliance service has $mock_count mock implementations"

    cat >> "$REPORT" <<EOF
❌ **Compliance Risk:** $mock_count mock/placeholder implementations found
**Action Required:** Implement production adapters for Veriff and COA validation
**Risk Level:** HIGH

EOF
  else
    success "Compliance service fully implemented"
    cat >> "$REPORT" <<EOF
✅ **Compliance ready** - No mock implementations

EOF
  fi
else
  warning "Compliance service not found"
  cat >> "$REPORT" <<EOF
⚠️ **Compliance service missing**

EOF
fi

# Summary
cat >> "$REPORT" <<EOF

---

## Summary

| Category | Status | Issues |
|----------|--------|--------|
| Service Boundaries | $([ $violation_count -eq 0 ] && echo "✅" || echo "❌") | $violation_count |
| Queue Naming | $([ $queue_issues -eq 0 ] && echo "✅" || echo "⚠️") | $queue_issues |
| Redis Security | $([ $redis_issues -eq 0 ] && echo "✅" || echo "❌") | $redis_issues |
| Documentation | $([ $stale_docs -eq 0 ] && echo "✅" || echo "⚠️") | $stale_docs |
| Test Coverage | $([ $missing_tests -eq 0 ] && echo "✅" || echo "❌") | $missing_tests |

**Total Drift Issues:** $((violation_count + queue_issues + redis_issues + stale_docs + missing_tests))

---

**Marine Corps Standard:** $([ $((violation_count + redis_issues + missing_tests)) -eq 0 ] && echo "✅ UPHELD" || echo "⚠️ REQUIRES ACTION")

**Next Scan:** $(date -v+7d '+%Y-%m-%d' 2>/dev/null || date -d '+7 days' '+%Y-%m-%d')

EOF

# Final status
total_issues=$((violation_count + queue_issues + redis_issues + stale_docs + missing_tests))

if [[ $total_issues -eq 0 ]]; then
  success "=== Weekly Drift Scan Complete - No Issues Detected ==="
  exit 0
else
  warning "=== Weekly Drift Scan Complete - $total_issues Issues Found ==="
  info "Report: $REPORT"
  exit 1
fi
