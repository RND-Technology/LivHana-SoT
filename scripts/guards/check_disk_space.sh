#!/usr/bin/env bash
# scripts/guards/check_disk_space.sh
# Checks for sufficient disk space before starting operations.

set -euo pipefail

# Load logging helpers if they exist
if [[ -f "${ROOT:-.}/scripts/helpers/logging.sh" ]]; then
  # shellcheck source=scripts/helpers/logging.sh
  source "${ROOT:-.}/scripts/helpers/logging.sh"
else
  info() { echo "[INFO] $*"; }
  warning() { echo "[WARN] $*" >&2; }
  error() { echo "[ERROR] $*" >&2; }
  success() { echo "[SUCCESS] $*"; }
fi

# Default threshold: 500MB
DEFAULT_THRESHOLD_MB=500

check_disk_space() {
    local path="${1:-.}"
    local threshold_mb="${2:-$DEFAULT_THRESHOLD_MB}"
    
    # Get available disk space in megabytes
    # 'df -P' for POSIX standard output, 'awk' to get the available blocks and convert to MB
    local available_mb
    available_mb=$(df -P "$path" | awk 'NR==2 {print int($4 / 1024)}')

    if (( available_mb < threshold_mb )); then
        error "Insufficient disk space."
        error "Path: $path"
        error "Available: ${available_mb}MB"
        error "Required: ${threshold_mb}MB"
        return 1
    fi

    success "Disk space check passed. Available: ${available_mb}MB on path '$path'."
    return 0
}

# Allow sourcing without execution, but also allow direct execution for validation
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_disk_space
fi
