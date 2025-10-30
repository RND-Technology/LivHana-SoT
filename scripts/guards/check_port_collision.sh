#!/usr/bin/env bash
# scripts/guards/check_port_collision.sh
# Detects if a port is already in use before attempting to bind a service.

set -euo pipefail

# Load logging helpers if they exist
if [[ -f "${ROOT:-.}/scripts/helpers/logging.sh" ]]; then
  # shellcheck source=scripts/helpers/logging.sh
  source "${ROOT:-.}/scripts/helpers/logging.sh"
else
  info() { echo "[INFO] $*"; }
  warning() { echo "[WARN] $*" >&2; }
  error() { echo "[ERROR] $*" >&2; }
  success() { echo "[SUCCESS] $*"; }
fi

check_port_collision() {
  local port="$1"
  local service_name="$2"

  if ! [[ "$port" =~ ^[0-9]+$ ]]; then
    error "Invalid port specified for $service_name: '$port'"
    return 1
  fi

  if lsof -ti :"$port" >/dev/null 2>&1; then
    local existing_pid
    existing_pid=$(lsof -ti :"$port")
    local existing_cmd
    existing_cmd=$(ps -p "$existing_pid" -o comm= 2>/dev/null || echo "unknown")

    error "Port $port already in use by '$existing_cmd' (PID $existing_pid)."
    error "Cannot start '$service_name'."
    error ""
    error "Options:"
    error "  1. Kill the existing process: kill $existing_pid"
    sanitized_name=$(echo "$service_name" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
    error "  2. Use a different port: export ${sanitized_name}_PORT=<other-port>"
    return 1
  fi

  success "Port $port is available for $service_name."
  return 0
}

# Allow sourcing without execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  error "This script is a library and should be sourced, not executed directly."
  exit 1
fi
