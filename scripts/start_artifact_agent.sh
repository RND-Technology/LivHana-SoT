#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATUS_DIR="$ROOT/tmp/agent_status"
LOG_DIR="$ROOT/logs/agents"
mkdir -p "$STATUS_DIR" "$LOG_DIR"

AGENT="artifact"
SESSION="artifact"
STATUS_FILE="$STATUS_DIR/${AGENT}.status.json"
LOG_FILE="$LOG_DIR/${AGENT}_$(date +%Y%m%d_%H%M%S).log"

write_status() {
  local status="$1"; shift || true
  local notes="$*"
  cat <<JSON | bash "$ROOT/scripts/guards/atomic_write.sh" "$STATUS_FILE"
{
  "agent": "${AGENT}",
  "phase": "startup",
  "status": "${status}",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "finished_at": "",
  "artifacts": ["${LOG_FILE}"],
  "notes": "${notes}"
}
JSON
}

write_status "starting" "initializing ${AGENT}"

if ! command -v tmux >/dev/null 2>&1; then
  write_status "blocked" "tmux missing; brew install tmux"
  exit 0
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  write_status "running" "existing tmux session"
  exit 0
fi

tmux new-session -d -s "$SESSION" -n console "bash -lc 'echo [$(date -u +%FT%TZ)] ${AGENT} agent started >> \"$LOG_FILE\"; tail -f \"$LOG_FILE\"'" >/dev/null 2>&1 || {
  write_status "blocked" "failed to start tmux session"
  exit 0
}

write_status "running" "tmux session created"
exit 0

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATUS_DIR="$ROOT/tmp/agent_status"
LOG_DIR="$ROOT/logs/artifact"
SESSION_NAME="artifact"

mkdir -p "$STATUS_DIR" "$LOG_DIR"
LOG_FILE="$LOG_DIR/artifact_$(date +%Y%m%d_%H%M%S).log"
STATUS_FILE="$STATUS_DIR/artifact.status.json"

write_status() {
  local status="$1"; local phase="$2"
  python3 - <<PY
import json, os, time
path=os.environ.get('STATUS_FILE')
os.makedirs(os.path.dirname(path), exist_ok=True)
data={"agent":"artifact","phase":"${phase}","status":"${status}","started_at":time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),"finished_at":""}
with open(path,'w',encoding='utf-8') as fh: json.dump(data, fh, indent=2)
PY
}

finalize_status() {
  python3 - <<PY
import json, os, time
p=os.environ.get('STATUS_FILE')
with open(p,'r+',encoding='utf-8') as fh:
  d=json.load(fh); d['finished_at']=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()); fh.seek(0); json.dump(d, fh, indent=2); fh.truncate()
PY
}

trap 'write_status "blocked" "error"; finalize_status' ERR

write_status "starting" "init"

if command -v tmux >/dev/null 2>&1; then
  if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux new-session -d -s "$SESSION_NAME" -n console "echo '[artifact] running'; tail -f '$LOG_FILE'"
  fi
fi

write_status "running" "ready"
echo "Artifacts agent initialized (tmux=${SESSION_NAME})"

