#!/usr/bin/env bash
#
# Verifies Tier‑1 zero-warning boot end-to-end:
#   1. Cleans stale backups + optional tmux sessions/processes
#   2. Runs claude-tier1 with ALLOW_TEXT_ONLY + SUPPRESS_OPTIONAL_WARNINGS
#   3. Confirms agent JSON + tmux sessions + liv-voice
#   4. Curl-backoff on integration-service /health
#   5. Scans logs/scripts for leaked secrets (rg → grep fallback)
#   6. Optional npm test suite
#
# Exits non-zero on ANY failure. Designed for macOS + CI (no GNU timeout).

set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
RUN_TESTS=1
CLEAN_START=1

usage() {
  cat <<'EOF'
Usage: claude-tier1-verify.sh [--skip-tests] [--keep-sessions]

Ensures Tier-1 boot is warning-free, agents and integration-service are healthy,
liv-voice is attachable, and logs contain no obvious secrets.

  --skip-tests     Skip the npm test run
  --keep-sessions  Preserve existing tmux sessions instead of killing them
  -h, --help       Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-tests) RUN_TESTS=0 ;;
    --keep-sessions) CLEAN_START=0 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown flag: $1" >&2; usage; exit 64 ;;
  esac
  shift
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$REPO_ROOT/logs"
STATUS_DIR="$REPO_ROOT/tmp/agent_status"
BACKUP_GLOB="$REPO_ROOT/scripts/claude_tier1_boot.sh.backup_*"
BOOT_LOG="$LOG_DIR/claude-tier1.boot.$(date +%Y%m%d%H%M%S).log"
HEALTH_URL="http://localhost:3005/health"
AGENT_SESSIONS=(planning research artifact execmon qa)
VOICE_SESSION="liv-voice"

log()        { printf '[%s] %-5s %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$1" "$2" >&2; }
log_info()   { log INFO "$*"; }
log_ok()     { log OK "$*"; }
log_warn()   { log WARN "$*"; }
log_fail()   { log FAIL "$*"; exit 1; }

cleanup_on_err() {
  local code=$?
  set +e
  log_fail "Verifier aborted with exit code ${code}. Inspect ${BOOT_LOG} for details."
}
trap cleanup_on_err ERR
trap 'log_warn "Interrupted"; exit 130' INT TERM

require_cmd() {
  local missing=()
  for cmd in "$@"; do
    command -v "$cmd" >/dev/null 2>&1 || missing+=("$cmd")
  done
  if (( ${#missing[@]} )); then
    log_fail "Missing required tools: ${missing[*]}"
  fi
}
require_cmd claude-tier1 tmux jq curl npm

mkdir -p "$LOG_DIR"

if compgen -G "$BACKUP_GLOB" >/dev/null 2>&1; then
  log_info "Removing stale claude_tier1_boot backups"
  rm -f "$BACKUP_GLOB"
fi

if command -v rg >/dev/null 2>&1; then
  SECRET_SCAN_CMD=(rg -n --hidden -S -g '!node_modules' -e '(sk|ghp|pplx)[A-Za-z0-9]{8,}|xox[baprs]-[A-Za-z0-9-]+' "$LOG_DIR" "$REPO_ROOT/backend" "$REPO_ROOT/scripts")
else
  log_warn "ripgrep not found; falling back to grep (slower)"
  SECRET_SCAN_CMD=(grep -RInE '(sk|ghp|pplx)[A-Za-z0-9]{8,}|xox[baprs]-[A-Za-z0-9-]+' "$LOG_DIR" "$REPO_ROOT/backend" "$REPO_ROOT/scripts")
fi

clean_environment() {
  log_info "Killing stray integration-service processes"
  pkill -f 'lightspeed-bigquery' 2>/dev/null || true

  if [[ $CLEAN_START -eq 1 ]]; then
    log_info "Resetting tmux (kill-server)"
    tmux kill-server 2>/dev/null || true
  else
    log_info "Keeping existing tmux sessions (per --keep-sessions)"
  fi
}
clean_environment

run_boot() {
  log_info "Booting Tier-1 with ALLOW_TEXT_ONLY+SUPPRESS_OPTIONAL_WARNINGS"
  if ! ALLOW_TEXT_ONLY=1 SUPPRESS_OPTIONAL_WARNINGS=1 claude-tier1 | tee "$BOOT_LOG"; then
    log_fail "claude-tier1 exited non-zero (see ${BOOT_LOG})"
  fi
  if grep -Eq '\[(WARN(ING)?|ERROR)\]' "$BOOT_LOG"; then
    log_fail "Boot emitted WARN/ERROR lines (see ${BOOT_LOG})"
  fi
  log_ok "Boot completed with zero warnings"
}
run_boot

verify_agent_status() {
  local agent="$1"
  local status_file="$STATUS_DIR/${agent}.status.json"

  [[ -f "$status_file" ]] || log_fail "Missing status file for ${agent}"

  jq -e '
    (.status | ascii_downcase) as $status
    | ($status == "running" or $status == "active")
    and (has("started_at") and (.started_at | type == "string"))
    and (has("finished_at") and (.finished_at == null or (.finished_at | type == "string")))
    and (has("updated_at") and (.updated_at | type == "string"))
  ' "$status_file" >/dev/null || log_fail "Invalid status JSON for ${agent}"

  if ! tmux has-session -t "$agent" 2>/dev/null; then
    log_fail "tmux session missing for agent ${agent}"
  fi
  log_ok "Agent ${agent}: tmux + status OK"
}

for agent in "${AGENT_SESSIONS[@]}"; do
  verify_agent_status "$agent"
done

if ! tmux has-session -t "$VOICE_SESSION" 2>/dev/null; then
  log_fail "Voice session '${VOICE_SESSION}' missing"
fi
log_ok "Voice session '${VOICE_SESSION}' is running"

health_check() {
  log_info "Checking integration-service health (${HEALTH_URL})"
  for delay in 1 2 3 5 8 13; do
    if HEALTH_PAYLOAD="$(curl -sf "$HEALTH_URL")"; then
      log_ok "Integration health endpoint reachable"
      echo "$HEALTH_PAYLOAD" | jq -e '
        (.status // "" | ascii_downcase) == "healthy"
        and (.lightspeed_connected // false)
      ' >/dev/null || log_fail "Health payload not healthy: ${HEALTH_PAYLOAD}"
      return
    fi
    log_warn "Health probe failed; retrying in ${delay}s"
    sleep "$delay"
  done
  log_fail "Integration-service health endpoint unreachable after retries"
}
health_check

log_info "Scanning logs/scripts for leaked secrets"
if "${SECRET_SCAN_CMD[@]}" | grep -vE '(\*\*\*REDACTED\*\*\*|<concealed by 1Password>)' >/dev/null; then
  log_fail "Potential secret detected (see scan output above)"
fi
log_ok "Secret scan clean"

if [[ $RUN_TESTS -eq 1 ]]; then
  log_info "Running npm test suite"
  (cd "$REPO_ROOT" && npm test)
  log_ok "npm test passed"
else
  log_warn "npm test skipped (--skip-tests)"
fi

log_ok "Tier-1 verification complete — system is GREEN"
echo "Boot log saved at: ${BOOT_LOG}"

