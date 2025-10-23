#!/usr/bin/env bash
set -euo pipefail

scrub_secrets() {
  # BSD-compatible sed with comprehensive patterns
  sed -E \
    -e 's/(key|token|secret)=\S+/\1=***REDACTED***/gi' \
    -e 's/(API[_-]?KEY[_-]?[A-Z0-9]*)[=:][^ ]*/\1=***REDACTED***/gi' \
    -e 's/(TOKEN)[=:][^ ]*/\1=***REDACTED***/gi' \
    -e 's/(SECRET)[=:][^ ]*/\1=***REDACTED***/gi' \
    -e 's/(PASSWORD)[=:][^ ]*/\1=***REDACTED***/gi' \
    -e 's/(Authorization|authorization):\s*Bearer\s+\S+/\1: Bearer ***REDACTED***/gi'
}

if [[ "${BASH_SOURCE[0]:-$0}" == "$0" ]]; then
  scrub_secrets "$@"
fi
