#!/usr/bin/env bash
# Monitors agent status files, triggers QA when execution updates, and
# produces funnel.ready before voice requests Jesse's approval.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STATUS_DIR="$ROOT/tmp/agent_status"
QA_SCRIPT="$ROOT/scripts/start_qa_agent.sh"
LOG_DIR="$ROOT/logs/watchers"
LOG_FILE="$LOG_DIR/voice_orchestrator_watch_$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$STATUS_DIR" "$LOG_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

checksum() {
  python3 - "$1" <<'PY'
import hashlib, sys

path = sys.argv[1]
if not path or path == "None":
    print("0")
    sys.exit()

with open(path, "rb") as fh:
    data = fh.read()
print(hashlib.sha256(data).hexdigest())
PY
}

read_status_field() {
  local file="$1"
  local field="$2"
  python3 - "$file" "$field" <<'PY'
import json, sys

path, field = sys.argv[1:3]
try:
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    value = data.get(field)
    if value is None:
        print("")
    else:
        print(value)
except FileNotFoundError:
    print("")
except json.JSONDecodeError:
    print("")
PY
}

trigger_qa() {
  log "Execution status changed – triggering QA subagent."
  bash "$QA_SCRIPT" --auto >> "$LOG_FILE" 2>&1 || log "QA subagent reported non-zero exit."
}

last_exec_checksum="none"
qa_alert_sent="false"

log "Voice orchestrator watcher started."

while true; do
  EXEC_STATUS="$STATUS_DIR/exec.status.json"
  QA_STATUS="$STATUS_DIR/qa.status.json"
  RESEARCH_STATUS="$STATUS_DIR/research.status.json"
  FUNNEL_READY="$STATUS_DIR/funnel.ready"

  if [[ -f "$EXEC_STATUS" ]]; then
    current_exec_checksum="$(checksum "$EXEC_STATUS")"
    if [[ "$current_exec_checksum" != "$last_exec_checksum" ]]; then
      last_exec_checksum="$current_exec_checksum"
      trigger_qa
    fi
  fi

  exec_state="$(read_status_field "$EXEC_STATUS" status)"
  qa_state="$(read_status_field "$QA_STATUS" status)"
  research_state="$(read_status_field "$RESEARCH_STATUS" status)"

  if [[ "$exec_state" == "passed" && "$qa_state" == "passed" && "$qa_alert_sent" == "false" ]]; then
    bash "$ROOT/scripts/agents/alert_ops.sh" "QA_PASSED" "QA passed, ready for deployment window." >> "$LOG_FILE" 2>&1 || true
    qa_alert_sent="true"
  fi

  if [[ "$exec_state" == "passed" && "$qa_state" == "passed" && "$research_state" == "passed" ]]; then
    if [[ ! -f "$FUNNEL_READY" ]]; then
      log "Research, Execution, QA all passed – producing funnel.ready signal."
      python3 - "$FUNNEL_READY" <<'PY'
import json, os, sys, time

target = sys.argv[1]
data = {
    "agent": "voice-watcher",
    "phase": "funnel-ready",
    "status": "ready",
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
}
os.makedirs(os.path.dirname(target), exist_ok=True)
with open(target, "w", encoding="utf-8") as fh:
    json.dump(data, fh, indent=2)
PY
      log "funnel.ready written."
    fi
  fi

  if [[ "$qa_state" != "passed" ]]; then
    qa_alert_sent="false"
  fi

  sleep 2
done
