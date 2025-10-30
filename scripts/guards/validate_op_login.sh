#!/usr/bin/env bash
# scripts/guards/validate_op_login.sh
# Ensures the 'op' CLI is logged in before proceeding.

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

validate_op_login() {
    if ! command -v op &> /dev/null; then
        error "1Password CLI ('op') not found. Please install it."
        error "See: https://1password.com/developers/cli/getting-started/"
        return 1
    fi

    # Check if already logged in by trying a low-impact command
    if op account get >/dev/null 2>&1; then
        success "1Password CLI is logged in."
        return 0
    else
        error "1Password CLI is not logged in."
        error "Please run 'op signin' and try again."
        return 1
    fi
}

# Allow sourcing without execution, but also allow direct execution for validation
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    validate_op_login
fi
