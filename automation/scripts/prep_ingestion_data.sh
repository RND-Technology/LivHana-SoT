#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Preparing ingestion data pipeline"

if [ ! -x "$ROOT_DIR/data-layer/alloydb-ingestion.sh" ]; then
  log_warn "alloydb-ingestion.sh not executable – fixing permissions"
  chmod +x "$ROOT_DIR/data-layer/alloydb-ingestion.sh"
fi

log_info "Running dry-run ingestion"
"$ROOT_DIR/data-layer/alloydb-ingestion.sh" --dry-run

log_info "Ingestion dry-run complete"

# Last updated: 2025-10-02
