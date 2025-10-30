#!/usr/bin/env bash
# scripts/guards/validate_pid_file.sh
# Validate and clean stale PID files to prevent orchestration errors.

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

write_pid() {
  local pid="$1"
  local pid_file="$2"
  local process_name="${3:-}"

  if ! kill -0 "$pid" 2>/dev/null; then
    error "Cannot write PID $pid to $pid_file - process not running"
    return 1
  fi

  if [[ -n "$process_name" ]]; then
    if ! ps -p "$pid" -o comm= | grep -q "$process_name"; then
      error "PID $pid is not a $process_name process"
      return 1
    fi
  fi

  # Atomic write
  echo "$pid" > "${pid_file}.tmp"
  mv "${pid_file}.tmp" "$pid_file"
  chmod 600 "$pid_file"

  success "PID $pid written to $pid_file"
}

read_pid() {
  local pid_file="$1"
  local process_name="${2:-}"

  if [[ ! -f "$pid_file" ]]; then
    return 1
  fi

  local pid
  pid=$(cat "$pid_file")

  if ! [[ "$pid" =~ ^[0-9]+$ ]]; then
    warning "Invalid PID in $pid_file: $pid. Cleaning up."
    rm -f "$pid_file"
    return 1
  fi

  if ! kill -0 "$pid" 2>/dev/null; then
    warning "Stale PID file $pid_file (PID $pid not running). Cleaning up."
    rm -f "$pid_file"
    return 1
  fi

  if [[ -n "$process_name" ]]; then
    if ! ps -p "$pid" -o comm= | grep -q "$process_name"; then
      warning "PID $pid in $pid_file is not a $process_name process. Cleaning up."
      rm -f "$pid_file"
      return 1
    fi
  fi

  echo "$pid"
}

cleanup_pid_file() {
  local pid_file="$1"

  if [[ -f "$pid_file" ]]; then
    local pid
    if pid=$(cat "$pid_file" 2>/dev/null); then
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi
}

# Allow sourcing without execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  error "This script is a library and should be sourced, not executed directly."
  exit 1
fi
