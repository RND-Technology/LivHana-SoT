#!/usr/bin/env bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

pushd "$PROJECT_ROOT/infra/docker" >/dev/null || exit

docker compose -f docker-compose.voice-mode.yml down

echo "Voice mode stack stopped."

popd >/dev/null || exit

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
