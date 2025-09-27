#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Running sovereign compliance validation"
"$(dirname "$0")/validate_compliance.sh"

policy_docs=(
  "$ROOT_DIR/CURRENT_STATUS.md"
  "$ROOT_DIR/docs/CURRENT_STATUS.md"
  "$ROOT_DIR/docs/IdentityPlatform_21Plus_UNF.md"
)

found=0
for doc in "${policy_docs[@]}"; do
  if [ -f "$doc" ]; then
    log_info "Compliance reference located: $doc"
    found=1
  fi
done

if [ "$found" -eq 0 ]; then
  log_warn "No compliance reference documents found"
fi

log_info "Sovereign compliance validation finished"
