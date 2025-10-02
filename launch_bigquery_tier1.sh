#!/bin/bash
# Launches the Square → BigQuery stack locally. Adjusts messaging based on
# whether real credentials are available.

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

WORKSPACE_ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$WORKSPACE_ROOT"

LIVE_REQUIREMENTS=(
  "SQUARE_ACCESS_TOKEN"
  "SQUARE_LOCATION_ID"
  "GCP_PROJECT_ID"
  "GOOGLE_APPLICATION_CREDENTIALS"
)

missing_live_env=()
for var in "${LIVE_REQUIREMENTS[@]}"; do
  if [ -z "${!var:-}" ]; then
    missing_live_env+=("$var")
  fi
done

if [ ${#missing_live_env[@]} -eq 0 ]; then
  DATA_MODE="live"
else
  DATA_MODE="mock"
fi

UPPER_MODE=$(printf '%s' "$DATA_MODE" | tr '[:lower:]' '[:upper:]')
MISSING_VARS_DISPLAY=${missing_live_env[*]:-none}

echo "═══════════════════════════════════════════════════════════════"
echo "     🔄 LIV HANA BIGQUERY STACK LAUNCH"
echo "     Mode: ${UPPER_MODE} (missing: ${MISSING_VARS_DISPLAY})"
echo "═══════════════════════════════════════════════════════════════"

echo -e "${CYAN}🐳 Checking Docker...${NC}"
if ! docker info >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠ Docker not running. Starting Docker Desktop...${NC}"
  open -a Docker
  sleep 10
fi

echo -e "${CYAN}🔐 Resolving environment...${NC}"
if [ ${#missing_live_env[@]} -gt 0 ] && command -v op >/dev/null 2>&1 && [ -f .env ]; then
  echo -e "${YELLOW}Attempting to load missing variables from 1Password...${NC}"
  eval "$(op run --env-file=.env -- env)"
fi

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━ PHASE 1: BIGQUERY SYNC ━━━━━━━━━━━━━━━${NC}"
docker-compose -f docker-compose.bigquery.yml up -d bigquery-sync redis

echo -e "${YELLOW}Waiting for integration service...${NC}"
for _ in {1..10}; do
  if curl -fsS http://localhost:3005/health >/dev/null 2>&1; then
    echo -e "${GREEN}Integration service responding on port 3005${NC}"
    break
  fi
  sleep 2
done

if ! curl -fsS http://localhost:3005/health >/dev/null 2>&1; then
  echo -e "${RED}Service failed to start. Logs:${NC}"
  docker logs bigquery-sync --tail 40
fi

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━ PHASE 2: OPTIONAL DEEPSEEK ━━━━━━━━━━━━${NC}"
read -p "Launch DeepSeek 33B locally? (y/N): " -r reply
echo
if [[ $reply =~ ^[Yy]$ ]]; then
  docker-compose -f docker-compose.bigquery.yml up -d deepseek
  echo -e "${GREEN}DeepSeek available at http://localhost:11434${NC}"
else
  echo -e "${YELLOW}Skipping DeepSeek container.${NC}"
fi

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━ PHASE 3: FRONTEND ━━━━━━━━━━━━━━━━━━━${NC}"
cd frontend/vibe-cockpit
if [ ! -d node_modules ]; then
  echo "Installing frontend dependencies..."
  npm install
fi
npm run dev -- --host 0.0.0.0 --port 5173 &
COCKPIT_PID=$!
cd ../..

echo ""
echo -e "${GREEN}Stack status:${NC}"
if curl -fsS http://localhost:3005/health >/dev/null 2>&1; then
  if command -v jq >/dev/null 2>&1; then
    MODE=$(curl -fsS http://localhost:3005/health | jq -r '.bigQuery.mode // "unknown"')
  else
    MODE=$(curl -fsS http://localhost:3005/health 2>/dev/null | grep -o '"mode":"[^"]*"' | cut -d'"' -f4)
  fi
  echo "  • Integration service: http://localhost:3005 (mode: ${MODE:-unknown})"
else
  echo "  • Integration service: unavailable"
fi

echo "  • Cockpit (Vite dev server): http://localhost:5173"
if docker ps --format '{{.Names}}' | grep -q '^redis-cache$'; then
  echo "  • Redis cache online"
fi

if [[ $DATA_MODE == "live" ]]; then
  echo -e "${GREEN}Live data prerequisites satisfied. BigQuery + Square sync will use production data.${NC}"
else
  echo -e "${YELLOW}Running in mock mode. Provide the missing environment variables for live data.${NC}"
fi

echo "Press Ctrl+C to stop the frontend dev server. Containers stay running until stopped manually."
wait $COCKPIT_PID
# Last optimized: 2025-10-02

# Last updated: 2025-10-02
