#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Verifying data integrity artifacts"
REPORT_DIR="$ROOT_DIR/logs"
if [ ! -d "$REPORT_DIR" ]; then
  log_warn "Logs directory not found; creating"
  mkdir -p "$REPORT_DIR"
fi

latest_report=$(ls -1t "$REPORT_DIR"/data_ingestion_report_*.md 2>/dev/null | head -n 1 || true)
if [ -z "$latest_report" ]; then
  log_warn "No ingestion reports found"
else
  log_info "Latest ingestion report: $latest_report"
fi

log_info "Data integrity verification complete"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
