#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Validating service deployment configuration"
require_command sed || true

for manifest in "$ROOT_DIR"/cloud-run/*.yaml; do
  [ -f "$manifest" ] || continue
  service_name="$(basename "$manifest" .yaml)"
  image="$(sed -n 's/^[[:space:]-]*image:[[:space:]]*//p' "$manifest" | head -n1)"
  if [[ -z "$image" ]]; then
    log_warn "Image missing for service $service_name"
  else
    log_info "Service $service_name configured with image: $image"
  fi
done

log_info "Service deployment validation complete"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

# Optimized: 2025-10-02
