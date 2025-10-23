#!/usr/bin/env bash
# CODEX Agent Boot Script - Cursor Environment
# Initializes CODEX for inter-agent communication with Liv Hana

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "========================================="
echo "CODEX AGENT BOOT SEQUENCE"
echo "========================================="
echo "Timestamp: $TIMESTAMP"
echo "Root: $ROOT"
echo

# Check if agent_status exists
if [[ ! -d "$ROOT/tmp/agent_status" ]]; then
  echo "ERROR: Inter-agent communication not initialized"
  echo "Run: bash scripts/claude_tier1_boot.sh first"
  exit 1
fi

# Initialize CODEX heartbeat
cat > "$ROOT/tmp/agent_status/codex_status/heartbeat.json" <<EOF
{
  "agent_name": "codex-cursor",
  "status": "active",
  "last_heartbeat": "$TIMESTAMP",
  "uptime_seconds": 0,
  "current_capacity": 0.8,
  "active_tasks": [],
  "health": {
    "cpu_ok": true,
    "memory_ok": true,
    "disk_ok": true,
    "last_error": null
  }
}
EOF

# Update agent registry
python3 -c "
import json
from pathlib import Path
import os

registry_path = Path('$ROOT/tmp/agent_status/shared/agent_registry.json')
registry = json.loads(registry_path.read_text())
registry['agents']['codex-cursor']['status'] = 'active'
registry['agents']['codex-cursor']['last_seen'] = '$TIMESTAMP'
registry['agents']['codex-cursor']['pid'] = os.getppid()
registry['updated_at'] = '$TIMESTAMP'
registry_path.write_text(json.dumps(registry, indent=2))
"

# Log to coordination log
echo '{"timestamp":"'$TIMESTAMP'","event_type":"agent_ready","source_agent":"codex-cursor","message":"CODEX agent initialized and ready for tasks"}' >> "$ROOT/tmp/agent_status/shared/coordination_log.jsonl"

echo "✅ CODEX agent initialized"
echo "✅ Heartbeat active"
echo "✅ Ready to receive tasks from Liv Hana"
echo
echo "Protocol: .claude/INTER_AGENT_COMMUNICATION_PROTOCOL.md"
echo "========================================="
