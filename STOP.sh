#!/usr/bin/env bash
# LivHana System of Truth - Graceful Shutdown (Principle of One)
# Marine Corps Precision: Leave no process behind
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$ROOT_DIR/scripts/boot/lib/instance_lock.sh"
source "$ROOT_DIR/scripts/boot/lib/service_management.sh"
source "$ROOT_DIR/scripts/boot/lib/agent_management.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  echo -e "${BLUE}[$(date -u +%Y-%m-%dT%H:%M:%SZ)]${NC} $*" >&2
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}" >&2
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}" >&2
}

log_error() {
  echo -e "${RED}❌ $1${NC}" >&2
}

# Check if we're the instance owner
check_instance_ownership() {
  local lock_file="$ROOT_DIR/.claude/instance_lock.json"

  if [[ ! -f "$lock_file" ]]; then
    log_warning "No instance lock found - system may not be running"
    return 0
  fi

  local lock_pid=$(jq -r '.pid // empty' "$lock_file" 2>/dev/null)
  local lock_user=$(jq -r '.user // empty' "$lock_file" 2>/dev/null)

  if [[ "$lock_user" != "$USER" ]]; then
    log_error "Instance lock owned by different user: $lock_user (current: $USER)"
    log_error "Cannot shutdown - wrong user"
    exit 1
  fi

  if [[ -n "$lock_pid" ]] && [[ "$lock_pid" != "$$" ]]; then
    if kill -0 "$lock_pid" 2>/dev/null; then
      log_warning "Different LivHana instance running (PID $lock_pid)"
      log_warning "This shutdown may not be complete"
    fi
  fi
}

# Stop all tmux sessions gracefully
stop_tmux_sessions() {
  log "Stopping tmux sessions..."

  local sessions=("voice-service" "reasoning-gateway" "orchestration" "planning" "research" "artifact" "execmon" "qa")
  local stopped=0

  for session in "${sessions[@]}"; do
    if tmux has-session -t "$session" 2>/dev/null; then
      log "  Stopping $session..."
      tmux send-keys -t "$session" C-c 2>/dev/null || true
      sleep 2

      # Force kill if still running
      if tmux has-session -t "$session" 2>/dev/null; then
        tmux kill-session -t "$session" 2>/dev/null || true
        log_warning "  Force killed $session"
      else
        log_success "  Stopped $session"
        ((stopped++))
      fi
    fi
  done

  log_success "Stopped $stopped/7 tmux sessions"
}

