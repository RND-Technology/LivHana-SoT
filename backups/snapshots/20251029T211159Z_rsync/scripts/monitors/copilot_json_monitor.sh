#!/bin/bash
#
# Copilot JSON Real-Time Monitor
# Watches tmp/copilot_chat_latest.json for updates and triggers actions
# Part of PO1 Self-Healing Architecture
#

set -euo pipefail

# Configuration
COPILOT_JSON_PATH="${COPILOT_JSON_PATH:-/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tmp/copilot_chat_latest.json}"
CHECK_INTERVAL="${COPILOT_MONITOR_INTERVAL:-5}" # seconds
LOG_FILE="/tmp/copilot_monitor_$(date +%Y%m%d).log"
ACTION_QUEUE="/tmp/copilot_actions.queue"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo "[${timestamp}] $1" | tee -a "${LOG_FILE}"
}

# Initialize
mkdir -p "$(dirname "${ACTION_QUEUE}")"
touch "${ACTION_QUEUE}"

if [[ ! -f "${COPILOT_JSON_PATH}" ]]; then
  log "ERROR: Copilot JSON not found at ${COPILOT_JSON_PATH}"
  exit 1
fi

log "${CYAN}Copilot JSON Monitor started${NC}"
log "Watching: ${COPILOT_JSON_PATH}"
log "Check interval: ${CHECK_INTERVAL}s"

# Track last modification time
last_mtime=$(stat -f "%m" "${COPILOT_JSON_PATH}" 2>/dev/null || stat -c "%Y" "${COPILOT_JSON_PATH}")
last_size=$(wc -c < "${COPILOT_JSON_PATH}")

# Extract latest message
extract_latest_message() {
  # Get last 5000 characters and extract most recent message
  tail -c 5000 "${COPILOT_JSON_PATH}" | \
    grep -o '"text":"[^"]*"' | \
    tail -1 | \
    sed 's/"text":"//;s/"$//'
}

# Process detected change
process_update() {
  local new_size=$1
  local size_diff=$((new_size - last_size))

  log "${GREEN}Update detected${NC} (+${size_diff} bytes)"

  # Extract latest message
  local latest_msg=$(extract_latest_message)

  if [[ -n "${latest_msg}" ]]; then
    log "Latest message: ${latest_msg:0:100}..."

    # Check for action keywords
    if echo "${latest_msg}" | grep -qi "refactor\|fix\|implement\|deploy"; then
      echo "${latest_msg}" >> "${ACTION_QUEUE}"
      log "${YELLOW}Action queued for processing${NC}"
    fi

    # Check for PO1 keywords
    if echo "${latest_msg}" | grep -qi "queue.*unif\|redis.*secur\|triple.*loop"; then
      log "${YELLOW}PO1 directive detected - triggering automated execution${NC}"
      # Trigger PO1 execution (placeholder for now)
    fi
  fi

  last_size=${new_size}
}

# Main monitoring loop
log "Monitoring active - press Ctrl+C to stop"

while true; do
  current_mtime=$(stat -f "%m" "${COPILOT_JSON_PATH}" 2>/dev/null || stat -c "%Y" "${COPILOT_JSON_PATH}")
  current_size=$(wc -c < "${COPILOT_JSON_PATH}")

  if [[ "${current_mtime}" != "${last_mtime}" ]] || [[ "${current_size}" != "${last_size}" ]]; then
    last_mtime=${current_mtime}
    process_update "${current_size}"
  fi

  sleep "${CHECK_INTERVAL}"
done
