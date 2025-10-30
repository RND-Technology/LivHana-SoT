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
  if lsof -i :"${REDIS_PORT}" >/dev/null 2>&1 && redis-cli -p "${REDIS_PORT}" ping >/dev/null 2>&1; then
    echo "  ✅ Redis healthy"
    return 0
  else
    echo "  ❌ Redis down"
    return 1
  fi
}

validate_services() {
  if curl -sf "http://localhost:${REASONING_GATEWAY_PORT}/health" >/dev/null 2>&1; then
    echo "  ✅ Reasoning gateway healthy"
    return 0
  else
    echo "  ❌ Reasoning gateway down"
    return 1
  fi
}

validate_agents() {
  local count
  count=$(tmux ls 2>/dev/null | grep -cE "^(planning|research|artifact|execmon|qa):" || echo 0)
  if [[ $count -eq 5 ]]; then
    echo "  ✅ 5/5 agents"
    return 0
  else
    echo "  ❌ $count/5 agents"
    return 1
  fi
}
