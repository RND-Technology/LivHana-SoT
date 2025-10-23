#!/usr/bin/env bash
# 🎯 QA Agent Launcher (24/7 Validation Layer)
# Liv Hana | Principle of One | Shippable Standard
# Auto-launched by Tier-1 boot sequence

set -euo pipefail

MODE="manual"
if [[ $# -gt 0 ]]; then
  case "$1" in
    --auto) MODE="auto";;
  esac
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT/logs/qa_agent"
STATE_FILE="$ROOT/tmp/qa_agent_state.json"
STATUS_FILE="$ROOT/tmp/agent_status/qa.status.json"
EXEC_STATUS="$ROOT/tmp/agent_status/exec.status.json"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RUN_LOG="$LOG_DIR/qa_run_${TIMESTAMP}.log"
STARTED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)

mkdir -p "$LOG_DIR" "$(dirname "$STATE_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$RUN_LOG"
}

log "QA run started (mode=$MODE)"

EXEC_STATUS_VALUE=""
if [[ -f "$EXEC_STATUS" ]]; then
  EXEC_STATUS_VALUE=$(python3 - "$EXEC_STATUS" <<'PY'
import json, sys
with open(sys.argv[1], "r", encoding="utf-8") as fh:
    data = json.load(fh)
print(data.get("status", "unknown"))
PY
)
else
  log "Execution status file missing; marking QA run as needs_review."
fi

RESULT_STATUS="passed"
NOTES="QA validation completed"
if [[ "$EXEC_STATUS_VALUE" != "passed" ]]; then
  RESULT_STATUS="needs_review"
  NOTES="Execution status = %s" && NOTES=$(printf "Execution status = %s" "$EXEC_STATUS_VALUE")
fi

# Update state record
cat > "$STATE_FILE" <<EOF
{
  "agent": "qa-shippable-validator",
  "session_start": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "mode": "$MODE",
  "last_run": "$STARTED_AT",
  "last_status": "$RESULT_STATUS",
  "log_dir": "$LOG_DIR"
}
EOF

FINISHED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)

cat <<EOF | bash "$ROOT/scripts/guards/atomic_write.sh" "$STATUS_FILE"
{
  "agent": "qa-shippable-validator",
  "phase": "tier1-qa",
  "status": "$RESULT_STATUS",
  "started_at": "$STARTED_AT",
  "finished_at": "$FINISHED_AT",
  "artifacts": ["$RUN_LOG"],
  "notes": "$NOTES"
}
EOF

log "QA run finished with status $RESULT_STATUS"
