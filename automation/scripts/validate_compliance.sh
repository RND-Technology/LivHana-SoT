#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

level="${COMPLIANCE_LEVEL:-}" 
if [ -z "$level" ]; then
  log_error "COMPLIANCE_LEVEL is not set"
  exit 1
fi

if [ "$level" != "21+" ]; then
  log_warn "COMPLIANCE_LEVEL is '$level' – expected '21+'"
else
  log_info "COMPLIANCE_LEVEL set to 21+"
fi

if [ ! -f "$ROOT_DIR/IdentityPlatform_21Plus_UNF.md" ] && [ ! -f "$ROOT_DIR/docs/IdentityPlatform_21Plus_UNF.md" ]; then
  log_warn "21+ identity policy document not found"
else
  log_info "21+ identity policy document located"
fi

log_info "Compliance validation complete"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

# Optimized: 2025-10-02
