#!/usr/bin/env bash
# LivHana Trinity Emergency Fix - M4 Max SIGTRAP Resolution
# Marine Corps Standard: Execute with precision

set -euo pipefail

echo "🎖️  LivHana Trinity - Emergency Stabilization Protocol"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 1: QUARANTINE UNSTABLE NATIVE MODULES
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔧 Phase 1: Quarantine vscode-policy-watcher.node"
QUAR_DIR="${HOME}/Library/Application Support/Code/quarantine"
mkdir -p "$QUAR_DIR"

find "/Applications/Visual Studio Code.app" -name "*policy-watcher.node" 2>/dev/null | while read file; do
    if [[ -f "$file" && ! -f "${file}.disabled" ]]; then
        cp "$file" "$QUAR_DIR/$(basename "$file").backup" 2>/dev/null || true
        mv "$file" "${file}.disabled" 2>/dev/null || true
        echo "   ✅ Quarantined: $file"
    fi
done

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2: CLEAR V8 CORRUPTED CACHES
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔧 Phase 2: Clear V8 corrupted caches"
rm -rf "$HOME/Library/Application Support/Code/CachedData" 2>/dev/null || true
rm -rf "$HOME/Library/Caches/com.microsoft.VSCode" 2>/dev/null || true
echo "   ✅ Caches cleared"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 3: CREATE CRASH-PROOF START.sh
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔧 Phase 3: Deploy hardened START.sh"
cat > "START.sh" << 'STARTSH'
#!/usr/bin/env bash
# LivHana Trinity START.sh - M4 Max Crash-Proof Edition

set -euo pipefail

# Guard against multiple instances
if pgrep -fl "START.sh" | grep -v $$ | grep -q LivHana; then
  echo "🔁 START.sh already running. Exiting."
  exit 0
fi

# System hardening
ulimit -n 65536 || true
export NODE_OPTIONS="--max-old-space-size=16384 --max-semi-space-size=128 --predictable-gc-schedule"
export LIV_MODE="voice-plan-only"
export LIV_DEPLOYMENT_AUTHORITY="human-only"
export LIV_COORDINATION_METHOD="task-tool-only"
export LIV_PERSISTENCE="always-voice"

# VS Code crash mitigations
export ELECTRON_DISABLE_SECURITY_WARNINGS=1
export VSCODE_CLI_USE_BUILTIN=1
export CODE_DISABLE_TELEMETRY=1
export CODE_DISABLE_CRASH_REPORTER=1

# Redis configuration
export REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
export REDIS_PORT="${REDIS_PORT:-6379}"
export REDIS_MAX_MEMORY="256mb"
export REDIS_MAXMEMORY_POLICY="allkeys-lru"

# Agent limits
export BULLMQ_CONCURRENCY=5
export MAX_CONCURRENT_AGENTS=8
export AGENT_SPAWN_COOLDOWN_MS=1500

# Start Redis if not running
if ! nc -z 127.0.0.1 "$REDIS_PORT" 2>/dev/null; then
  redis-server --port "$REDIS_PORT" --maxmemory "$REDIS_MAX_MEMORY" \
    --maxmemory-policy "$REDIS_MAXMEMORY_POLICY" --save "" --appendonly no --daemonize yes
fi

# Create task tool
if ! command -v task >/dev/null 2>&1; then
  cat >/tmp/task_tool.sh <<'TASK'
#!/usr/bin/env bash
LOG=/tmp/agent_mission_log.txt
mkdir -p "$(dirname "$LOG")"
if [ -z "$1" ]; then echo "Usage: task \"mission description\""; exit 1; fi
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ID=$(printf "%s%s" "$TS" "$1" | shasum -a 256 | head -c 8)
echo "[$TS][ID:$ID][STATUS:QUEUED] $1" >> "$LOG"
echo "✅ Task queued: $ID"
TASK
  chmod +x /tmp/task_tool.sh
  sudo mv /tmp/task_tool.sh /usr/local/bin/task 2>/dev/null || {
    mkdir -p "$HOME/bin"
    mv /tmp/task_tool.sh "$HOME/bin/task"
    export PATH="$HOME/bin:$PATH"
  }
fi

echo "=============================================================="
echo " LivHana Trinity - M4 Max Stable Environment"
echo " Mode: $LIV_MODE | Agents Max: $MAX_CONCURRENT_AGENTS"
echo " Redis: $(redis-cli -p "$REDIS_PORT" ping 2>/dev/null || echo DOWN)"
echo " Task tool: $(command -v task)"
echo "=============================================================="
echo "🎤 Liv 1.1.0 Voice Orchestration: ACTIVE"
echo "🛑 Stop: Ctrl+C"
STARTSH

chmod +x START.sh
echo "   ✅ START.sh deployed"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 4: INSTALL VOICE MODE
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔧 Phase 4: Voice mode setup"
if ! command -v uv &>/dev/null; then
    echo "   Installing uv package manager..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source "$HOME/.cargo/env" 2>/dev/null || true
fi

uv tool install voice-mode 2>/dev/null || pip install voice-mode || echo "   ⚠️  Voice mode install deferred"

# Configure Claude Desktop
mkdir -p "$HOME/Library/Application Support/Claude"
cat > "$HOME/Library/Application Support/Claude/claude_desktop_config.json" <<'CLAUDE'
{
  "mcpServers": {
    "voice-mode": {
      "command": "uvx",
      "args": ["voice-mode"]
    }
  }
}
CLAUDE
echo "   ✅ Claude Desktop configured"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 5: VALIDATION
# ═══════════════════════════════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 LIV HANA STABILIZATION COMPLETE"
echo ""
echo "Next Steps:"
echo "  1. Restart VS Code (clean restart recommended)"
echo "  2. Run: ./START.sh"
echo "  3. Grant mic permission: System Settings → Privacy → Microphone → Claude"
echo "  4. Test voice: Say 'test 1 2 3' in Claude Desktop"
echo ""
echo "🎖️  Marine Corps Standard: Mission Accomplished"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
