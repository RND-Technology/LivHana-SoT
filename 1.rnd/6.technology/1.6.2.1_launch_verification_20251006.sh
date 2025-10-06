#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

# Launch verification script for the local Liv Hana stack.

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

printf '═══════════════════════════════════════════════════════════════\n'
printf '     LIV HANA LAUNCH VERIFICATION\n'
printf '═══════════════════════════════════════════════════════════════\n\n'

printf 'Frontend check... '
if curl -fsS http://localhost:5173 >/dev/null 2>&1; then
  printf "%s\n" "${GREEN}OK${NC}"
else
  printf "%s\n" "${RED}UNREACHABLE${NC}"
fi

printf 'Backend health... '
HEALTH=$(curl -fsS http://localhost:3005/health 2>/dev/null || true)
if [ -n "$HEALTH" ]; then
  MODE=$(echo "$HEALTH" | grep -o '"mode":"[^"]*"' | head -n1 | cut -d'"' -f4)
  printf "%s (mode: %s)\n" "${GREEN}OK${NC}" "${MODE:-unknown}"
else
  printf "%s (service not responding)\n" "${YELLOW}PENDING${NC}"
fi

printf '\nRoutes available:\n'
printf '  • Dashboard:        http://localhost:5173/\n'
printf '  • Empire Dashboard: http://localhost:5173/empire-dashboard\n'
printf '  • Real Products:    http://localhost:5173/products\n'
printf '  • Square Cockpit:   http://localhost:5173/cockpit\n'
printf '  • Voice Mode:       http://localhost:5173/voice\n'

printf '\nBackend endpoints:\n'
printf '  • Square Catalog:   http://localhost:3005/api/square/catalog\n'
printf '  • BigQuery Metrics: http://localhost:3005/api/bigquery/dashboard\n'
printf '  • Transactions:     http://localhost:3005/api/square/transactions\n'
STATUS_MSG="Stack partially online"
STATUS_COLOR=$YELLOW
if [ -n "$HEALTH" ] && curl -fsS http://localhost:5173 >/dev/null 2>&1; then
  STATUS_MSG="Stack online"
  STATUS_COLOR=$GREEN
fi

printf '\n═══════════════════════════════════════════════════════════════\n'
printf "     %b%s%b\n" "$STATUS_COLOR" "$STATUS_MSG" "$NC"
printf '═══════════════════════════════════════════════════════════════\n\n'
printf 'Open cockpit: http://localhost:5173/cockpit\n'

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
