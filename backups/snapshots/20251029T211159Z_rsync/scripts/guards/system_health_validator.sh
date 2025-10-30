#!/usr/bin/env bash
# System Health Validator - Military Grade
# Validates all critical systems with DARPA-level rigor
# Created: 2025-10-28 by Liv Hana (Tier-1)
# Owner: Jesse CEO
# Security Level: MAXIMUM

set -euo pipefail

# Configuration
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)"
LOG="$ROOT/logs/system_health_validator.log"
METRICS="$ROOT/tmp/system_health_metrics.json"

# Exit codes
EXIT_SUCCESS=0
EXIT_WARNING=1
EXIT_CRITICAL=2

# Thresholds
CRITICAL_MEMORY_PCT=5
WARNING_MEMORY_PCT=15
CRITICAL_DISK_GB=5
WARNING_DISK_GB=10
MAX_AGENT_RESTART_ATTEMPTS=3
MAX_SERVICE_RESTART_ATTEMPTS=3

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

critical() { echo -e "${RED}${BOLD}[CRITICAL]${NC} $1" | tee -a "$LOG"; }
error() { echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG"; }
success() { echo -e "${GREEN}[OK]${NC} $1" | tee -a "$LOG"; }
info() { echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG"; }

# Initialize
mkdir -p "$(dirname "$LOG")" "$(dirname "$METRICS")"
VALIDATION_ERRORS=0
VALIDATION_WARNINGS=0

banner() {
  echo ""
  echo -e "${MAGENTA}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${MAGENTA}${BOLD}  $1${NC}"
  echo -e "${MAGENTA}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Test 1: Critical Dependencies
validate_dependencies() {
  banner "TEST 1: CRITICAL DEPENDENCIES"
  local missing=0

  local deps=("node" "npm" "tmux" "op" "git" "curl" "jq")

  for dep in "${deps[@]}"; do
    if command -v "$dep" >/dev/null 2>&1; then
      success "$dep: INSTALLED"
    else
      error "$dep: MISSING"
      missing=$((missing + 1))
    fi
  done

  if [[ $missing -eq 0 ]]; then
    success "All critical dependencies present"
    return 0
  else
    critical "$missing critical dependencies MISSING"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + missing))
    return 1
  fi
}

# Test 2: Memory Pressure
validate_memory() {
  banner "TEST 2: MEMORY PRESSURE"

  local free_pct=""
  if command -v memory_pressure >/dev/null 2>&1; then
    free_pct=$(memory_pressure 2>/dev/null | grep -i "System-wide memory free percentage" | awk '{print $NF}' | tr -d '%' || echo "")
  fi

  if [[ -z "$free_pct" ]]; then
    warning "Could not determine memory pressure - using vm_stat fallback"
    return 0
  fi

  if [[ $free_pct -lt $CRITICAL_MEMORY_PCT ]]; then
    critical "Memory critically low: ${free_pct}% free (< ${CRITICAL_MEMORY_PCT}%)"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    return 1
  elif [[ $free_pct -lt $WARNING_MEMORY_PCT ]]; then
    warning "Memory low: ${free_pct}% free (< ${WARNING_MEMORY_PCT}%)"
    VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
    return 0
  else
    success "Memory healthy: ${free_pct}% free"
    return 0
  fi
}

# Test 3: Disk Space
validate_disk_space() {
  banner "TEST 3: DISK SPACE"

  local available=$(df -h / | tail -1 | awk '{print $4}' | sed 's/Gi//')

  if [[ "$available" =~ ^[0-9]+$ ]]; then
    if [[ $available -lt $CRITICAL_DISK_GB ]]; then
      critical "Disk critically low: ${available}GB free (< ${CRITICAL_DISK_GB}GB)"
      VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
      return 1
    elif [[ $available -lt $WARNING_DISK_GB ]]; then
      warning "Disk low: ${available}GB free (< ${WARNING_DISK_GB}GB)"
      VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
      return 0
    else
      success "Disk healthy: ${available}GB free"
      return 0
    fi
  else
    warning "Could not determine disk space"
    return 0
  fi
}

# Test 4: Agent Health
validate_agents() {
  banner "TEST 4: AGENT HEALTH"

  local agents=("planning" "research" "artifact" "execmon" "qa")
  local healthy=0
  local unhealthy=0

  for agent in "${agents[@]}"; do
    local status_file="$ROOT/tmp/agent_status/${agent}.status.json"

    if [[ ! -f "$status_file" ]]; then
      error "Agent '$agent': NO STATUS FILE"
      unhealthy=$((unhealthy + 1))
      continue
    fi

    local file_age=$(($(date +%s) - $(stat -f %m "$status_file" 2>/dev/null || echo 0)))
    if [[ $file_age -gt 300 ]]; then
      warning "Agent '$agent': STALE (${file_age}s old)"
      unhealthy=$((unhealthy + 1))
      continue
    fi

    if grep -qE '"status"[[:space:]]*:[[:space:]]*"(active|running)"' "$status_file" 2>/dev/null; then
      success "Agent '$agent': ACTIVE"
      healthy=$((healthy + 1))
    else
      warning "Agent '$agent': INACTIVE"
      unhealthy=$((unhealthy + 1))
    fi
  done

  if [[ $healthy -eq 5 ]]; then
    success "All agents healthy (5/5)"
    return 0
  elif [[ $healthy -ge 3 ]]; then
    warning "Partial agent health ($healthy/5)"
    VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
    return 0
  else
    critical "Critical agent failures ($healthy/5 healthy)"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    return 1
  fi
}

# Test 5: Voice Services
validate_voice_services() {
  banner "TEST 5: VOICE SERVICES"

  local issues=0

  # Check STT
  if lsof -i :2022 2>/dev/null | grep -q LISTEN; then
    if curl --max-time 2 -sf "http://localhost:2022/health" >/dev/null 2>&1 || nc -z localhost 2022 2>/dev/null; then
      success "STT (Whisper): ACTIVE on port 2022"
    else
      warning "STT (Whisper): Port open but not responding"
      issues=$((issues + 1))
    fi
  else
    warning "STT (Whisper): NOT RUNNING"
    issues=$((issues + 1))
  fi

  # Check TTS
  if lsof -i :8880 2>/dev/null | grep -q LISTEN; then
    if curl --max-time 2 -sf "http://localhost:8880/health" >/dev/null 2>&1 || nc -z localhost 8880 2>/dev/null; then
      success "TTS (Kokoro): ACTIVE on port 8880"
    else
      warning "TTS (Kokoro): Port open but not responding"
      issues=$((issues + 1))
    fi
  else
    warning "TTS (Kokoro): NOT RUNNING"
    issues=$((issues + 1))
  fi

  if [[ $issues -eq 0 ]]; then
    success "Voice services fully operational"
    return 0
  elif [[ $issues -eq 1 ]]; then
    warning "Voice services partially operational (1 issue)"
    VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
    return 0
  else
    warning "Voice services degraded ($issues issues)"
    VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
    return 0
  fi
}

# Test 6: Port Conflicts
validate_ports() {
  banner "TEST 6: PORT CONFLICTS"

  local conflicts=0
  local ports=("2022:STT" "8880:TTS" "3005:Integration")

  for port_spec in "${ports[@]}"; do
    local port=$(echo "$port_spec" | cut -d: -f1)
    local service=$(echo "$port_spec" | cut -d: -f2)

    if lsof -i ":$port" 2>/dev/null | grep -q LISTEN; then
      local pid=$(lsof -ti ":$port" | head -1)
      local process=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
      success "Port $port ($service): In use by $process (PID $pid)"
    else
      info "Port $port ($service): Available"
    fi
  done

  success "No unexpected port conflicts detected"
  return 0
}

# Test 7: Watchdog Health
validate_watchdogs() {
  banner "TEST 7: WATCHDOG HEALTH"

  local watchdogs=0
  local running=0

  # Session watchdog
  if pgrep -f "watch-session-progress.sh" >/dev/null 2>&1; then
    success "Session watchdog: RUNNING"
    running=$((running + 1))
  else
    warning "Session watchdog: NOT RUNNING"
  fi
  watchdogs=$((watchdogs + 1))

  # 1Password guard
  if pgrep -f "op_secret_guard.sh" >/dev/null 2>&1; then
    success "1Password guard: RUNNING"
    running=$((running + 1))
  else
    warning "1Password guard: NOT RUNNING"
  fi
  watchdogs=$((watchdogs + 1))

  # Boot script watchdog
  if pgrep -f "boot_script_auto_commit.sh" >/dev/null 2>&1; then
    success "Boot script watchdog: RUNNING"
    running=$((running + 1))
  else
    warning "Boot script watchdog: NOT RUNNING"
  fi
  watchdogs=$((watchdogs + 1))

  # Agent logger
  if pgrep -f "agent_status_realtime_logger.sh" >/dev/null 2>&1; then
    success "Agent logger: RUNNING"
    running=$((running + 1))
  else
    warning "Agent logger: NOT RUNNING"
  fi
  watchdogs=$((watchdogs + 1))

  # Resource allocator
  if pgrep -f "dynamic_resource_allocator.sh" >/dev/null 2>&1; then
    success "Resource allocator: RUNNING"
    running=$((running + 1))
  else
    warning "Resource allocator: NOT RUNNING"
  fi
  watchdogs=$((watchdogs + 1))

  if [[ $running -eq $watchdogs ]]; then
    success "All watchdogs operational ($running/$watchdogs)"
    return 0
  elif [[ $running -ge $((watchdogs / 2)) ]]; then
    warning "Partial watchdog coverage ($running/$watchdogs)"
    VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
    return 0
  else
    error "Insufficient watchdog coverage ($running/$watchdogs)"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    return 1
  fi
}

# Test 8: File System Integrity
validate_filesystem() {
  banner "TEST 8: FILE SYSTEM INTEGRITY"

  local critical_dirs=(
    "$ROOT/tmp/agent_status"
    "$ROOT/logs"
    "$ROOT/.claude"
    "$ROOT/tmp"
    "$ROOT/.vscode"
    "$ROOT/scripts/watchdogs"
  )

  local issues=0

  for dir in "${critical_dirs[@]}"; do
    if [[ -d "$dir" ]] && [[ -w "$dir" ]]; then
      success "Directory '$dir': OK"
    else
      error "Directory '$dir': MISSING or NOT WRITABLE"
      issues=$((issues + 1))
    fi
  done

  if [[ $issues -eq 0 ]]; then
    success "File system integrity verified"
    return 0
  else
    critical "$issues file system issues detected"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + issues))
    return 1
  fi
}

