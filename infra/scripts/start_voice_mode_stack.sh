#!/usr/bin/env bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

pushd "$PROJECT_ROOT/infra/docker" >/dev/null

docker compose -f docker-compose.voice-mode.yml up --build -d

echo "Voice mode stack started."

popd >/dev/null

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
