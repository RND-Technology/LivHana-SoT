#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

pushd "$PROJECT_ROOT/infra/docker" >/dev/null

docker compose -f docker-compose.voice-mode.yml down

echo "Voice mode stack stopped."

popd >/dev/null

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

# Optimized: 2025-10-02
