#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

manifest="$ROOT_DIR/highnoon/context_manifest.yaml"
if [ ! -f "$manifest" ]; then
  log_warn "Context manifest missing at $manifest"
  exit 1
fi

log_info "Context manifest present"

required_terms=(LivHana-SoT LivHana-Kinetic LivHana-Potential)
for term in "${required_terms[@]}"; do
  if ! grep -q "$term" "$manifest"; then
    log_warn "Manifest missing entry for $term"
  fi
done

log_info "Context integrity validation complete"
