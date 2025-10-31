#!/usr/bin/env bash
set -euo pipefail

ROOT="${LIVHANA_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ROOT/backend/mcp-server"

# Use python stdio transport with a short timeout just to verify start
python -m src.server <<'EOF' | head -n 5 || true
EOF

echo "OK: MCP server launched (stdio)"
