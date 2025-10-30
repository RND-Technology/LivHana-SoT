#!/usr/bin/env bash
# scripts/boot/start_services.sh
# Starts all microservices in an all-or-nothing transaction with rollback on failure.

set -euo pipefail

# Assume ROOT is exported from the main boot script
ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

# Load helpers
# shellcheck source=scripts/helpers/logging.sh
source "$ROOT/scripts/helpers/logging.sh"
# shellcheck source=scripts/guards/wait_for_service.sh
source "$ROOT/scripts/guards/wait_for_service.sh"
# shellcheck source=scripts/guards/validate_pid_file.sh
source "$ROOT/scripts/guards/validate_pid_file.sh"
# shellcheck source=scripts/guards/check_port_collision.sh
source "$ROOT/scripts/guards/check_port_collision.sh"

STARTED_SERVICES=()
STARTED_PIDS=()

cleanup_on_failure() {
  error "Service startup failed - rolling back..."

  for i in "${!STARTED_SERVICES[@]}"; do
    local service="${STARTED_SERVICES[$i]}"
    local pid="${STARTED_PIDS[$i]}"

    warning "Stopping $service (PID $pid)"
    kill "$pid" 2>/dev/null || true

    local count=0
    while kill -0 "$pid" 2>/dev/null && [[ $count -lt 5 ]]; do
      sleep 0.5
      ((count++))
    done

    if kill -0 "$pid" 2>/dev/null; then
      warning "Force killing $service (PID $pid)"
      kill -9 "$pid" 2>/dev/null || true
    fi
  done

  error "Rollback complete. System left in a clean state."
  exit 1
}

trap cleanup_on_failure ERR

start_service() {
  local name="$1"
  local start_command="$2"
  local port_env_var="$3"
  local default_port="$4"
  local health_endpoint="${5:-/health}"
  local service_dir="$6"

  local port="${!port_env_var:-$default_port}"

  check_port_collision "$port" "$name" || return 1

  info "Starting $name on port $port..."
  
  local log_file="$ROOT/logs/${name}.log"
  mkdir -p "$ROOT/logs"
  touch "$log_file"
  chmod 600 "$log_file"

  # Execute start command in the service's directory
  (
    cd "$ROOT/$service_dir" && \
    eval "$start_command" >> "$log_file" 2>&1
  ) &
  local pid=$!

  if wait_for_service "$port" "$health_endpoint" 30 2 "$name"; then
    STARTED_SERVICES+=("$name")
    STARTED_PIDS+=("$pid")
    write_pid "$pid" "$ROOT/tmp/pids/${name}.pid" "node"
    success "$name started (PID $pid)"
  else
    error "$name failed to start"
    # The trap will handle cleanup
    return 1
  fi
}

start_all_services() {
    mkdir -p "$ROOT/tmp/pids"

    start_service \
      "integration-service" \
      "op run --env-file=.env.integration -- npm start" \
      "INTEGRATION_SERVICE_PORT" \
      "3005" \
      "/health" \
      "backend/integration-service"

    start_service \
      "voice-service" \
      "npm start" \
      "VOICE_SERVICE_PORT" \
      "8080" \
      "/health" \
      "backend/voice-service"

    start_service \
      "reasoning-gateway" \
      "npm start" \
      "REASONING_GATEWAY_PORT" \
      "4002" \
      "/health" \
      "backend/reasoning-gateway"

    success "All services started successfully."
    trap - ERR # Disable the trap on success
}

# Allow sourcing without execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    start_all_services
fi
