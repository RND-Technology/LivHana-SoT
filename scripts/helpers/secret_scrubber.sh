#!/usr/bin/env bash
# scripts/helpers/secret_scrubber.sh
# Scrubs secrets from log files or command output.

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

# --- Secret Detection Patterns ---
# Add more patterns as needed.
# This list should be considered sensitive.
readonly SECRET_PATTERNS=(
  # OpenAI / generic secret key forms (sk- or sk_live_/sk_test_ etc.)
  "sk(-|_live_|_test_)[a-zA-Z0-9]{16,}"
  # Generic API key prefixes (pk_, rk_) followed by long token
  "(pk|rk)_[a-zA-Z0-9]{16,}"
  # Matches AWS Access Key ID
  "AKIA[0-9A-Z]{16}"
  # Matches AWS Secret Access Key (40 chars) preceded by optional label
  "[A-Za-z0-9/+=]{40}"
  # Generic assignments containing sensitive words
  # token/secret/password assignments allowing broader charset inside quotes
    '(token|secret|password)["'"'"']?[:=]["'"'"']?[^"'"'"'\\n]{6,}'
  # 1Password references
  "op://[A-Za-z0-9_/.-]+"
)

# --- Functions ---

# Scrubs secrets from a stream (stdin)
# Usage: some_command | scrub_stream
scrub_stream() {
  # Sequential targeted replacements to preserve labels
  local line
  local pattern
  local combined_pattern
    

  sed -E \
    -e 's#(aws secret: )[A-Za-z0-9/+=]{40}#\1[REDACTED]#g' \
    -e 's#(aws key: )[A-Z0-9]{20,}#\1[REDACTED]#g' \
    -e 's#(my api key is )sk(-|_live_|_test_)[A-Za-z0-9]{16,}#\1[REDACTED]#g' \
    -e 's#db password=["'"'"']?[^"'"'"']+["'"'"']?#db [REDACTED]#g' \
    -e 's#(token|secret|password)(["'"'"']?[:=]["'"'"']?)( ?)[^"'"'"'\n]{6,}#\1\2\3[REDACTED]#g' \
    -e 's#op://[A-Za-z0-9_/.-]+#[REDACTED]#g'
}

# Scrubs secrets from a file in-place
# Usage: scrub_file /path/to/logfile.log
scrub_file() {
    local file_path="$1"

    if [[ ! -f "$file_path" ]]; then
        error "File not found: $file_path"
        return 1
    fi

    info "Scrubbing secrets from '$file_path'..."
    
    local temp_file
    temp_file=$(mktemp)

    # Read from the original file, scrub, and write to a temp file
  scrub_stream < "$file_path" > "$temp_file"

    # Replace the original file with the scrubbed version
    mv "$temp_file" "$file_path"
    
    success "Scrubbing complete for '$file_path'."
}


# Allow sourcing without execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  error "This script is a library and should be sourced, not executed directly."
  exit 1
fi
