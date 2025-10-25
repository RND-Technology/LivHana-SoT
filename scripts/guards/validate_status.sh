#!/usr/bin/env bash
# Validate PO1 status JSON files under tmp/agent_status.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STATUS_DIR="$ROOT/tmp/agent_status"

if [[ ! -d "$STATUS_DIR" ]]; then
  echo "Status directory missing: $STATUS_DIR" >&2
  exit 1
fi

python3 - "$STATUS_DIR" <<'PY'
import json, os, sys

status_dir = sys.argv[1]

required_keys = {"agent", "phase", "status", "started_at", "finished_at"}
allowed_status_files = [
    "voice.status.json",
    "planning.status.json",
    "research.status.json",
    "artifact.status.json",
    "execmon.status.json",
    "qa.status.json",
    "ops.status.json",
    "funnel.ready",
    "codex_tasks.json",
]

# Files that don't follow agent status schema
skip_validation = {"codex_tasks.json", "funnel.ready"}

problems = []

for entry in sorted(os.listdir(status_dir)):
    path = os.path.join(status_dir, entry)

    if entry not in allowed_status_files:
        continue  # skip auxiliary files

    if entry in skip_validation:
        continue  # skip non-agent files

    with open(path, "r", encoding="utf-8") as fh:
        try:
            data = json.load(fh)
        except json.JSONDecodeError as exc:
            problems.append(f"{entry}: invalid JSON ({exc})")
            continue

    missing = required_keys - data.keys()
    if missing:
        problems.append(f"{entry}: missing keys {sorted(missing)}")

if problems:
    for line in problems:
        print(f"[PO1][STATUS] {line}", file=sys.stderr)
    sys.exit(1)
PY
