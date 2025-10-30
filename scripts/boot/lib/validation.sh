#!/usr/bin/env bash
# Validation Module (Principle of One)

validate_system() {
  echo "🔍 Validating system..."

  validate_redis && validate_services && validate_agents
  local result=$?

  [[ $result -eq 0 ]] && echo "✅ All validations passed" || echo "⚠️  Some failed"
  return $result
}

validate_redis() {
  lsof -i :${REDIS_PORT} >/dev/null 2>&1 && redis-cli -p "${REDIS_PORT}" ping >/dev/null 2>&1 && \
    { echo "  ✅ Redis healthy"; return 0; } || { echo "  ❌ Redis down"; return 1; }
}

validate_services() {
  curl -sf "http://localhost:${REASONING_GATEWAY_PORT}/health" >/dev/null 2>&1 && \
    { echo "  ✅ Reasoning gateway healthy"; return 0; } || { echo "  ❌ Reasoning gateway down"; return 1; }
}

validate_agents() {
  local count=$(tmux ls 2>/dev/null | grep -cE "^(planning|research|artifact|execmon|qa):" || echo 0)
  [[ $count -eq 5 ]] && { echo "  ✅ 5/5 agents"; return 0; } || { echo "  ❌ $count/5 agents"; return 1; }
}
