#!/usr/bin/env bash
# scripts/kill-port-conflicts.sh
# Proactively clears conflicting processes on critical Tier-1 ports.

set -euo pipefail

PORT_LIST=("${PORTS_OVERRIDE[@]:-}") # allows callers to pre-populate via array
if [[ ${#PORT_LIST[@]} -eq 0 ]]; then
  IFS=' ' read -r -a PORT_LIST <<< "${PORTS:-3005 2022 8880}"
fi

GRACE_PERIOD="${GRACE_PERIOD:-2}"      # seconds to wait after SIGTERM
RETRY_LIMIT="${RETRY_LIMIT:-2}"        # number of kill -9 retries
FORCE_KILL="${FORCE_KILL:-false}"      # skip graceful attempt if true

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

kill_pid() {
  local pid="$1"
  local port="$2"

  if [[ "$FORCE_KILL" == "true" ]]; then
    log "Force killing PID $pid on port $port (SIGKILL)"
    kill -9 "$pid" 2>/dev/null || true
    return
  fi

  log "Sending SIGTERM to PID $pid on port $port"
  kill "$pid" 2>/dev/null || true
  sleep "$GRACE_PERIOD"
  if kill -0 "$pid" 2>/dev/null; then
    log "PID $pid still alive; escalating to SIGKILL"
    kill -9 "$pid" 2>/dev/null || true
  fi
}

cleanup_port() {
  local port="$1"
  local pids pid attempt

  if ! command -v lsof >/dev/null 2>&1; then
    log "lsof not found; cannot inspect port $port"
    return 1
  fi

  mapfile -t pids < <(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null | sort -u)
  if [[ ${#pids[@]} -eq 0 ]]; then
    log "Port $port already free"
    return 0
  fi

  log "Detected ${#pids[@]} process(es) on port $port: ${pids[*]}"
  for pid in "${pids[@]}"; do
    kill_pid "$pid" "$port"
  done

  attempt=0
  while (( attempt <= RETRY_LIMIT )); do
    if lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      if (( attempt == RETRY_LIMIT )); then
        log "❌ Unable to free port $port after retries"
        return 1
      fi
      log "Port $port still busy; retrying (attempt $((attempt + 1))/$RETRY_LIMIT)"
      mapfile -t pids < <(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null | sort -u)
      for pid in "${pids[@]}"; do
        log "Force killing remaining PID $pid on port $port"
        kill -9 "$pid" 2>/dev/null || true
      done
      sleep 1
    else
      log "✅ Port $port cleared"
      return 0
    fi
    ((attempt++))
  done
}

main() {
  local failures=0
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "🔧 Port conflict remediation"
  log "Target ports: ${PORT_LIST[*]}"

  for port in "${PORT_LIST[@]}"; do
    if ! cleanup_port "$port"; then
      ((failures++))
    fi
  done

  if (( failures > 0 )); then
    log "❌ Completed with $failures port(s) still occupied"
    exit 1
  fi

  log "✅ All target ports available"
}

main "$@"
