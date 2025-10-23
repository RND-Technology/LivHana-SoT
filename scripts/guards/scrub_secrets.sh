#!/usr/bin/env bash
set -euo pipefail

scrub_secrets() {
  sed -E \
    -e 's/(API[_-]?KEY[_-]?[A-Z0-9]*)[=:][^ ]*/\1=***REDACTED***/gi' \
    -e 's/(TOKEN)[=:][^ ]*/\1=***REDACTED***/gi' \
    -e 's/(SECRET)[=:][^ ]*/\1=***REDACTED***/gi' \
    -e 's/(PASSWORD)[=:][^ ]*/\1=***REDACTED***/gi'
}

if [[ "${BASH_SOURCE[0]:-$0}" == "$0" ]]; then
  scrub_secrets "$@"
fi
