#!/usr/bin/env bash
# One-liner to restore Claude Sonnet 4.5 to 100% Tier 1 Option A state
# Usage: ./boot OR source boot (to export env vars to current shell)

bash .claude/ULTIMATE_BOOT.sh

# Export env vars to calling shell if sourced
if [[ "${BASH_SOURCE[0]:-}" != "${0}" ]]; then
  export GCP_PROJECT_ID="reggieanddrodispensary"
  BIGQUERY_KEY_PATH="$(pwd)/backend/integration-service/.bigquery-key.json"

  if [[ -f "$BIGQUERY_KEY_PATH" ]]; then
    export GOOGLE_APPLICATION_CREDENTIALS="$BIGQUERY_KEY_PATH"
  fi

  if command -v gcloud >/dev/null 2>&1; then
    export SQUARE_ACCESS_TOKEN=$(gcloud secrets versions access latest --secret=SQUARE_ACCESS_TOKEN --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
    export SQUARE_LOCATION_ID=$(gcloud secrets versions access latest --secret=SQUARE_LOCATION_ID --project="$GCP_PROJECT_ID" 2>/dev/null || echo "")
  fi

  echo "✅ Environment variables exported to current shell"
fi
