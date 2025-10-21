#!/usr/bin/env bash
set -euo pipefail

required=(
  "DEEPSEEK_API_KEY"
  "BLUECHECK_API_KEY"
  "GITHUB_PERSONAL_ACCESS_TOKEN"
  "JWT_SECRET1"
)

missing=0
for var in "${required[@]}"; do
  if [[ -z "${!var-}" ]]; then
    echo "MISSING: $var"
    missing=$((missing+1))
  else
    echo "OK: $var set"
  fi

done

if [[ $missing -gt 0 ]]; then
  echo "FAIL: $missing secret(s) missing"
  exit 1
fi

echo "PASS: all required secrets present in environment"

