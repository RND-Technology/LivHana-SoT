#!/usr/bin/env bash
# Validate agent wrote status JSON within timeout
# Fixes V12: No health check for agents

set -euo pipefail

validate_agent_started() {
  local agent="$1"
  local timeout="${2:-10}"

  # Use absolute path (get ROOT from script location)
  local root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  local status_file="$root/tmp/agent_status/${agent}.status.json"
  local elapsed=0
  
  while [[ $elapsed -lt $timeout ]]; do
    if [[ -f "$status_file" ]] && [[ -s "$status_file" ]]; then
      # Validate JSON structure
      if command -v jq >/dev/null 2>&1; then
        if jq -e '.agent == "'$agent'"' "$status_file" >/dev/null 2>&1; then
          return 0
        fi
      else
        # Fallback: check if agent name is in file
        if grep -q "\"agent\": *\"$agent\"" "$status_file" 2>/dev/null; then
          return 0
        fi
      fi
    fi
    sleep 1
    ((elapsed++))
  done
  
  return 1
}

if [[ "${BASH_SOURCE[0]:-$0}" == "${0}" ]]; then
  validate_agent_started "$@"
fi

