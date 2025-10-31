#!/usr/bin/env bash
# scripts/start-voice-visualizer.sh
# Launches the voice mode visualizer inside tmux for continuous monitoring.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SESSION_NAME="${SESSION_NAME:-voice-visualizer}"
SCRIPT_PATH="${SCRIPT_PATH:-$ROOT/scripts/voice_mode_visualizer.py}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
RESTART="${RESTART:-false}"

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is required to run the voice visualizer" >&2
  exit 1
fi

if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "Visualizer script missing: $SCRIPT_PATH" >&2
  exit 1
fi

if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  if [[ "$RESTART" == "true" ]]; then
    tmux kill-session -t "$SESSION_NAME"
  else
    echo "Session '$SESSION_NAME' already running"
    exit 0
  fi
fi

tmux new-session -d -s "$SESSION_NAME" "cd \"$ROOT\" && $PYTHON_BIN \"$SCRIPT_PATH\""
echo "✅ Voice visualizer session '$SESSION_NAME' started"
echo "   Attach with: tmux attach -t $SESSION_NAME"
