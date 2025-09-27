#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Running compliance audit"
"$(dirname "$0")/validate_compliance.sh"

audit_log="$ROOT_DIR/logs/compliance_audit_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$ROOT_DIR/logs"
{
  echo "timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "compliance_level: ${COMPLIANCE_LEVEL:-unset}"
  echo "auditor: automation"
} >> "$audit_log"

log_info "Compliance audit logged to $audit_log"