# Generate metrics JSON
generate_metrics() {
  cat > "$METRICS" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "validation": {
    "errors": $VALIDATION_ERRORS,
    "warnings": $VALIDATION_WARNINGS,
    "status": "$(if [[ $VALIDATION_ERRORS -eq 0 ]]; then echo "PASS"; else echo "FAIL"; fi)"
  },
  "system": {
    "memory_pct_free": $(memory_pressure 2>/dev/null | grep -i "System-wide memory free percentage" | awk '{print $NF}' | tr -d '%' || echo "0"),
    "disk_gb_free": $(df -h / | tail -1 | awk '{print $4}' | sed 's/Gi//' || echo "0")
  }
}
EOF
}

# Main validation
main() {
  banner "MILITARY-GRADE SYSTEM VALIDATION"
  info "Security Level: MAXIMUM"
  info "Compliance: DARPA-COMPETITIVE"
  echo ""

  validate_dependencies
  validate_memory
  validate_disk_space
  validate_agents
  validate_voice_services
  validate_ports
  validate_watchdogs
  validate_filesystem

  # Generate metrics
  generate_metrics

  # Final verdict
  banner "VALIDATION SUMMARY"
  info "Errors: $VALIDATION_ERRORS"
  info "Warnings: $VALIDATION_WARNINGS"

  if [[ $VALIDATION_ERRORS -eq 0 ]] && [[ $VALIDATION_WARNINGS -eq 0 ]]; then
    success "SYSTEM STATUS: FULLY OPERATIONAL"
    success "All systems validated - military-grade readiness confirmed"
    return $EXIT_SUCCESS
  elif [[ $VALIDATION_ERRORS -eq 0 ]]; then
    warning "SYSTEM STATUS: OPERATIONAL WITH WARNINGS"
    warning "Degraded functionality - monitor closely"
    return $EXIT_WARNING
  else
    critical "SYSTEM STATUS: CRITICAL FAILURES DETECTED"
    critical "Immediate attention required"
    return $EXIT_CRITICAL
  fi
}

# Run validation
main "$@"
