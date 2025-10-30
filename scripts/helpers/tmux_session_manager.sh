#!/usr/bin/env bash
# scripts/helpers/tmux_session_manager.sh
# Provides functions for robustly managing tmux sessions.

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

# --- Constants ---
readonly SESSION_PREFIX="livhana"

# --- Functions ---

# Creates a standardized session name
# Usage: _get_session_name <service_name>
_get_session_name() {
    local service_name="$1"
    echo "${SESSION_PREFIX}_${service_name}"
}

# Checks if a tmux session exists
# Usage: session_exists <service_name>
session_exists() {
    local session_name
    session_name=$(_get_session_name "$1")
    tmux has-session -t "$session_name" 2>/dev/null
}

# Starts a new, detached tmux session for a service
# Usage: start_session <service_name> <command_to_run...>
start_session() {
    local service_name="$1"
    shift
    local cmd=("$@")
    local session_name
    session_name=$(_get_session_name "$service_name")

    if ! command -v tmux &> /dev/null; then
        error "tmux is not installed. Cannot manage sessions."
        return 1
    fi

    if session_exists "$service_name"; then
        warning "Session '$session_name' already exists. Skipping creation."
        return 0
    fi

    info "Starting new tmux session '$session_name'..."
    tmux new-session -d -s "$session_name" "${cmd[@]}"
    
    # Verify session started
    if ! session_exists "$service_name"; then
        error "Failed to start tmux session '$session_name'."
        return 1
    fi
    success "Session '$session_name' started successfully."
}

# Stops a tmux session
# Usage: stop_session <service_name>
stop_session() {
    local service_name="$1"
    local session_name
    session_name=$(_get_session_name "$service_name")

    if ! session_exists "$service_name"; then
        warning "Session '$session_name' does not exist. Nothing to stop."
        return 0
    fi

    info "Stopping tmux session '$session_name'..."
    tmux kill-session -t "$session_name"
    success "Session '$session_name' stopped."
}

# Lists all managed tmux sessions
# Usage: list_sessions
list_sessions() {
    tmux list-sessions | grep "^${SESSION_PREFIX}_" || echo "No managed sessions found."
}

# Stops all managed tmux sessions
# Usage: stop_all_sessions
stop_all_sessions() {
    info "Stopping all managed tmux sessions..."
    local sessions
    sessions=$(tmux list-sessions -F '#S' | grep "^${SESSION_PREFIX}_" || true)
    
    if [[ -z "$sessions" ]]; then
        success "No managed sessions to stop."
        return 0
    fi

    for session in $sessions; do
        stop_session "${session#${SESSION_PREFIX}_}"
    done
}

# Allow sourcing without execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  error "This script is a library and should be sourced, not executed directly."
  exit 1
fi
