#!/bin/bash

# Copilot JSON Monitor - Real-time chat and extension state monitoring
# Monitors GitHub Copilot extension state and chat updates every 5 seconds

set -euo pipefail

COPILOT_CHAT_DIR="$HOME/.vscode/extensions/github.copilot-chat-0.31.5"
COPILOT_DIR="$HOME/.vscode/extensions/github.copilot-1.388.0"
WORKSPACE_DIR="${WORKSPACE_DIR:-/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT}"
VSCODE_STATE_DIR="$HOME/Library/Application Support/Code/User"
CHECK_INTERVAL="${COPILOT_MONITOR_INTERVAL:-5}"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
  echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1"
}

warn() {
  echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️  $1"
}

error() {
  echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1"
}

# Track last seen state
LAST_CHAT_HASH=""
LAST_STATE_HASH=""

monitor_copilot_state() {
  # Check VS Code global state for Copilot data
  local state_file="$VSCODE_STATE_DIR/globalStorage/storage.json"

  if [[ -f "$state_file" ]]; then
    local current_hash=$(grep -o '"github\.copilot[^}]*}' "$state_file" 2>/dev/null | shasum -a 256 | cut -d' ' -f1)

    if [[ -n "$current_hash" && "$current_hash" != "$LAST_STATE_HASH" ]]; then
      success "Copilot state update detected"
      grep -o '"github\.copilot[^}]*}' "$state_file" | jq '.' 2>/dev/null || true
      LAST_STATE_HASH="$current_hash"

      # Trigger PO1 refactor check
      log "Checking for PO1 refactor instructions..."
      check_for_refactor_instructions
    fi
  fi
}

monitor_workspace_settings() {
  local workspace_settings="$WORKSPACE_DIR/.vscode/settings.json"

  if [[ -f "$workspace_settings" ]]; then
    local copilot_settings=$(jq '.["github.copilot"]' "$workspace_settings" 2>/dev/null || echo "{}")

    if [[ "$copilot_settings" != "{}" ]]; then
      log "Copilot workspace settings:"
      echo "$copilot_settings" | jq '.'
    fi
  fi
}

check_for_refactor_instructions() {
  # Check if Copilot has provided refactoring instructions
  local chat_history=$(find "$VSCODE_STATE_DIR/globalStorage" -name "*.json" -type f -exec grep -l "refactor\|PO1\|Redis\|queue" {} \; 2>/dev/null || true)

  if [[ -n "$chat_history" ]]; then
    success "Found potential refactor instructions in: $chat_history"

    # Extract and log key refactor terms
    for file in $chat_history; do
      log "Analyzing: $file"
      jq '. | select(. != null)' "$file" 2>/dev/null | grep -i "redis\|queue\|refactor\|po1" || true
    done
  fi
}

monitor_copilot_logs() {
  # Monitor Copilot extension logs
  local log_dir="$HOME/Library/Application Support/Code/logs"

  if [[ -d "$log_dir" ]]; then
    # Find most recent log directory
    local latest_log=$(find "$log_dir" -type d -name "202*" | sort -r | head -1)

    if [[ -n "$latest_log" ]]; then
      # Check for Copilot activity in last 60 seconds
      local recent_activity=$(find "$latest_log" -name "*copilot*" -type f -mmin -1 2>/dev/null || true)

      if [[ -n "$recent_activity" ]]; then
        success "Recent Copilot activity detected"
        for log_file in $recent_activity; do
          log "Active log: $(basename "$log_file")"
          tail -5 "$log_file" 2>/dev/null | grep -i "error\|warn\|refactor\|suggestion" || true
        done
      fi
    fi
  fi
}

extract_copilot_suggestions() {
  # Try to extract Copilot suggestions from workspace state
  local workspace_state="$VSCODE_STATE_DIR/workspaceStorage"

  if [[ -d "$workspace_state" ]]; then
    # Find workspace-specific Copilot data
    local copilot_data=$(find "$workspace_state" -name "*copilot*" -o -name "*chat*" | head -5)

    for data_file in $copilot_data; do
      if [[ -f "$data_file" ]]; then
        log "Checking: $(basename "$data_file")"

        # Try to parse as JSON
        if jq empty "$data_file" 2>/dev/null; then
          jq '.' "$data_file" | grep -i "redis\|queue\|refactor" || true
        fi
      fi
    done
  fi
}

main() {
  log "Copilot JSON Monitor started (PID $$)"
  log "Monitoring: Copilot Chat + Extension State"
  log "Check interval: ${CHECK_INTERVAL}s"
  log "Workspace: $WORKSPACE_DIR"
  success "✅ Copilot monitor ready"

  while true; do
    monitor_copilot_state
    monitor_workspace_settings
    monitor_copilot_logs
    extract_copilot_suggestions

    sleep "$CHECK_INTERVAL"
  done
}

main "$@"
