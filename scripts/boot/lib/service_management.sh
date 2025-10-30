#!/usr/bin/env bash
# Service Management Module (Principle of One)

start_services() {
  echo "🚀 Starting services..."
  start_redis
  start_reasoning_gateway
  start_orchestration
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
