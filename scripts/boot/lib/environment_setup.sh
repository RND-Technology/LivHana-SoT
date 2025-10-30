#!/usr/bin/env bash
# Environment Setup Module (Principle of One)

setup_environment() {
  echo "⚙️  Setting up environment..."

  # M4 Max Optimization (2025)
  export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=128 --expose-gc"
  export UV_THREADPOOL_SIZE=8

  # LivHana Protocol
  export LIV_MODE="voice-plan-only"
  export LIV_DEPLOYMENT_AUTHORITY="human-only"
  export LIV_COORDINATION_METHOD="task-tool-only"

  # Redis (LivHana Standard: 256MB)
  export REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
  export REDIS_PORT="${REDIS_PORT:-6379}"
  export REDIS_MAX_MEMORY="256mb"
  export REDIS_MAXMEMORY_POLICY="allkeys-lru"

  # Ports
  export VOICE_STT_PORT=2022
  export VOICE_TTS_PORT=8880
  export REASONING_GATEWAY_PORT=4002
  export ORCHESTRATION_PORT=4010

  # BullMQ
  export BULLMQ_CONCURRENCY=5
  export QUEUE_NAME="voice-mode-reasoning-jobs"

  validate_prerequisites
  echo "✅ Environment configured"
}

validate_prerequisites() {
  local missing=()
  for cmd in node redis-server tmux jq curl; do
    command -v "$cmd" >/dev/null || missing+=("$cmd")
  done

  [[ ${#missing[@]} -gt 0 ]] && { echo "❌ Missing: ${missing[*]}"; exit 1; }

  # Verify ARM64 Node.js
  [[ "$(node -p 'process.arch')" == "arm64" ]] || echo "⚠️  Node.js not ARM64"
}
