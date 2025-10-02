#!/bin/bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_BASE="${VITE_API_URL:-http://localhost:3005}"
FRONTEND_BASE="${FRONTEND_BASE:-http://localhost:5173}"

pass() { printf "%b%s%b\n" "$GREEN" "$1" "$NC"; }
warn() { printf "%b%s%b\n" "$YELLOW" "$1" "$NC"; }
fail() { printf "%b%s%b\n" "$RED" "$1" "$NC"; }

check_http() {
  local name=$1
  local url=$2
  local expect=${3:-200}
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)
  if [ "$code" = "$expect" ]; then
    pass "${name}: ${url} (${code})"
  elif [ "$code" = "" ]; then
    fail "${name}: ${url} unreachable"
  else
    warn "${name}: ${url} returned ${code}"
  fi
}

printf "\n=== Backend Health ===\n"
check_http "Integration health" "$API_BASE/health"
check_http "BigQuery dashboard" "$API_BASE/api/bigquery/dashboard"
check_http "BigQuery historical" "$API_BASE/api/bigquery/historical"
check_http "BigQuery products" "$API_BASE/api/bigquery/products"
check_http "Square catalog" "$API_BASE/api/square/catalog"
check_http "Square transactions" "$API_BASE/api/square/transactions"

printf "\n=== Frontend Routes ===\n"
check_http "Landing" "$FRONTEND_BASE" "200"
check_http "Empire dashboard" "$FRONTEND_BASE/empire-dashboard" "200"
check_http "Products" "$FRONTEND_BASE/products" "200"
check_http "Square cockpit" "$FRONTEND_BASE/cockpit" "200"

printf "\nHealthcheck sweep complete.\n"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
