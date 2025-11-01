#!/usr/bin/env bash
# Service Management Module (Principle of One)

start_services() {
  echo "🚀 Starting services..."
  start_redis
  start_voice_service
  start_reasoning_gateway
  start_orchestration
  start_copilot_roundrobin
  start_whisper
  start_vocode
  echo "✅ Services started"
}

start_redis() {
  lsof -i :"${REDIS_PORT}" >/dev/null 2>&1 && { echo "  ℹ️  Redis running"; return; }

  redis-server --port "${REDIS_PORT}" --maxmemory "${REDIS_MAX_MEMORY}" \
    --maxmemory-policy "${REDIS_MAXMEMORY_POLICY}" --save "" --appendonly no --daemonize yes

  sleep 2
  redis-cli -p "${REDIS_PORT}" ping >/dev/null || { echo "  ❌ Redis failed"; exit 1; }
  echo "  ✅ Redis started"
}

start_reasoning_gateway() {
  tmux has-session -t reasoning-gateway 2>/dev/null && { echo "  ℹ️  Reasoning gateway running"; return; }

  tmux new-session -d -s reasoning-gateway \
    "cd backend/reasoning-gateway && NODE_ENV=production node src/index.js"

  sleep 3
  echo "  ✅ Reasoning gateway started"
}

start_orchestration() {
  tmux has-session -t orchestration 2>/dev/null && { echo "  ℹ️  Orchestration running"; return; }

  tmux new-session -d -s orchestration \
    "cd backend/orchestration-service && node dist/index.js"

  sleep 3
  echo "  ✅ Orchestration started"
}

start_copilot_roundrobin() {
  if [[ -f "${ROOT_DIR}/tmp/copilot_roundrobin.pid" ]]; then
    local pid=$(cat "${ROOT_DIR}/tmp/copilot_roundrobin.pid" 2>/dev/null)
    if ps -p "$pid" >/dev/null 2>&1; then
      echo "  ℹ️  Copilot Round-Robin running (PID: $pid)"
      return
    fi
  fi

  cd "${ROOT_DIR}"
  node scripts/integrations/copilot_roundrobin.cjs > logs/copilot_roundrobin.log 2>&1 &
  local pid=$!
  echo "$pid" > tmp/copilot_roundrobin.pid
  sleep 2

  if ps -p "$pid" >/dev/null 2>&1; then
    echo "  ✅ Copilot Round-Robin started (PID: $pid)"
  else
    echo "  ⚠️  Copilot Round-Robin failed to start (check logs/copilot_roundrobin.log)"
    rm -f tmp/copilot_roundrobin.pid
  fi
}

start_voice_service() {
  tmux has-session -t voice-service 2>/dev/null && { echo "  ℹ️  Voice service running"; return; }

  bash "$ROOT_DIR/scripts/voice/start_voice_service.sh" || {
    echo "  ⚠️  Voice service failed to start"
  }
}

start_whisper() {
  tmux has-session -t whisper-service 2>/dev/null && { echo "  ℹ️  Whisper service running"; return; }

  bash "$ROOT_DIR/scripts/voice/start_whisper_service.sh" || {
    echo "  ⚠️  Whisper service failed to start (optional)"
  }
}

start_vocode() {
  tmux has-session -t vocode-service 2>/dev/null && { echo "  ℹ️  Vocode service running"; return; }

  bash "$ROOT_DIR/scripts/voice/start_vocode_service.sh" || {
    echo "  ⚠️  Vocode service failed to start (optional)"
  }
}
