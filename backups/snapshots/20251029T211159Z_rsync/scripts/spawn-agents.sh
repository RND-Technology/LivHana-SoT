#!/bin/bash
set -e
echo "🤖 Spawning 5 agents..."
tmux new-session -d -s planning "node agents/planning.js" 2>/dev/null || echo "⚠️  Planning agent already running"
tmux new-session -d -s research "node agents/research.js" 2>/dev/null || echo "⚠️  Research agent already running"
tmux new-session -d -s artifact "node agents/artifact.js" 2>/dev/null || echo "⚠️  Artifact agent already running"
tmux new-session -d -s execmon "node agents/execmon.js" 2>/dev/null || echo "⚠️  Execmon agent already running"
tmux new-session -d -s qa "node agents/qa.js" 2>/dev/null || echo "⚠️  QA agent already running"
sleep 2
echo "✅ Agent spawn complete"
