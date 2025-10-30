#!/usr/bin/env bash
# scripts/guards/validate_linear_token.sh
# Validates Linear API key from 1Password before sync operations.

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

validate_linear_token() {
    # Check if op CLI is available
    if ! command -v op &> /dev/null; then
        error "1Password CLI ('op') not found. Install: brew install 1password-cli"
        return 1
    fi

    # Check if logged in
    if ! op account get >/dev/null 2>&1; then
        error "1Password CLI not logged in. Run: op signin"
        return 1
    fi

    # Attempt to fetch Linear API key
    local linear_key
    if linear_key=$(op read "op://LivHana/Linear API Key/credential" 2>/dev/null); then
        # Validate key format (starts with lin_api_)
        if [[ "$linear_key" =~ ^lin_api_ ]]; then
            success "Linear API key validated from 1Password"
            export LINEAR_API_KEY="$linear_key"
            return 0
        else
            error "Invalid Linear API key format (expected lin_api_*)"
            return 1
        fi
    else
        error "Failed to fetch Linear API key from 1Password"
        error "Expected path: op://LivHana/Linear API Key/credential"
        return 1
    fi
}

# Allow sourcing without execution, but also allow direct execution for validation
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    validate_linear_token
fi
