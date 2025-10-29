#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
STATUS_DIR="$ROOT/tmp/agent_status"
LOG_DIR="$ROOT/logs/agents"
mkdir -p "$STATUS_DIR" "$LOG_DIR"

AGENT="artifact"
SESSION="artifact"
STATUS_FILE="$STATUS_DIR/${AGENT}.status.json"
LOG_FILE="$LOG_DIR/${AGENT}_$(date +%Y%m%d_%H%M%S).log"
AUDIT_LOG="$LOG_DIR/${AGENT}_audit.jsonl"
REGISTRY_FILE="$ROOT/tmp/agent_status/shared/agent_registry.json"
COORD_LOG="$ROOT/tmp/agent_status/shared/coordination_log.jsonl"
CODEX_DIR="$ROOT/tmp/agent_status/codex_tasks"
AGENT_SCRIPT="$ROOT/scripts/agents/artifact_agent.py"

PORT="${ARTIFACT_AGENT_PORT:-5013}"
POLL_INTERVAL="${ARTIFACT_AGENT_POLL_INTERVAL:-15}"

write_status() {
  local status="$1"; shift || true
  local notes="$*"
  local started_at
  started_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  local json_content
  json_content=$(cat <<JSON
{
  "agent": "${AGENT}",
  "phase": "startup",
  "status": "${status}",
  "started_at": "${started_at}",
  "updated_at": "${started_at}",
  "finished_at": "",
  "http_port": ${PORT},
  "artifacts": ["${LOG_FILE}", "${AUDIT_LOG}"],
  "notes": "${notes}"
}
JSON
)
  if [[ -f "$ROOT/scripts/guards/atomic_write.sh" ]]; then
    echo "$json_content" | bash "$ROOT/scripts/guards/atomic_write.sh" "$STATUS_FILE"
  else
    echo "$json_content" > "$STATUS_FILE"
  fi
}

write_status "starting" "initializing ${AGENT}"

if ! command -v tmux >/dev/null 2>&1; then
  write_status "blocked" "tmux missing; install tmux"
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  write_status "blocked" "python3 missing"
  exit 1
fi

if [[ ! -f "$AGENT_SCRIPT" ]]; then
  write_status "blocked" "artifact agent script missing"
  exit 1
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  write_status "running" "existing tmux session"
  exit 0
fi

mkdir -p "$CODEX_DIR"

( cd "$ROOT" && tmux new-session -d -s "$SESSION" -n agent \
  python3 "$AGENT_SCRIPT" \
    --status-file "$STATUS_FILE" \
    --log-file "$LOG_FILE" \
    --audit-log "$AUDIT_LOG" \
    --registry-file "$REGISTRY_FILE" \
    --coord-log "$COORD_LOG" \
    --codex-dir "$CODEX_DIR" \
    --poll-interval "$POLL_INTERVAL" \
    --port "$PORT" ) >/dev/null 2>&1 || {
  write_status "blocked" "failed to start tmux session"
  exit 1
}

if [[ -f "$ROOT/scripts/guards/validate_agent_started.sh" ]]; then
  if ! bash "$ROOT/scripts/guards/validate_agent_started.sh" "$AGENT" 25 >/dev/null 2>&1; then
    write_status "degraded" "agent status JSON not initialized in time"
  fi
fi

HEALTH_URL="http://127.0.0.1:${PORT}/health"
for attempt in {1..10}; do
  if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
    echo "Artifact agent started (tmux session: ${SESSION}). Health: ${HEALTH_URL}"
    echo "Logs: $LOG_FILE"
    exit 0
  fi
  sleep 1
done

write_status "degraded" "health endpoint not responding on port ${PORT}"
echo "Artifact agent launched but health endpoint not reachable (port ${PORT})."
exit 1