# Stop Copilot Round-Robin service
stop_copilot_roundrobin() {
  log "Stopping Copilot Round-Robin..."

  if [[ -f "$ROOT_DIR/tmp/copilot_roundrobin.pid" ]]; then
    local pid=$(cat "$ROOT_DIR/tmp/copilot_roundrobin.pid" 2>/dev/null)
    
    if [[ -n "$pid" ]] && ps -p "$pid" >/dev/null 2>&1; then
      log "  Stopping Copilot Round-Robin (PID: $pid)..."
      kill -TERM "$pid" 2>/dev/null || true
      sleep 2

      if ps -p "$pid" >/dev/null 2>&1; then
        kill -9 "$pid" 2>/dev/null || true
        log_warning "  Force killed Copilot Round-Robin"
      else
        log_success "  Stopped Copilot Round-Robin"
      fi
    fi

    rm -f "$ROOT_DIR/tmp/copilot_roundrobin.pid"
  else
    # Fallback: try to find and kill by process name
    local pids=$(pgrep -f "copilot_roundrobin.cjs" 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
      for pid in $pids; do
        log "  Stopping Copilot Round-Robin (PID: $pid)..."
        kill -TERM "$pid" 2>/dev/null || true
        sleep 1
        if ps -p "$pid" >/dev/null 2>&1; then
          kill -9 "$pid" 2>/dev/null || true
          log_warning "  Force killed Copilot Round-Robin"
        else
          log_success "  Stopped Copilot Round-Robin"
        fi
      done
    else
      log "  Copilot Round-Robin not running"
    fi
  fi
}

# Stop Docker services
stop_docker_services() {
  log "Stopping Docker services..."

  if command -v docker-compose >/dev/null 2>&1; then
    if [[ -f "$ROOT_DIR/docker-compose.yml" ]]; then
      log "  Stopping docker-compose services..."
      cd "$ROOT_DIR"
      docker-compose down --remove-orphans 2>/dev/null || log_warning "  docker-compose down failed"
      log_success "  Docker services stopped"
    else
      log "  No docker-compose.yml found"
    fi
  else
    log "  docker-compose not available"
  fi

  # Also try docker compose (newer syntax)
  if command -v docker >/dev/null 2>&1; then
    if docker compose ls 2>/dev/null | grep -q LivHana; then
      log "  Stopping with 'docker compose'..."
      cd "$ROOT_DIR"
      docker compose down --remove-orphans 2>/dev/null || log_warning "  docker compose down failed"
    fi
  fi
}

# Drain Redis queues before shutdown
drain_redis_queues() {
  log "Draining Redis queues..."

  # Check if Redis is running
  if ! redis-cli -p "${REDIS_PORT:-6379}" ping >/dev/null 2>&1; then
    log "  Redis not running, skipping queue drain"
    return 0
  fi

  # Get queue depths
  local queue_name="voice-mode-reasoning-jobs"
  local queue_depth=$(redis-cli -p "${REDIS_PORT:-6379}" llen "bull:${queue_name}:wait" 2>/dev/null || echo "0")

  if [[ $queue_depth -gt 0 ]]; then
    log "  Found $queue_depth jobs in $queue_name queue"
    log "  Waiting for jobs to complete (max 30s)..."

    local wait_time=0
    local max_wait=30

    while [[ $queue_depth -gt 0 ]] && [[ $wait_time -lt $max_wait ]]; do
      sleep 2
      wait_time=$((wait_time + 2))
      queue_depth=$(redis-cli -p "${REDIS_PORT:-6379}" llen "bull:${queue_name}:wait" 2>/dev/null || echo "0")
    done

    if [[ $queue_depth -gt 0 ]]; then
      log_warning "  $queue_depth jobs remain after ${max_wait}s (continuing anyway)"
    else
      log_success "  All jobs processed"
    fi
  else
    log "  No pending jobs in queues"
  fi
}

# Stop Redis server
stop_redis() {
  log "Stopping Redis..."

  # Drain queues first
  drain_redis_queues

  # Get ALL Redis PIDs on port 6379
  local redis_pids=$(lsof -ti :"${REDIS_PORT:-6379}" 2>/dev/null)

  if [[ -n "$redis_pids" ]]; then
    local count=0
    for redis_pid in $redis_pids; do
      log "  Stopping Redis (PID $redis_pid)..."
      kill -TERM "$redis_pid" 2>/dev/null || true
      ((count++))
    done

    sleep 2

    # Force kill any survivors
    for redis_pid in $redis_pids; do
      if kill -0 "$redis_pid" 2>/dev/null; then
        kill -9 "$redis_pid" 2>/dev/null || true
        log_warning "  Force killed Redis (PID $redis_pid)"
      fi
    done

    log_success "  Redis stopped ($count instances)"
  else
    log "  Redis not running"
  fi
}

# Kill watchdog processes
kill_watchdogs() {
  log "Checking for watchdog processes..."

  local watchdogs=("claude_tier1_auto_save" "tier1_supervisor" "auto_save_local" "voice_services_watch" "agent_status_realtime_logger" "op_secret_guard")
  local killed=0

  for watchdog in "${watchdogs[@]}"; do
    # Find processes by name
    local pids=$(pgrep -f "$watchdog" 2>/dev/null || true)

    for pid in $pids; do
      # Skip our own process
      if [[ "$pid" == "$$" ]]; then
        continue
      fi

      log "  Killing $watchdog (PID $pid)..."
      kill -TERM "$pid" 2>/dev/null || true
      sleep 1

      if kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid" 2>/dev/null || true
        log_warning "  Force killed $watchdog"
      else
        log_success "  Stopped $watchdog"
        ((killed++))
      fi
    done
  done

  if [[ $killed -gt 0 ]]; then
    log_success "Killed $killed watchdog processes"
  else
    log "  No watchdog processes found"
  fi
}

# Clean up temporary files and locks
cleanup_files() {
  log "Cleaning up files..."

  # Remove lock files
  local lock_files=(
    "$ROOT_DIR/tmp/claude_tier1_auto_save.lock"
    "$ROOT_DIR/tmp/tier1_supervisor.lock"
    "$ROOT_DIR/tmp/auto_save_local.lock"
    "$ROOT_DIR/tmp/copilot_roundrobin.pid"
    "$ROOT_DIR/.claude/instance_lock.json"
  )

  for lock in "${lock_files[@]}"; do
    if [[ -f "$lock" ]]; then
      rm -f "$lock"
      log "  Removed $(basename "$lock")"
    fi
  done

  # Remove voice auto-launch flag
  if [[ -f "$ROOT_DIR/tmp/voice_auto_launch.flag" ]]; then
    rm -f "$ROOT_DIR/tmp/voice_auto_launch.flag"
    log "  Removed voice auto-launch flag"
  fi

  # Clean up any remaining temp files older than 1 hour
  if [[ -d "$ROOT_DIR/tmp" ]]; then
    find "$ROOT_DIR/tmp" -name "*.tmp" -mmin +60 -delete 2>/dev/null || true
    log "  Cleaned old temp files"
  fi

  log_success "File cleanup complete"
}

# Final validation - ensure everything is stopped
final_validation() {
  log "Final validation..."

  local issues=0

  # Check tmux sessions
  local tmux_count
  tmux_count=$(tmux ls 2>/dev/null | grep -cE "^(reasoning-gateway|orchestration|planning|research|artifact|execmon|qa):" || echo "0")
  tmux_count=$(echo "$tmux_count" | tr -d ' \n\r')
  if [[ ${tmux_count} -gt 0 ]]; then
    log_warning "  $tmux_count tmux sessions still running"
    ((issues++))
  else
    log_success "  No tmux sessions running"
  fi

  # Check Redis (wait 1s for port release)
  sleep 1
  if lsof -i :"${REDIS_PORT:-6379}" >/dev/null 2>&1; then
    log_warning "  Redis still running on port ${REDIS_PORT:-6379}"
    ((issues++))
  else
    log_success "  Redis stopped"
  fi

  # Check Docker containers
  if command -v docker >/dev/null 2>&1; then
    local container_count=$(docker ps --filter "label=com.docker.compose.project=LivHana-SoT" --format "{{.Names}}" 2>/dev/null | wc -l | tr -d ' ')
    if [[ $container_count -gt 0 ]]; then
      log_warning "  $container_count Docker containers still running"
      ((issues++))
    else
      log_success "  No Docker containers running"
    fi
  fi

  # Check for orphaned processes
  local orphaned=$(pgrep -f "LivHana\|voice-service\|reasoning-gateway\|orchestration" 2>/dev/null | grep -v "$$" || true)
  if [[ -n "$orphaned" ]]; then
    log_warning "  Found orphaned processes: $orphaned"
    ((issues++))
  fi

  if [[ $issues -eq 0 ]]; then
    log_success "Shutdown validation passed"
    return 0
  else
    log_warning "Shutdown validation found $issues issues"
    return 1
  fi
}

# Force cleanup (nuclear option)
force_cleanup() {
  log_warning "Performing force cleanup..."

  # Kill all processes matching LivHana patterns
  local patterns=("LivHana" "voice-service" "reasoning-gateway" "orchestration" "planning.*agent" "research.*agent" "artifact.*agent" "execmon.*agent" "qa.*agent")
  local killed=0

  for pattern in "${patterns[@]}"; do
    local pids=$(pgrep -f "$pattern" 2>/dev/null | grep -v "$$" || true)
    for pid in $pids; do
      kill -9 "$pid" 2>/dev/null || true
      ((killed++))
    done
  done

  # Force stop all Docker containers
  if command -v docker >/dev/null 2>&1; then
    docker stop $(docker ps -q --filter "label=com.docker.compose.project=LivHana-SoT" 2>/dev/null) 2>/dev/null || true
    docker rm $(docker ps -aq --filter "label=com.docker.compose.project=LivHana-SoT" 2>/dev/null) 2>/dev/null || true
  fi

  # Force kill Redis
  local redis_pid=$(lsof -ti :"${REDIS_PORT:-6379}" 2>/dev/null | head -1)
  if [[ -n "$redis_pid" ]]; then
    kill -9 "$redis_pid" 2>/dev/null || true
  fi

  # Clean all locks
  find "$ROOT_DIR" -name "*.lock" -type f -delete 2>/dev/null || true
  rm -f "$ROOT_DIR/.claude/instance_lock.json" 2>/dev/null || true

  log_success "Force cleanup complete (killed $killed processes)"
}

main() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🛑 LivHana System of Truth - Graceful Shutdown"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Check ownership first
  check_instance_ownership

  # Graceful shutdown sequence
  stop_tmux_sessions
  stop_copilot_roundrobin
  stop_docker_services
  stop_redis
  kill_watchdogs
  cleanup_files

  echo ""

  # Final validation
  if ! final_validation; then
    echo ""
    log_warning "Graceful shutdown incomplete - attempting force cleanup..."
    force_cleanup

    echo ""
    final_validation
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_success "LivHana shutdown complete"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Handle command line arguments
case "${1:-}" in
  --force)
    log_warning "Force mode enabled"
    # Skip graceful attempts, go straight to force
    force_cleanup
    cleanup_files
    final_validation
    ;;
  --help|-h)
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --force    Skip graceful shutdown, force kill all processes"
    echo "  --help     Show this help message"
    echo ""
    echo "Graceful shutdown sequence:"
    echo "  1. Stop tmux sessions (SIGTERM, then SIGKILL)"
    echo "  2. Stop Docker services"
    echo "  3. Stop Redis server"
    echo "  4. Kill watchdog processes"
    echo "  5. Clean up lock files and temp data"
    echo "  6. Validate complete shutdown"
    exit 0
    ;;
  *)
    main "$@"
    ;;
esac
