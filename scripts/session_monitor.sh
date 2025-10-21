#!/usr/bin/env bash
#
# Session Monitoring Script (Background)
# Continuously monitors session health and alerts on issues
#
# Usage:
#   ./session_monitor.sh &
#   MONITOR_PID=$!
#   # ... do work ...
#   kill $MONITOR_PID
#
# Or use with nohup:
#   nohup ./session_monitor.sh > /tmp/session_monitor.log 2>&1 &
#
# Monitors:
#   - Voice mode services (every 60s)
#   - Token usage tracking
#   - Agent count (should be ≤1 unless coordinated)
#   - Disk space
#   - Memory pressure
#   - Stale tasks (in_progress > 30min)
#
# Alerts by writing to alert file and stdout

set -euo pipefail

# Configuration
CHECK_INTERVAL=60  # seconds between checks
MAX_AGENTS=1
TOKEN_WARNING_THRESHOLD=0.8  # 80% of budget
TOKEN_BUDGET=200000

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Find repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Alert file
ALERT_FILE="$REPO_ROOT/.claude/session_alerts.log"
mkdir -p "$(dirname "$ALERT_FILE")"

# State tracking
LAST_ALERT_TIME=0
ALERT_COOLDOWN=300  # Don't repeat same alert within 5 min

log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1"
}

log_warn() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $1" >> "$ALERT_FILE"
}

log_alert() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] [ALERT] $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ALERT] $1" >> "$ALERT_FILE"

    # Trigger notification if available
    if command -v osascript >/dev/null 2>&1; then
        osascript -e "display notification \"$1\" with title \"LivHana Session Alert\"" 2>/dev/null || true
    fi
}

check_services() {
    # Check Whisper STT
    if ! nc -z 127.0.0.1 2022 2>/dev/null; then
        log_alert "Whisper STT service down (port 2022)"
        return 1
    fi

    # Check Kokoro TTS
    if ! nc -z 127.0.0.1 8880 2>/dev/null; then
        log_warn "Kokoro TTS service down (port 8880)"
    fi

    return 0
}

check_agent_count() {
    local agent_tracking_dir="$REPO_ROOT/.claude/agent_tracking"
    if [[ ! -d "$agent_tracking_dir" ]]; then
        return 0
    fi

    local active_count=$(find "$agent_tracking_dir" -name "*.active" 2>/dev/null | wc -l | xargs)

    if [[ $active_count -gt $MAX_AGENTS ]]; then
        log_alert "Too many agents running: $active_count (max $MAX_AGENTS)"
        for agent_file in "$agent_tracking_dir"/*.active; do
            if [[ -f "$agent_file" ]]; then
                local agent_id=$(basename "$agent_file" .active)
                local task=$(grep "TASK:" "$agent_file" | cut -d: -f2- || echo "unknown")
                log_info "  Agent: $agent_id - $task"
            fi
        done
        return 1
    elif [[ $active_count -gt 0 ]]; then
        log_info "Agents running: $active_count"
    fi

    return 0
}

check_disk_space() {
    local disk_avail_gb
    if [[ "$(uname)" == "Darwin" ]]; then
        disk_avail_gb=$(df -g "$REPO_ROOT" | awk 'NR==2 {print $4}')
    else
        disk_avail_gb=$(df -BG "$REPO_ROOT" | awk 'NR==2 {print $4}' | tr -d 'G')
    fi

    if [[ $disk_avail_gb -lt 2 ]]; then
        log_alert "Critically low disk space: ${disk_avail_gb}GB"
        return 1
    elif [[ $disk_avail_gb -lt 5 ]]; then
        log_warn "Low disk space: ${disk_avail_gb}GB"
    fi

    return 0
}

check_memory() {
    if [[ "$(uname)" == "Darwin" ]]; then
        if command -v vm_stat >/dev/null 2>&1; then
            local free_pages=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
            if [[ $free_pages -gt 0 ]]; then
                local free_gb=$((free_pages * 4096 / 1024 / 1024 / 1024))
                if [[ $free_gb -lt 1 ]]; then
                    log_alert "Critically low memory: ~${free_gb}GB free"
                    return 1
                elif [[ $free_gb -lt 2 ]]; then
                    log_warn "Low memory: ~${free_gb}GB free"
                fi
            fi
        fi
    fi
    return 0
}

check_stale_tasks() {
    # This would require reading Claude's todo list
    # For now, just check for stale agent tracking files
    local agent_tracking_dir="$REPO_ROOT/.claude/agent_tracking"
    if [[ ! -d "$agent_tracking_dir" ]]; then
        return 0
    fi

    local now=$(date +%s)
    local stale_threshold=$((30 * 60))  # 30 minutes

    for agent_file in "$agent_tracking_dir"/*.active; do
        if [[ -f "$agent_file" ]]; then
            local file_age
            if [[ "$(uname)" == "Darwin" ]]; then
                file_age=$(stat -f%m "$agent_file")
            else
                file_age=$(stat -c%Y "$agent_file")
            fi

            local age=$((now - file_age))
            if [[ $age -gt $stale_threshold ]]; then
                local agent_id=$(basename "$agent_file" .active)
                local age_min=$((age / 60))
                log_warn "Stale agent detected: $agent_id (running ${age_min} minutes)"
            fi
        fi
    done

    return 0
}

check_token_usage() {
    # Check if token tracking file exists
    local token_file="$REPO_ROOT/.claude/token_usage.json"
    if [[ ! -f "$token_file" ]]; then
        return 0
    fi

    # Parse token usage (requires jq)
    if ! command -v jq >/dev/null 2>&1; then
        return 0
    fi

    local used=$(jq -r '.used // 0' "$token_file" 2>/dev/null || echo 0)
    local budget=$(jq -r '.budget // 200000' "$token_file" 2>/dev/null || echo $TOKEN_BUDGET)

    if [[ $used -gt 0 ]] && [[ $budget -gt 0 ]]; then
        local usage_pct=$((used * 100 / budget))

        if [[ $usage_pct -ge 95 ]]; then
            log_alert "Token budget critically low: ${usage_pct}% used"
            return 1
        elif [[ $usage_pct -ge 80 ]]; then
            log_warn "Token budget warning: ${usage_pct}% used"
        fi
    fi

    return 0
}

cleanup() {
    log_info "Session monitor stopping..."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main monitoring loop
log_info "Session monitor starting..."
log_info "Check interval: ${CHECK_INTERVAL}s"
log_info "Max agents: $MAX_AGENTS"
log_info "Monitoring: services, agents, disk, memory, tokens"
echo

while true; do
    HEALTH_OK=true

    # Run all checks
    if ! check_services; then
        HEALTH_OK=false
    fi

    if ! check_agent_count; then
        HEALTH_OK=false
    fi

    if ! check_disk_space; then
        HEALTH_OK=false
    fi

    if ! check_memory; then
        HEALTH_OK=false
    fi

    check_stale_tasks  # Always run, doesn't affect health status

    if ! check_token_usage; then
        HEALTH_OK=false
    fi

    # Summary
    if [[ "$HEALTH_OK" == "true" ]]; then
        log_info "Session health: OK"
    else
        log_warn "Session health: DEGRADED - check alerts above"
    fi

    echo ""

    # Wait for next check
    sleep "$CHECK_INTERVAL"
done
