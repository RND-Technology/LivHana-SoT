#!/usr/bin/env bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1


source "$(dirname "$0")/common.sh"

log_info "Triggering full data-layer refresh"

"$ROOT_DIR/data-layer/alloydb-ingestion.sh" "$@"

log_info "Data-layer refresh script completed"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
