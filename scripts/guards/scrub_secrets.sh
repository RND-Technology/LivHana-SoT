#!/usr/bin/env bash
# Scrub secrets from log output
# Fixes V10: Secrets in log files

set -euo pipefail

scrub_secrets() {
  sed -E 's/(API[_-]?KEY[_-]?[A-Z0-9]*)[=:][^ ]*/\1=***REDACTED***/gi' \
      -E 's/(TOKEN)[=:][^ ]*/\1=***REDACTED***/gi' \
      -E 's/(SECRET)[=:][^ ]*/\1=***REDACTED***/gi' \
      -E 's/(PASSWORD)[=:][^ ]*/\1=***REDACTED***/gi'
}

if [[ "${BASH_SOURCE[0]:-$0}" == "${0}" ]]; then
  scrub_secrets "$@"
fi

