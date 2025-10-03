#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Triggering full data-layer refresh"

"$ROOT_DIR/data-layer/alloydb-ingestion.sh" "$@"

log_info "Data-layer refresh script completed"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

# Optimized: 2025-10-02
