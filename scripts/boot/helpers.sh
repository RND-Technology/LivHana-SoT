#!/usr/bin/env bash
# 🛡️ Tier-1 Boot Helpers
# Liv Hana | Security & Reliability Utilities

set -euo pipefail

# Retry helper with exponential backoff
retry_with_backoff() {
  local max_attempts="${1:-3}"
  local delay="${2:-1}"
  local command="${@:3}"
  local attempt=1
  
  while [[ $attempt -le $max_attempts ]]; do
    if eval "$command"; then
      return 0
    fi
    
    if [[ $attempt -lt $max_attempts ]]; then
      local wait_time=$((delay * (2 ** (attempt - 1))))
      echo "Attempt $attempt failed. Retrying in ${wait_time}s..."
      sleep $wait_time
    fi
    
    attempt=$((attempt + 1))
  done
  
  echo "Failed after $max_attempts attempts"
  return 1
}

# Validate agent status within timeout
validate_agent_status() {
  local agent_name="${1:-}"
  local timeout="${2:-10}"
  local status_file="${3:-}"
  
  if [[ -z "$agent_name" ]] || [[ -z "$status_file" ]]; then
    echo "validate_agent_status: missing required parameters"
    return 1
  fi
  
  local elapsed=0
  while [[ ! -f "$status_file" ]] && [[ $elapsed -lt $timeout ]]; do
    sleep 1
    elapsed=$((elapsed + 1))
  done
  
  if [[ ! -f "$status_file" ]]; then
    echo "Agent $agent_name status file not found after ${timeout}s"
    return 1
  fi
  
  if grep -q '"status":\s*"active"' "$status_file" 2>/dev/null; then
    echo "Agent $agent_name validated"
    return 0
  else
    echo "Agent $agent_name status invalid"
    return 1
  fi
}

# Secure environment variable checker
check_env_var() {
  local var_name="${1:-}"
  
  if [[ -z "$var_name" ]]; then
    echo "check_env_var: missing variable name"
    return 1
  fi
  
  if [[ -z "${!var_name:-}" ]]; then
    echo "Environment variable $var_name is not set"
    return 1
  fi
  
  return 0
}

export -f retry_with_backoff
export -f validate_agent_status
export -f check_env_var
