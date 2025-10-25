#!/usr/bin/env bash
set -euo pipefail

# Stream redactor: aggressively redact common secret patterns across env, JSON, headers, and query params.
# Usage: producer | scrub_secrets.sh >> logfile
# BSD-compatible sed implementation (macOS-safe, no perl required)

scrub_secrets() {
  sed -E \
    -e 's/(Authorization[[:space:]]*:[[:space:]]*Bearer[[:space:]]+)[^[:space:]]+/\1***REDACTED***/g' \
    -e 's/(Authorization[[:space:]]*:[[:space:]]*Basic[[:space:]]+)[^[:space:]]+/\1***REDACTED***/g' \
    -e 's/([?&](api[_-]?key|apikey|token|access_token|refresh_token|secret|client_secret|password|pass)=)[^&#[:space:]]+/\1***REDACTED***/g' \
    -e 's/((^|[[:space:]])(API[_-]?KEY|APIKEY|KEY|TOKEN|ACCESS_TOKEN|REFRESH_TOKEN|SECRET|CLIENT_SECRET|PASSWORD|PASS|JWT_SECRET)[[:space:]]*[=:][[:space:]]*)"[^"]*"/\1"***REDACTED***"/g' \
    -e 's/((^|[[:space:]])(API[_-]?KEY|APIKEY|KEY|TOKEN|ACCESS_TOKEN|REFRESH_TOKEN|SECRET|CLIENT_SECRET|PASSWORD|PASS|JWT_SECRET)[[:space:]]*[=:][[:space:]]*)[^[:space:]"'\'']+/\1***REDACTED***/g' \
    -e 's/("(apiKey|key|token|access_token|refresh_token|secret|client_secret|password|jwtSecret)"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"***REDACTED***"/g' \
    -e 's/-----BEGIN (RSA |EC )?PRIVATE KEY-----.*-----END (RSA |EC )?PRIVATE KEY-----/-----BEGIN PRIVATE KEY-----\n***REDACTED***\n-----END PRIVATE KEY-----/g'
}

if [[ "${BASH_SOURCE[0]:-$0}" == "$0" ]]; then
  scrub_secrets "$@"
fi
