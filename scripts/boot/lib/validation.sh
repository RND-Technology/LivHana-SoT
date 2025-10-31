#!/usr/bin/env bash
# Validation Module (Principle of One)

# Pre-flight checks (run BEFORE starting services)
preflight_checks() {
  echo "🔍 Pre-flight validation..."

  local failures=0

  # Check 1: Git repository health
  if git -C "$ROOT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
    echo "  ✅ Git repository initialized"
  else
    echo "  ❌ Git repository not initialized"
    ((failures++))
  fi

  # Check 2: Disk space (5GB minimum)
  local available_raw=$(df -h "$ROOT_DIR" | tail -1 | awk '{print $4}')
  local available_gb=$(echo "$available_raw" | sed 's/[^0-9]//g')
  if [[ "$available_gb" =~ ^[0-9]+$ ]] && [[ $available_gb -ge 5 ]]; then
    echo "  ✅ Disk space: ${available_raw} available"
  else
    echo "  ❌ Insufficient disk space: ${available_raw} (need 5GB minimum)"
    ((failures++))
  fi

  # Check 3: Critical dependencies
  local deps=("redis-server" "node" "tmux" "python3" "op" "git" "curl")
  for dep in "${deps[@]}"; do
    if command -v "$dep" >/dev/null 2>&1; then
      echo "  ✅ $dep installed"
    else
      echo "  ❌ $dep NOT FOUND"
      ((failures++))
    fi
  done

  # Check 4: Clean lock files from previous crashes
  local lock_files=("$ROOT_DIR/tmp/claude_tier1_auto_save.lock" "$ROOT_DIR/tmp/tier1_supervisor.lock" "$ROOT_DIR/tmp/auto_save_local.lock")
  for lock in "${lock_files[@]}"; do
    if [[ -f "$lock" ]]; then
      local lock_pid=$(cat "$lock" 2>/dev/null)
      if [[ -n "$lock_pid" ]] && kill -0 "$lock_pid" 2>/dev/null; then
        echo "  ⚠️  Active lock file: $(basename "$lock") (PID $lock_pid still running)"
      else
        rm -f "$lock"
        echo "  🧹 Cleaned stale lock: $(basename "$lock")"
      fi
    fi
  done

  # Check 5: Required directories
  local dirs=("$ROOT_DIR/tmp" "$ROOT_DIR/logs" "$ROOT_DIR/tmp/agent_status")
  for dir in "${dirs[@]}"; do
    if [[ -d "$dir" ]] && [[ -w "$dir" ]]; then
      echo "  ✅ Directory ready: $(basename "$dir")"
    else
      mkdir -p "$dir" 2>/dev/null && echo "  🔧 Created directory: $(basename "$dir")" || {
        echo "  ❌ Cannot create directory: $dir"
        ((failures++))
      }
    fi
  done

  echo ""
  if [[ $failures -eq 0 ]]; then
    echo "✅ Pre-flight checks passed"
    return 0
  else
    echo "❌ Pre-flight checks failed ($failures issues)"
    echo "🛑 Cannot proceed - fix issues above and restart"
    return 1
  fi
}

# Post-boot validation (run AFTER services start)
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
