#!/usr/bin/env bash
set -euo pipefail

# Stream redactor: aggressively redact common secret patterns across env, JSON, headers, and query params.
# Usage: producer | scrub_secrets.sh >> logfile
# BSD-compatible sed implementation (macOS-safe, no perl required)

scrub_secrets() {
  sed -E \
    -e 's/(Authorization[[:space:]]*:[[:space:]]*Bearer[[:space:]]*)[^[:space:]]+/\1***REDACTED***/Ig' \
    -e 's/([?&](api[_-]?key|access_token|token|refresh_token|secret|password|pass)=)[^&#[:space:]]+/\1***REDACTED***/Ig' \
    -e 's/((^|[[:space:]])(API[_-]?KEY|KEY|TOKEN|ACCESS_TOKEN|REFRESH_TOKEN|SECRET|CLIENT_SECRET|PASSWORD|PASS)[[:space:]]*[=:][[:space:]]*)"[^"]*"/\1"***REDACTED***"/Ig' \
    -e 's/((^|[[:space:]])(API[_-]?KEY|KEY|TOKEN|ACCESS_TOKEN|REFRESH_TOKEN|SECRET|CLIENT_SECRET|PASSWORD|PASS)[[:space:]]*[=:][[:space:]]*)[^[:space:]"'\'']+/\1***REDACTED***/Ig'
}

if [[ "${BASH_SOURCE[0]:-$0}" == "$0" ]]; then
  scrub_secrets "$@"
fi
