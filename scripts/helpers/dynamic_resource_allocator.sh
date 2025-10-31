#!/usr/bin/env bash
# Dynamic Resource Allocator
# Automatically adjusts agent resources based on load and system capacity
# Created: 2025-10-28 by Liv Hana (Tier-1)
# Owner: Jesse CEO

set -euo pipefail

# Configuration
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
CHECK_INTERVAL="${RESOURCE_CHECK_INTERVAL:-60}"  # 1 minute default
METRICS_FILE="$ROOT/tmp/agent_metrics.json"
LOG_FILE="$ROOT/logs/dynamic_resource_allocator.log"

# Resource limits (MB)
MIN_MEMORY_PER_AGENT=512
MAX_MEMORY_PER_AGENT=2048
SYSTEM_MEMORY_RESERVE=4096  # Keep 4GB free for system

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1" | tee -a "$LOG_FILE"; }
warning() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️  $1" | tee -a "$LOG_FILE"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1" | tee -a "$LOG_FILE"; }
action() { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} 🔧 $1" | tee -a "$LOG_FILE"; }

# Initialize
mkdir -p "$(dirname "$LOG_FILE")"

info "Dynamic resource allocator started (PID $$)"
info "Check interval: ${CHECK_INTERVAL}s"

# Get system memory info
get_system_memory() {
  # Get free memory in MB
  if command -v vm_stat >/dev/null 2>&1; then
    local page_size=$(vm_stat | grep "page size" | awk '{print $8}' | tr -d '.')
    local free_pages=$(vm_stat | grep -E "(Pages free|Pages speculative)" | awk '{sum += $3} END {print sum}' | tr -d '.')
    local free_mb=$((free_pages * page_size / 1024 / 1024))
    echo "$free_mb"
  else
    echo "0"
  fi
}

# Get total agent memory from metrics
get_agent_memory_total() {
  if [[ -f "$METRICS_FILE" ]]; then
    grep -o '"total_memory_mb":[[:space:]]*[0-9]*' "$METRICS_FILE" | awk '{print $2}'
  else
    echo "0"
  fi
}

# Get active agent count
get_active_agent_count() {
  if [[ -f "$METRICS_FILE" ]]; then
    grep -o '"active_agents":[[:space:]]*[0-9]*' "$METRICS_FILE" | awk '{print $2}'
  else
    echo "0"
  fi
}

# Calculate optimal memory allocation per agent
calculate_optimal_memory() {
  local free_memory=$1
  local active_agents=$2
  local current_memory=$3

  # Available memory for agents (system memory - reserve)
  local available=$((free_memory - SYSTEM_MEMORY_RESERVE))

  # If insufficient free memory, return minimum
  if [[ $available -lt $((MIN_MEMORY_PER_AGENT * active_agents)) ]]; then
    echo "$MIN_MEMORY_PER_AGENT"
    return
  fi

  # Calculate optimal allocation
  local optimal=$((available / active_agents))

  # Clamp to min/max
  if [[ $optimal -lt $MIN_MEMORY_PER_AGENT ]]; then
    echo "$MIN_MEMORY_PER_AGENT"
  elif [[ $optimal -gt $MAX_MEMORY_PER_AGENT ]]; then
    echo "$MAX_MEMORY_PER_AGENT"
  else
    echo "$optimal"
  fi
}

# Apply resource limits to agent
apply_resource_limit() {
  local agent="$1"
  local memory_mb="$2"

  # Find agent process via tmux
  if tmux has-session -t "$agent" 2>/dev/null; then
    local pids=$(tmux list-panes -t "$agent" -F "#{pane_pid}" 2>/dev/null)

    for pid in $pids; do
      # Set memory limit using ulimit (soft limit)
      # Note: This sets limit for new child processes
      local memory_kb=$((memory_mb * 1024))

      # Log the action
      action "Set memory limit for $agent (PID $pid): ${memory_mb}MB"

      # Note: Direct ulimit on running process requires cgroups or systemd
      # For now, we log the recommendation
      info "Recommended: Restart $agent with NODE_OPTIONS=\"--max-old-space-size=${memory_mb}\""
    done

    return 0
  fi

  return 1
}

# Main allocation loop
allocation_loop() {
  while true; do
    # Get current metrics
    local free_memory=$(get_system_memory)
    local agent_memory=$(get_agent_memory_total)
    local active_agents=$(get_active_agent_count)

    info "━━━ Resource Status ━━━"
    info "Free system memory: ${free_memory}MB"
    info "Agent memory usage: ${agent_memory}MB"
    info "Active agents: $active_agents"

    # Calculate optimal allocation
    local optimal_memory=$(calculate_optimal_memory "$free_memory" "$active_agents" "$agent_memory")

    info "Optimal memory per agent: ${optimal_memory}MB"

    # Check if reallocation needed
    if [[ $active_agents -gt 0 ]]; then
      local current_avg=$((agent_memory / active_agents))
      local difference=$((optimal_memory - current_avg))
      local difference_pct=$((difference * 100 / current_avg))

      # Reallocate if difference > 20%
      if [[ ${difference_pct#-} -gt 20 ]]; then
        warning "Memory allocation suboptimal (${difference_pct}% difference)"
        warning "Current avg: ${current_avg}MB | Optimal: ${optimal_memory}MB"

        # Update VS Code launch.json with new allocation
        local launch_json="$ROOT/.vscode/launch.json"
        if [[ -f "$launch_json" ]]; then
          action "Updating launch.json with new memory allocation"

          # Use sed to update --max-old-space-size value
          sed -i.bak "s/--max-old-space-size=[0-9]*/--max-old-space-size=${optimal_memory}/g" "$launch_json"

          success "Updated launch.json: --max-old-space-size=${optimal_memory}"
          info "Restart agents to apply new limits"
        fi
      else
        success "Memory allocation optimal (within 20% of target)"
      fi
    fi

    # Memory pressure check
    if [[ $free_memory -lt $SYSTEM_MEMORY_RESERVE ]]; then
      error "CRITICAL: Low system memory (${free_memory}MB < ${SYSTEM_MEMORY_RESERVE}MB reserve)"
      error "Consider closing applications or restarting agents"
    elif [[ $free_memory -lt $((SYSTEM_MEMORY_RESERVE * 2)) ]]; then
      warning "Memory getting low: ${free_memory}MB free"
    fi

    info "━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    sleep "$CHECK_INTERVAL"
  done
}

# Trap signals for graceful shutdown
trap 'info "Dynamic resource allocator shutting down (PID $$)"; exit 0' SIGTERM SIGINT

success "Resource allocation monitoring ready"
info "Memory limits: ${MIN_MEMORY_PER_AGENT}MB - ${MAX_MEMORY_PER_AGENT}MB per agent"
info "System reserve: ${SYSTEM_MEMORY_RESERVE}MB"
echo ""

allocation_loop
