#!/usr/bin/env bash
# Tier 1 Option A boot script for Codex + Sonnet shared session
# Restores environment, credentials, and monitoring so work can resume at full power.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="$ROOT_DIR/.claude"
LOG_FILE="$CLAUDE_DIR/SESSION_PROGRESS.md"

banner() {
  printf '\n========== %s ==========' "$1"
  printf '\n'
}

banner "Tier 1 Option A Boot"

# 0. Verify 1Password session
if ! op whoami >/dev/null 2>&1; then
  echo "🔐 1Password session missing. Run 'op signin' (Touch ID) before continuing." >&2
  exit 1
fi

echo "✅ 1Password session active"

cd "$ROOT_DIR"

# 1. Export required env vars
export GOOGLE_APPLICATION_CREDENTIALS="$ROOT_DIR/backend/integration-service/.bigquery-key.json"
export GCP_PROJECT_ID="reggieanddrodispensary"
export SQUARE_ACCESS_TOKEN=$(gcloud secrets versions access latest --secret=SQUARE_ACCESS_TOKEN --project="$GCP_PROJECT_ID")
export SQUARE_LOCATION_ID=$(gcloud secrets versions access latest --secret=SQUARE_LOCATION_ID --project="$GCP_PROJECT_ID")

echo "✅ Environment primed (GCP project: $GCP_PROJECT_ID)"

# 2. Launch session-progress watchdog (if not already running)
if pgrep -f "watch-session-progress.sh" >/dev/null; then
  echo "⏱  Session watchdog already running"
else
  "$CLAUDE_DIR/watch-session-progress.sh" 300 60 \
    | tee -a "$CLAUDE_DIR/session_watch.log" \
    >/dev/null 2>&1 &
  echo "⏱  Session watchdog started (PID $!)"
fi

# 3. Snapshot current state
banner "System Snapshot"
./START.sh status || true
cat "$CLAUDE_DIR/STATE.md" || echo "⚠️  STATE.md missing"
git status --short

# 4. Reminder checklist
banner "Next Steps"
cat <<'CHECKLIST'
1. In a new terminal split, tail the session log:
   tail -f .claude/SESSION_PROGRESS.md
2. Execute boot reads:
   cat .claude/LEARNING_LEDGER.md
   cat .claude/VERIFICATION_REQUIRED.md
   cat .claude/HONESTY_CONSTRAINTS.md
   cat .claude/ULTIMATE_FUSION_STARTUP.md
   cat .claude/COMMANDER_CODEX_ORDERS.md
   cat .claude/STATE.md
3. Run `scripts/run_full_sweep.sh` and log results (<5 min rule).
4. Resume the highest priority mission (Square ingestion → Lightspeed automation → Scheduler deployment).
CHECKLIST

banner "Boot Complete"
