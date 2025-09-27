#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Checking service health"
if command -v gcloud >/dev/null 2>&1; then
  log_info "gcloud detected – skipping API calls (requires authenticated session)"
else
  log_warn "gcloud CLI not found – running manifest level checks only"
fi

for manifest in "$ROOT_DIR"/cloud-run/*.yaml; do
  [ -f "$manifest" ] || continue
  service_name="$(basename "$manifest" .yaml)"
  log_info "Service manifest detected: $service_name"
  if ! grep -q 'livenessProbe' "$manifest"; then
    log_warn "No livenessProbe configured in $service_name"
  fi
  if ! grep -q 'readinessProbe' "$manifest"; then
    log_warn "No readinessProbe configured in $service_name"
  fi
done

log_info "Service health check finished"
