#!/usr/bin/env bash
# Copilot Chat Monitor - Real-time monitoring of GitHub Copilot Chat JSON
# Monitors commandEmbeddings.json and alerts on updates
# Created: 2025-10-29 by Liv Hana (Tier-1)
# Owner: Jesse CEO

set -euo pipefail

# Configuration
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)"
COPILOT_CHAT_DIR="$HOME/Library/Application Support/Code/User/globalStorage/github.copilot-chat"
COPILOT_JSON="$COPILOT_CHAT_DIR/commandEmbeddings.json"
CHECK_INTERVAL="${COPILOT_WATCH_INTERVAL:-5}"  # 5 seconds default
LOG="$ROOT/logs/copilot_chat_monitor.log"
STATE_FILE="$ROOT/tmp/copilot_chat_watch.state"
NOTIFICATION_SCRIPT="$ROOT/scripts/notifications/copilot_update_handler.sh"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1" | tee -a "$LOG"; }
warning() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️  $1" | tee -a "$LOG"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1" | tee -a "$LOG"; }
copilot_update() { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} 🤖 COPILOT: $1" | tee -a "$LOG"; }

# Initialize
mkdir -p "$(dirname "$LOG")" "$(dirname "$STATE_FILE")"

info "Copilot Chat Monitor started (PID $$)"
info "Monitoring: $COPILOT_JSON"
info "Check interval: ${CHECK_INTERVAL}s"

# Initialize state
initialize_state() {
  if [[ -f "$COPILOT_JSON" ]]; then
    hash=$(shasum -a 256 "$COPILOT_JSON" 2>/dev/null | awk '{print $1}')
    size=$(stat -f%z "$COPILOT_JSON" 2>/dev/null || stat -c%s "$COPILOT_JSON" 2>/dev/null)
    mtime=$(stat -f%m "$COPILOT_JSON" 2>/dev/null || stat -c%Y "$COPILOT_JSON" 2>/dev/null)
    echo "$hash|$size|$mtime" > "$STATE_FILE"
    success "Initialized state: hash=${hash:0:8}, size=$size bytes"
  else
    error "Copilot JSON not found: $COPILOT_JSON"
    exit 1
  fi
}

# Extract latest Copilot message
extract_latest_message() {
  if [[ -f "$COPILOT_JSON" ]]; then
    # Try to extract the last few messages (assuming JSON structure)
    # This is a best-effort extraction - adjust based on actual structure
    tail -500 "$COPILOT_JSON" | grep -o '"message"[^}]*' | tail -5 || echo "No messages found"
  fi
}

# Check for changes
check_for_updates() {
  if [[ ! -f "$COPILOT_JSON" ]]; then
    return 1
  fi

  current_hash=$(shasum -a 256 "$COPILOT_JSON" 2>/dev/null | awk '{print $1}')
  current_size=$(stat -f%z "$COPILOT_JSON" 2>/dev/null || stat -c%s "$COPILOT_JSON" 2>/dev/null)
  current_mtime=$(stat -f%m "$COPILOT_JSON" 2>/dev/null || stat -c%Y "$COPILOT_JSON" 2>/dev/null)

  stored_state=$(cat "$STATE_FILE" 2>/dev/null || echo "|||")
  stored_hash=$(echo "$stored_state" | cut -d'|' -f1)
  stored_size=$(echo "$stored_state" | cut -d'|' -f2)
  stored_mtime=$(echo "$stored_state" | cut -d'|' -f3)

  if [[ "$current_hash" != "$stored_hash" ]] || [[ "$current_mtime" != "$stored_mtime" ]]; then
    size_delta=$((current_size - stored_size))

    copilot_update "UPDATE DETECTED"
    info "  Hash: ${stored_hash:0:8} → ${current_hash:0:8}"
    info "  Size: $stored_size → $current_size bytes (Δ $size_delta)"
    info "  Modified: $(date -r "$current_mtime" '+%Y-%m-%d %H:%M:%S')"

    # Update state
    echo "$current_hash|$current_size|$current_mtime" > "$STATE_FILE"

    # Extract and display latest message
    copilot_update "Extracting latest messages..."
    extract_latest_message | while read -r line; do
      copilot_update "  $line"
    done

    # Trigger notification handler if it exists
    if [[ -x "$NOTIFICATION_SCRIPT" ]]; then
      "$NOTIFICATION_SCRIPT" "copilot_update" "$current_hash" "$size_delta" &
    fi

    return 0
  fi

  return 1
}

# Main watch loop
watch_loop() {
  while true; do
    sleep "$CHECK_INTERVAL"

    if check_for_updates; then
      success "Copilot chat updated - state synchronized"
    fi
  done
}

# Trap signals for graceful shutdown
trap 'info "Copilot Chat Monitor shutting down (PID $$)"; exit 0' SIGTERM SIGINT

# Start monitor
if [[ ! -f "$STATE_FILE" ]] || [[ ! -s "$STATE_FILE" ]]; then
  initialize_state
fi

success "Copilot Chat Monitor ready"
info "Will check for updates every ${CHECK_INTERVAL}s"
echo ""

watch_loop
