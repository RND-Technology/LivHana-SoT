#!/usr/bin/env bash
# Auto-starts the Tier-1 research agent with Perplexity/Apify tooling.
# Uses `op run` when available so secrets resolve without leaking into logs.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT/logs/research"
STATUS_DIR="$ROOT/tmp/agent_status"

mkdir -p "$LOG_DIR" "$STATUS_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOG_DIR/research_agent_${TIMESTAMP}.log"
PID_FILE="$STATUS_DIR/research.pid"

{
  echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Starting research agent..."

  if ! command -v claude-tier1 >/dev/null 2>&1; then
    echo "ERROR: claude-tier1 CLI not found in PATH. Install or expose before running."
    exit 1
  fi

  CMD=(claude-tier1 research --project LivHana-SoT --plan docs/tier1_recon_plan.md --tools perplexity,apify)

  if command -v op >/dev/null 2>&1; then
    echo "INFO: Launching research agent via op run to load secrets."
    op run -- "${CMD[@]}" &
  else
    echo "WARN: 1Password CLI not available; launching research agent without op run."
    "${CMD[@]}" &
  fi

  PID=$!
  echo "INFO: Research agent PID: $PID"
  echo "$PID" > "$PID_FILE"
} >>"$LOG_FILE" 2>&1

disown "$PID" >/dev/null 2>&1 || true

echo "Research agent started (PID: ${PID}). Logs: $LOG_FILE"
