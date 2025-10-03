#!/bin/bash
# 🚀 SQUARE → BIGQUERY REAL-TIME SYNC
# Runs on a configurable interval inside the Docker container.

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

WORKSPACE_ROOT="${WORKSPACE_ROOT:-/app}"
LOG_FILE="${SYNC_LOG_FILE:-/var/log/square_sync.log}"
SYNC_INTERVAL="${SYNC_INTERVAL_SECONDS:-1800}"
PIPELINE_SCRIPT="${PIPELINE_SCRIPT:-square_ingest_all.ts}"

if command -v op &>/dev/null && [ -f "$WORKSPACE_ROOT/.env" ]; then
  eval "$(op run --env-file="$WORKSPACE_ROOT/.env" -- env)"
fi

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  printf '%s\n' "$1" | tee -a "$LOG_FILE"
}

run_pipeline() {
  log "${CYAN}Running Square → BigQuery pipeline using ${PIPELINE_SCRIPT}${NC}"
  (cd "$WORKSPACE_ROOT/automation/data-pipelines" && npx ts-node "$PIPELINE_SCRIPT") >>"$LOG_FILE" 2>&1
}

check_bigquery() {
  if ! command -v bq >/dev/null 2>&1; then
    log "${YELLOW}bq CLI not available. Skipping health check.${NC}"
    return 1
  fi

  if [ -z "${GCP_PROJECT_ID:-}" ] || [ -z "${BQ_DATASET:-}" ]; then
    log "${YELLOW}GCP_PROJECT_ID or BQ_DATASET not set. Skipping BigQuery health check.${NC}"
    return 1
  fi

  log "${CYAN}Checking BigQuery connectivity...${NC}"
  if bq query --location="${BQ_LOCATION:-US}" --use_legacy_sql=false "SELECT 1" >>"$LOG_FILE" 2>&1; then
    log "${GREEN}BigQuery connection healthy${NC}"
    return 0
  fi

  log "${RED}BigQuery connection check failed${NC}"
  return 1
}

print_metrics() {
  if ! command -v bq >/dev/null 2>&1; then
    log "${YELLOW}Skipping metrics; bq CLI not found.${NC}"
    return
  fi

  if [ -z "${GCP_PROJECT_ID:-}" ] || [ -z "${BQ_DATASET:-}" ]; then
    log "${YELLOW}Skipping metrics; dataset configuration missing.${NC}"
    return
  fi

  local payments_table="${BQ_TABLE_PAYMENTS:-square_payments}"

  TODAY_COUNT=$(bq query --use_legacy_sql=false --format=csv --location="${BQ_LOCATION:-US}" \
    "SELECT COUNT(*) FROM \`${GCP_PROJECT_ID}.${BQ_DATASET}.${payments_table}\` WHERE DATE(created_at) = CURRENT_DATE()" 2>/dev/null | tail -1)

  TODAY_REVENUE=$(bq query --use_legacy_sql=false --format=csv --location="${BQ_LOCATION:-US}" \
    "SELECT COALESCE(SUM(amount),0)/100 FROM \`${GCP_PROJECT_ID}.${BQ_DATASET}.${payments_table}\` WHERE DATE(created_at) = CURRENT_DATE() AND status = 'COMPLETED'" 2>/dev/null | tail -1)

  log "${BLUE}📈 Sync Metrics:${NC}"
  log "  • Transactions Today: ${TODAY_COUNT:-0}"
  log "  • Revenue Today: \$${TODAY_REVENUE:-0}"
}

main() {
  log "═══════════════════════════════════════════════════════════════"
  log "     🚀 SQUARE → BIGQUERY SYNC"
  log "     $(date '+%Y-%m-%d %H:%M:%S')"
  log "═══════════════════════════════════════════════════════════════"

  while true; do
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "Starting sync cycle at $(date '+%H:%M:%S')"

    if check_bigquery; then
      if run_pipeline; then
        log "${GREEN}Sync cycle completed successfully${NC}"
        print_metrics
      else
        log "${RED}Square → BigQuery pipeline failed${NC}"
      fi
    else
      log "${YELLOW}BigQuery unavailable; skipping sync${NC}"
    fi

    log "${YELLOW}Sleeping for ${SYNC_INTERVAL} seconds...${NC}"
    sleep "$SYNC_INTERVAL"
  done
}

trap 'log "Shutting down sync..."; exit 0' SIGTERM SIGINT

main

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

# Optimized: 2025-10-02
