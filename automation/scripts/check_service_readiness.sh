#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Validating Cloud Run manifest readiness"
if [ ! -d "$ROOT_DIR/cloud-run" ]; then
  log_warn "cloud-run directory missing"
  exit 0
fi

missing=0
for manifest in "$ROOT_DIR"/cloud-run/*.yaml; do
  if [ ! -f "$manifest" ]; then
    missing=1
    continue
  fi
  service_name="$(basename "$manifest" .yaml)"
  image="$(sed -n 's/^[[:space:]-]*image:[[:space:]]*//p' "$manifest" | head -n1)"
  if [ -z "$image" ]; then
    log_warn "Image not defined in $manifest"
  else
    log_info "$service_name -> $image"
  fi
done

if [ "$missing" -eq 1 ]; then
  log_warn "One or more manifests not found"
fi

log_info "Service readiness check complete"

# Last updated: 2025-10-02
