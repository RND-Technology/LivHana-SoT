#!/usr/bin/env bash
# Ensure PO1 directory structure and seed defaults.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STATUS_DIR="$ROOT/tmp/agent_status"
CI_LOG_DIR="$ROOT/logs/ci"
RESEARCH_LOG_DIR="$ROOT/logs/research"
QA_LOG_DIR="$ROOT/logs/qa"
OPS_LOG_DIR="$ROOT/logs/ops"
BLUEPRINT="$ROOT/docs/authority_startup_blueprint.md"
FUNNEL="$ROOT/.claude/TIER1_FUNNEL_AUTHORITY.md"
INDEX="$ROOT/docs/index.md"
TEMPLATE_DIR="$ROOT/templates/agent_status"

mkdir -p "$STATUS_DIR" "$CI_LOG_DIR" "$RESEARCH_LOG_DIR" "$QA_LOG_DIR" "$OPS_LOG_DIR" "$TEMPLATE_DIR"

if [[ ! -f "$BLUEPRINT" ]]; then
  echo "PO1 blueprint missing: $BLUEPRINT" >&2
  exit 1
fi

if [[ ! -f "$FUNNEL" ]]; then
  echo "Tier-1 funnel authority doc missing: $FUNNEL" >&2
  exit 1
fi

if ! grep -q "authority_startup_blueprint.md" "$INDEX"; then
  echo "docs/index.md is missing link to authority_startup_blueprint.md" >&2
  exit 1
fi

# Seed codex_tasks.json if missing
CODEX_TASKS="$STATUS_DIR/codex_tasks.json"
if [[ ! -f "$CODEX_TASKS" ]]; then
  python3 - "$CODEX_TASKS" "$TEMPLATE_DIR/codex_tasks.template.json" <<'PY'
import json, os, shutil, sys

target, template = sys.argv[1:3]
os.makedirs(os.path.dirname(target), exist_ok=True)
with open(template, "r", encoding="utf-8") as fh:
    data = json.load(fh)
with open(target, "w", encoding="utf-8") as fh:
    json.dump(data, fh, indent=2)
    fh.write("\n")
PY
fi

echo "[PO1] Structure validation complete."
