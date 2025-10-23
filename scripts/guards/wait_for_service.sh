#!/usr/bin/env bash
# Wait for service to become available with retry logic
# Fixes V1: Race condition in service startup vs health check

set -euo pipefail

wait_for_service() {
  local port="$1"
  local max_wait="${2:-30}"
  local interval="${3:-2}"
  local elapsed=0
  
  while [[ $elapsed -lt $max_wait ]]; do
    # Check if port is listening
    if lsof -ti :"$port" >/dev/null 2>&1; then
      # Check if health endpoint responds
      if curl -sf "http://localhost:$port/health" >/dev/null 2>&1; then
        return 0
      fi
    fi
    sleep "$interval"
    ((elapsed += interval))
  done
  
  return 1
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  wait_for_service "$@"
fi

