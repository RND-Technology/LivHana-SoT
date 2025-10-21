#!/usr/bin/env bash
set -euo pipefail

# Validate presence of required secrets in Google Secret Manager
GCP_PROJECT="${GCP_PROJECT_ID:-reggieanddrodispensary}"

echo "Verifying required GSM secrets in project: $GCP_PROJECT"

gsm_required=(
  "Calendar-Agent-Builder"
  "Gmail-Agent-Builder"
  "Drive-Agent-Builder"
  "LightSpeed-Agent-Builder"
)

missing=0
for name in "${gsm_required[@]}"; do
  if gcloud secrets describe "$name" --project="$GCP_PROJECT" &>/dev/null; then
    # Also check for at least one enabled version
    if gcloud secrets versions list "$name" --project="$GCP_PROJECT" --filter="state=enabled" --format="value(name)" | grep -q .; then
      echo "OK (GSM): $name exists with enabled version"
    else
      echo "MISSING (no enabled version): $name"
      missing=$((missing+1))
    fi
  else
    echo "MISSING (not found): $name"
    missing=$((missing+1))
  fi
done

if [[ $missing -gt 0 ]]; then
  echo "FAIL: $missing GSM secret(s) missing or without enabled version"
  exit 1
fi

echo "PASS: All required GSM secrets present with at least one enabled version"

