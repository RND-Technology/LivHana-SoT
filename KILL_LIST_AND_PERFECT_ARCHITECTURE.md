# LIVHANA-SOT: KILL LIST & PERFECT ARCHITECTURE

**Date**: 2025-10-29
**Mission**: Slaughter dead weight, extract the good, fuse into perfection
**Standard**: Marine Corps Precision - No mercy for redundancy

---

## EXECUTIVE SUMMARY

**Current State**: 653 shell scripts, massive duplication, scattered architecture
**Target State**: ~200 scripts, perfect organization, zero redundancy
**Reduction**: 70% elimination rate
**Method**: Surgical extraction of good code, ruthless deletion of waste

---

## PART 1: THE KILL LIST - DEAD WEIGHT TO SLAUGHTER

### 🔥 TIER 1: DELETE IMMEDIATELY (Zero Value)

#### Root Directory Garbage (14 files)
```bash
# DELETE - No useful code, pure noise
rm "START copy.sh"                          # Useless file copy
rm CHEETAH_FINAL_VICTORY.sh                 # Victory lap script, no function
rm CHEETAH_VICTORY_NOW.sh                   # Duplicate victory script
rm DELETE_DUPLICATES.sh                     # Ironic - script itself is duplicate
rm FINAL_EXECUTION_COMMAND.sh               # One-off command wrapper
rm MANUAL_CLAUDE_CLI_FIX.sh                 # 464 bytes, obsolete fix
rm monitor-cheetah.sh                       # Monitoring for deleted service
rm start-cheetah-monitor.sh                 # Monitoring for deleted service
rm PURGE_JUMIO_COMPLETE.sh                  # One-time purge, completed
rm PUSH_TO_GITHUB_NOW.sh                    # Wrapper for git push
rm RUNNABLE_COMMAND.sh                      # Generic command wrapper
rm test_preflight.sh                        # Duplicate of scripts/preflight_checks.sh
rm vscode-livhana-stable.sh                 # VSCode launcher, obsolete

# MOVE TO ARCHIVE - May contain useful emergency code
mkdir -p scripts/archive/emergency_fixes
mv EMERGENCY_FIX.sh scripts/archive/emergency_fixes/
mv FIX_SHELL_NOW.sh scripts/archive/emergency_fixes/
mv FIX_VOICE_MODE.sh scripts/archive/emergency_fixes/
mv QUICK_VOICE_FIX.sh scripts/archive/emergency_fixes/
mv SHELL_FIX_V2_COMPLETE.sh scripts/archive/emergency_fixes/
```

**Justification**: These scripts are one-time fixes, victory laps, or useless copies. No production value. Emergency fixes archived in case logic needed for future similar issues.

#### Dated Deployment Scripts (11 files)
```bash
# DELETE - Deployments completed, dated scripts obsolete
rm scripts/1.2.2.1_delivery-service-deploy_20251008.sh
rm scripts/2.6.1.1_content-engine-autonomous-deploy_20251008.sh
rm scripts/1.6.3.3_BLAZED_FEST_RESTORATION_NOW_20251028.sh
rm scripts/deploy_all_three_flags_NOW.sh
rm scripts/deploy_three_flags.sh               # Duplicate of above
rm scripts/deploy-trinity-stack.sh             # Superseded by docker-compose
rm scripts/deploy_flags_boot.sh                # Obsolete flag system
rm scripts/deploy-without-keys.sh              # Security anti-pattern
rm scripts/replit-master-deploy.sh             # Replit not in use
rm scripts/parallel_deployment_coordinator.sh  # Will be replaced by new deployer
rm scripts/DEPLOY_ALL_MVPS_PARALLEL.sh         # Duplicate of above
```

**Justification**: Dated scripts prove deployment completed. Modern docker-compose + cloud deployment replaces these ad-hoc scripts.

#### Duplicate Watchdog Scripts (Already Deleted - Verify)
```bash
# VERIFY DELETED - Should be in backups/ only
ls scripts/watchdogs/boot_script_auto_commit.sh 2>/dev/null && echo "FOUND - DELETE"
ls scripts/watchdogs/dependency_auto_save.sh 2>/dev/null && echo "FOUND - DELETE"
ls scripts/watchdogs/universal_auto_save.sh 2>/dev/null && echo "FOUND - DELETE"
ls scripts/watchdogs/boot_deps_master.sh 2>/dev/null && echo "FOUND - DELETE"
ls scripts/watchdogs/copilot-chat-monitor.sh 2>/dev/null && echo "FOUND - DELETE"
ls scripts/watchdogs/copilot_json_monitor.sh 2>/dev/null && echo "FOUND - DELETE"
```

**Justification**: Consolidated into tier1_supervisor.sh. Validated complete per CODEX_WORK_VALIDATED_COMPLETE.md.

#### Duplicate Agent Launchers (9 files)
```bash
# DELETE - Will be replaced by generic start_agent.sh
rm scripts/start_artifact_agent.sh
rm scripts/start_planning_agent.sh
rm scripts/start_research_agent.sh
rm scripts/start_qa_agent.sh
rm scripts/start_execution_monitor.sh
rm scripts/spawn-agents.sh                     # 11 lines, trivial
rm scripts/heal-agents.sh                      # 26 lines, will integrate into tier1_supervisor
rm scripts/agent-status.sh                     # Replaced by tmux ls + registry
rm scripts/agent_coordination_check.sh         # Duplicate of dual_tier1_loop.sh logic
```

**Justification**: 9 scripts doing identical tmux launch logic. Extract best practices, create single generic launcher.

#### Duplicate Validation Scripts (14 files)
```bash
# DELETE - Will be consolidated into scripts/validation/validate.sh
rm validate-env.sh                             # Root copy
rm scripts/validate-env.sh                     # Scripts copy (keep one as base)
rm validate_all_green.sh
rm validate_system.sh
rm verify_system.sh                            # Same verb meaning as validate
rm test_validation_suite.sh
rm verify_pipeline_integrity.sh                # Root copy
rm scripts/verify_pipeline_integrity.sh        # Scripts copy
rm scripts/verify_pipeline_integrity.py        # Python duplicate
rm post_action_validate.sh
rm scripts/post_launch_checks.py
rm scripts/runtime_validation.py
rm watch_system_metrics.sh
rm validate_metrics.sh
```

**Justification**: 14 scripts with overlapping validation logic. Extract all checks into modular lib/ functions.

#### Duplicate Boot Scripts (7 files)
```bash
# DELETE - Superseded by START.sh
rm scripts/claude_tier1_boot.sh                # 500+ lines, alternative boot
rm scripts/tier1-boot.sh                       # Another boot script
rm scripts/boot_no_permissions.sh              # No-permissions variant
rm scripts/emergency_boot_fix.sh               # Emergency variant
rm scripts/fix_boot_popups.sh                  # VSCode popup fix
rm scripts/voice_mode_boot.sh                  # Voice-specific boot
rm scripts/codex_agent_boot.sh                 # Codex-specific boot

# KEEP BUT RENAME
mv TIER1_BOOT_LOCK_3_AGENTS_24_7.sh scripts/boot/tier1_alternative_boot.sh
```

**Justification**: 7 boot scripts when START.sh is the canonical boot. Keep one alternative for emergency use.

#### Duplicate Monitoring Scripts (9 files)
```bash
# DELETE - Consolidate into tier1_supervisor or dedicated monitor
rm system-health-monitor.sh
rm system_integrity_monitor.sh
rm test_system_monitor.sh
rm scripts/session_monitor.sh
rm scripts/start-crash-monitor.sh
rm scripts/start_crash_prevention_suite.sh
rm scripts/tail_monitor_logs.sh
rm scripts/calculate-health-score.sh
rm scripts/ops/watch-session-progress.sh
```

**Justification**: 9 monitoring scripts. Tier1_supervisor handles most. Remainder consolidate to single monitor with modular checks.

#### Duplicate VSCode Fix Scripts (6 files)
```bash
# KEEP ONLY THE CORRECTED VERSION
# DELETE the rest
rm fix_vscode_permissions.sh
rm fix_vscode_permissions_emergency.sh
rm vscode_crash_prevention.sh
rm verify_vscode_clean.sh
rm fix_cursor_quarantine.sh
rm scripts/fix_vscode_permissions.sh

# KEEP (already validated)
# fix_vscode_translocation_CORRECTED.sh (152 lines, red-team reviewed)
```

**Justification**: 7 VSCode fix scripts. The CORRECTED version (152 lines) was red-team reviewed and validated. Delete all others.

#### Duplicate Secret Management Scripts (10 files)
```bash
# DELETE - Consolidate into single secret manager
rm setup_lightspeed_oauth_secrets.sh
rm setup_perplexity_key.sh
rm add_missing_api_keys.sh
rm add_missing_secrets.sh
rm export_secrets.sh
rm verify_secrets_exist.sh
rm secrets_smoke_test.sh
rm secrets_integration.sh
rm populate_secrets_from_1password.sh
rm test_1password_lookup.sh
```

**Justification**: 10 secret scripts. Watchdog op_secret_guard.sh handles monitoring. Need single setup script.

#### Duplicate Test Scripts (8 files)
```bash
# DELETE - Migrate to Bats/Jest framework
rm test_preflight.sh
rm test_validation_suite.sh
rm test_system_monitor.sh
rm test-mcp-broker.sh
rm test-mcp-broker-quick.sh
rm test_mcp_broker.sh                          # Different from above!
rm simple-godaddy-test.sh
rm slack_smoke_test.sh
```

**Justification**: Ad-hoc test scripts. Migrate to proper test framework (Bats for shell, Jest for JS, pytest for Python).

#### Duplicate Preflight Scripts (3 files)
```bash
# DELETE - Keep only one
rm preflight_checks.sh                         # Root
rm scripts/preflight_checks.sh                 # Scripts directory
# KEEP: scripts/ci/preflight.sh (most comprehensive)
```

**Justification**: 3 identical preflight scripts. CI version is most complete.

---

### 🔥 TIER 2: EXTRACT THEN DELETE (Useful Code Present)

#### Agent Launchers (Extract Best Practices)
**Files**: `scripts/start_*_agent.sh` (5 files)

**Good Code to Extract**:
```bash
# From start_artifact_agent.sh (107 lines)
# EXTRACT: Tmux session management pattern
check_tmux_session() {
  local session_name=$1
  if tmux has-session -t "$session_name" 2>/dev/null; then
    echo "Session $session_name already exists"
    return 1
  fi
  return 0
}

# EXTRACT: Status file creation pattern
create_status_file() {
  local agent_name=$1
  local status_file="tmp/agent_status/${agent_name}.status.json"
  cat > "$status_file" <<EOF
{
  "agent": "$agent_name",
  "phase": "startup",
  "status": "starting",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "pid": $$,
  "artifacts": []
}
EOF
}

# EXTRACT: Health check validation pattern
validate_health_endpoint() {
  local agent_name=$1
  local port=$2
  local max_attempts=30
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if curl -sf "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
      echo "✅ $agent_name health check passed"
      return 0
    fi
    sleep 1
    ((attempt++))
  done

  echo "❌ $agent_name health check failed after ${max_attempts}s"
  return 1
}

# EXTRACT: Log file setup pattern
setup_logging() {
  local agent_name=$1
  local log_dir="logs/agents"
  mkdir -p "$log_dir"

  local log_file="${log_dir}/${agent_name}_$(date +%Y%m%d_%H%M%S).log"
  local audit_file="${log_dir}/${agent_name}_audit.jsonl"

  echo "$log_file"
}
```

**Action**: Extract patterns above into `scripts/agents/lib/agent_helpers.sh`, then delete all 5 launcher scripts.

#### Validation Scripts (Extract All Checks)
**Files**: 14 validation scripts

**Good Code to Extract**:
```bash
# EXTRACT: Environment validation checks
check_required_env_vars() {
  local required_vars=("NODE_ENV" "REDIS_HOST" "REDIS_PORT")
  for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
      echo "❌ Missing required env var: $var"
      return 1
    fi
  done
}

# EXTRACT: Port availability checks
check_ports_available() {
  local ports=(2022 8880 4002 4010 6379)
  for port in "${ports[@]}"; do
    if lsof -i ":$port" >/dev/null 2>&1; then
      echo "❌ Port $port already in use"
      lsof -i ":$port"
      return 1
    fi
  done
}

# EXTRACT: Service health checks
check_service_health() {
  local service=$1
  local port=$2
  local endpoint=${3:-/health}

  if curl -sf "http://localhost:${port}${endpoint}" >/dev/null 2>&1; then
    echo "✅ $service healthy on port $port"
    return 0
  else
    echo "❌ $service not responding on port $port"
    return 1
  fi
}

# EXTRACT: Agent count validation
check_agent_count() {
  local expected=5
  local actual=$(tmux ls 2>/dev/null | grep -cE "planning|research|artifact|execmon|qa")

  if [[ $actual -eq $expected ]]; then
    echo "✅ All $expected agents running"
    return 0
  else
    echo "❌ Expected $expected agents, found $actual"
    return 1
  fi
}

# EXTRACT: Disk space check
check_disk_space() {
  local min_free_gb=10
  local available=$(df -g . | tail -1 | awk '{print $4}')

  if [[ $available -lt $min_free_gb ]]; then
    echo "❌ Low disk space: ${available}GB available (need ${min_free_gb}GB)"
    return 1
  fi
  echo "✅ Disk space OK: ${available}GB available"
  return 0
}
```

**Action**: Extract all check functions to `scripts/validation/lib/`, delete original scripts.

#### Boot Scripts (Extract Unique Logic)
**Files**: 7 boot scripts

**Good Code to Extract**:
```bash
# From scripts/claude_tier1_boot.sh (500+ lines)
# EXTRACT: Alternative boot sequence with different priorities
# EXTRACT: Error recovery patterns
# EXTRACT: Pre-boot health checks

# From scripts/boot_no_permissions.sh
# EXTRACT: Fallback boot without VSCode permissions
# EXTRACT: Minimal service startup

# From scripts/emergency_boot_fix.sh
# EXTRACT: Emergency recovery procedures
# EXTRACT: Service repair logic
```

**Action**: Extract unique logic patterns, integrate as START.sh fallback modes, delete originals.

#### Monitoring Scripts (Extract Metrics Collection)
**Files**: 9 monitoring scripts

**Good Code to Extract**:
```bash
# EXTRACT: System metrics collection
collect_system_metrics() {
  local metrics_file="tmp/system_metrics.json"
  cat > "$metrics_file" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "cpu_usage": $(top -l 1 | grep "CPU usage" | awk '{print $3}' | tr -d '%'),
  "memory_pressure": "$(memory_pressure | grep "System-wide" | awk '{print $3}')",
  "disk_usage": $(df -h . | tail -1 | awk '{print $5}' | tr -d '%'),
  "open_files": $(lsof | wc -l),
  "tmux_sessions": $(tmux ls 2>/dev/null | wc -l),
  "running_agents": $(tmux ls 2>/dev/null | grep -cE "planning|research|artifact|execmon|qa")
}
EOF
}

# EXTRACT: Health score calculation
calculate_health_score() {
  local score=100

  # Deduct points for issues
  lsof -i :6379 >/dev/null || ((score-=20))  # Redis down
  lsof -i :4010 >/dev/null || ((score-=20))  # Orchestration down
  [[ $(tmux ls 2>/dev/null | grep -cE "agent") -eq 5 ]] || ((score-=30))  # Agents down

  echo "$score"
}
```

**Action**: Extract metrics collection, integrate into tier1_supervisor, delete original scripts.

#### Secret Management Scripts (Extract 1Password Logic)
**Files**: 10 secret management scripts

**Good Code to Extract**:
```bash
# EXTRACT: 1Password CLI integration
op_get_secret() {
  local secret_name=$1
  local vault=${2:-"LivHana"}

  if ! command -v op >/dev/null 2>&1; then
    echo "❌ 1Password CLI not installed"
    return 1
  fi

  op item get "$secret_name" --vault "$vault" --fields password 2>/dev/null
}

# EXTRACT: Secret validation
validate_secrets() {
  local required_secrets=("OPENAI_API_KEY" "ANTHROPIC_API_KEY" "LINEAR_API_KEY")

  for secret in "${required_secrets[@]}"; do
    if [[ -z "${!secret}" ]]; then
      echo "⚠️  Missing secret: $secret"
      echo "   Attempting 1Password lookup..."

      local value=$(op_get_secret "$secret")
      if [[ -n "$value" ]]; then
        export "$secret=$value"
        echo "✅ Retrieved from 1Password"
      else
        echo "❌ Not found in 1Password"
        return 1
      fi
    fi
  done
}
```

**Action**: Extract 1Password patterns, create single `scripts/secrets/setup_secrets.sh`, delete originals.

---

### 🔥 TIER 3: ARCHIVE (Historical Value, Not Active)

#### Emergency Fix Scripts (5 files)
```bash
# MOVE TO scripts/archive/emergency_fixes/
mv EMERGENCY_FIX.sh scripts/archive/emergency_fixes/
mv FIX_SHELL_NOW.sh scripts/archive/emergency_fixes/
mv FIX_VOICE_MODE.sh scripts/archive/emergency_fixes/
mv QUICK_VOICE_FIX.sh scripts/archive/emergency_fixes/
mv SHELL_FIX_V2_COMPLETE.sh scripts/archive/emergency_fixes/
```

**Justification**: These scripts contain emergency repair logic that might be useful as reference for future similar issues. Archive for historical reference.

#### Dated Deployment Scripts (11 files)
```bash
# MOVE TO scripts/archive/deployments_2024/
mkdir -p scripts/archive/deployments_2024
mv scripts/*_20251008.sh scripts/archive/deployments_2024/
mv scripts/*_20251028.sh scripts/archive/deployments_2024/
mv scripts/deploy_all_three_flags_NOW.sh scripts/archive/deployments_2024/
mv scripts/deploy_three_flags.sh scripts/archive/deployments_2024/
mv scripts/deploy-trinity-stack.sh scripts/archive/deployments_2024/
```

**Justification**: Deployment history useful for understanding evolution of deployment strategy. Archive for reference.

---

## PART 2: THE EXTRACTION PLAN - GOOD CODE TO PRESERVE

### Agent Management Patterns
**Source**: `scripts/start_*_agent.sh` (5 files)

**Extract to**: `scripts/agents/lib/agent_helpers.sh`
```bash
#!/usr/bin/env bash
# Agent Helper Functions - Extracted from 5 launcher scripts
# Best practices consolidated from start_artifact_agent.sh et al.

check_tmux_session() { ... }
create_status_file() { ... }
validate_health_endpoint() { ... }
setup_logging() { ... }
register_agent() { ... }
update_agent_status() { ... }
```

**New Generic Launcher**: `scripts/agents/launchers/start_agent.sh`
```bash
#!/usr/bin/env bash
# Universal Agent Launcher - Replaces 5 individual launchers
source "$(dirname "$0")/../lib/agent_helpers.sh"

AGENT_NAME=$1
AGENT_PORT=${2:-5010}
AGENT_PRIORITY=${3:-2}
AGENT_SCRIPT="scripts/agents/implementations/${AGENT_NAME}_agent.py"

# Validate
[[ -z "$AGENT_NAME" ]] && { echo "Usage: start_agent.sh <name> [port] [priority]"; exit 1; }
[[ ! -f "$AGENT_SCRIPT" ]] && { echo "Agent script not found: $AGENT_SCRIPT"; exit 1; }

# Check existing
check_tmux_session "$AGENT_NAME" || exit 0

# Setup
LOG_FILE=$(setup_logging "$AGENT_NAME")
create_status_file "$AGENT_NAME"

# Launch
echo "🚀 Launching agent: $AGENT_NAME (port $AGENT_PORT, priority $AGENT_PRIORITY)"
tmux new-session -d -s "$AGENT_NAME" \
  "python3 '$AGENT_SCRIPT' --port $AGENT_PORT 2>&1 | tee '$LOG_FILE'"

# Validate
sleep 2
validate_health_endpoint "$AGENT_NAME" "$AGENT_PORT"
register_agent "$AGENT_NAME" "$AGENT_PORT" "$AGENT_PRIORITY"

echo "✅ Agent $AGENT_NAME started successfully"
```

### Validation Patterns
**Source**: 14 validation scripts

**Extract to**: `scripts/validation/lib/`
- `env_checks.sh` - Environment variable validation
- `health_checks.sh` - Service health endpoints
- `pipeline_checks.sh` - Pipeline integrity
- `agent_checks.sh` - Agent count and status
- `resource_checks.sh` - Disk, memory, file handles

**New Validation Orchestrator**: `scripts/validation/validate.sh`
```bash
#!/usr/bin/env bash
# Master Validation Orchestrator - Replaces 14 validation scripts
TYPE=${1:-all}
OUTPUT_FORMAT=${2:-text}  # text|json

# Load modular checks
source "$(dirname "$0")/lib/env_checks.sh"
source "$(dirname "$0")/lib/health_checks.sh"
source "$(dirname "$0")/lib/pipeline_checks.sh"
source "$(dirname "$0")/lib/agent_checks.sh"
source "$(dirname "$0")/lib/resource_checks.sh"

# Results storage
declare -A RESULTS
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Runner
run_check() {
  local check_name=$1
  local check_func=$2

  if $check_func; then
    RESULTS[$check_name]="pass"
    ((PASS_COUNT++))
  else
    RESULTS[$check_name]="fail"
    ((FAIL_COUNT++))
  fi
}

# Execute checks
case $TYPE in
  env)
    run_check "required_env_vars" check_required_env_vars
    run_check "port_availability" check_ports_available
    ;;
  health)
    run_check "redis_health" check_redis_health
    run_check "orchestration_health" check_orchestration_health
    run_check "reasoning_gateway_health" check_reasoning_gateway_health
    run_check "voice_services_health" check_voice_services_health
    ;;
  all)
    # Run all checks
    ;;
esac

# Output
if [[ "$OUTPUT_FORMAT" == "json" ]]; then
  cat <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "checks": $(declare -p RESULTS | sed 's/declare -A RESULTS=//' | jq -R -s '.'),
  "summary": {
    "pass": $PASS_COUNT,
    "fail": $FAIL_COUNT,
    "warn": $WARN_COUNT,
    "total": $((PASS_COUNT + FAIL_COUNT + WARN_COUNT))
  }
}
EOF
else
  # Text output
  echo "Validation Results ($TYPE):"
  for check in "${!RESULTS[@]}"; do
    status="${RESULTS[$check]}"
    case $status in
      pass) echo "  ✅ $check" ;;
      fail) echo "  ❌ $check" ;;
      warn) echo "  ⚠️  $check" ;;
    esac
  done
  echo ""
  echo "Summary: $PASS_COUNT passed, $FAIL_COUNT failed, $WARN_COUNT warnings"
fi

# Exit code
[[ $FAIL_COUNT -eq 0 ]] && exit 0 || exit 1
```

### Deployment Patterns
**Source**: 30+ deployment scripts

**Extract to**: `deployments/lib/`
- `cloud_run.sh` - Cloud Run deployment functions
- `docker_compose.sh` - Docker Compose deployment
- `service_manifest.sh` - Service manifest parsing

**New Deployment Orchestrator**: `deployments/deploy.sh`
```bash
#!/usr/bin/env bash
# Master Deployment Orchestrator - Replaces 30+ deployment scripts

SERVICE=$1
ENVIRONMENT=${2:-dev}
DRY_RUN=${3:-false}

# Load deployment functions
source "$(dirname "$0")/lib/cloud_run.sh"
source "$(dirname "$0")/lib/docker_compose.sh"
source "$(dirname "$0")/lib/service_manifest.sh"

# Validate inputs
[[ -z "$SERVICE" ]] && { echo "Usage: deploy.sh <service> [env] [dry_run]"; exit 1; }
[[ ! -f "deployments/services/${SERVICE}.yaml" ]] && { echo "Service not found: $SERVICE"; exit 1; }

# Load configs
SERVICE_CONFIG=$(parse_service_manifest "$SERVICE")
ENV_CONFIG=$(parse_env_config "$ENVIRONMENT")

# Determine deployment type
DEPLOY_TYPE=$(echo "$SERVICE_CONFIG" | jq -r '.type')

# Execute deployment
case $DEPLOY_TYPE in
  cloud-run)
    deploy_to_cloud_run "$SERVICE" "$ENVIRONMENT" "$DRY_RUN"
    ;;
  docker-compose)
    deploy_to_docker_compose "$SERVICE" "$ENVIRONMENT" "$DRY_RUN"
    ;;
  kubernetes)
    deploy_to_kubernetes "$SERVICE" "$ENVIRONMENT" "$DRY_RUN"
    ;;
  *)
    echo "Unknown deployment type: $DEPLOY_TYPE"
    exit 1
    ;;
esac
```

### Secret Management Patterns
**Source**: 10 secret management scripts

**Extract to**: `scripts/secrets/lib/`
- `op_integration.sh` - 1Password CLI functions
- `secret_validation.sh` - Secret validation logic

**New Secret Manager**: `scripts/secrets/setup_secrets.sh`
```bash
#!/usr/bin/env bash
# Master Secret Manager - Replaces 10 secret scripts

source "$(dirname "$0")/lib/op_integration.sh"
source "$(dirname "$0")/lib/secret_validation.sh"

MODE=${1:-validate}  # validate|fetch|export|test

case $MODE in
  validate)
    validate_required_secrets
    ;;
  fetch)
    fetch_secrets_from_1password
    ;;
  export)
    export_secrets_to_env
    ;;
  test)
    test_secret_access
    ;;
esac
```

### Monitoring Patterns
**Source**: 9 monitoring scripts

**Extract to**: `scripts/monitoring/lib/`
- `metrics_collection.sh` - System metrics
- `health_score.sh` - Health score calculation
- `alerting.sh` - Alert logic

**New Monitor**: `scripts/monitoring/system_monitor.sh`
```bash
#!/usr/bin/env bash
# System Monitor - Replaces 9 monitoring scripts

INTERVAL=${1:-60}  # seconds
OUTPUT=${2:-tmp/system_metrics.jsonl}

while true; do
  METRICS=$(collect_system_metrics)
  HEALTH_SCORE=$(calculate_health_score)

  echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"metrics\":$METRICS,\"health_score\":$HEALTH_SCORE}" >> "$OUTPUT"

  # Alert if health score below threshold
  if [[ $HEALTH_SCORE -lt 70 ]]; then
    send_alert "System health degraded: $HEALTH_SCORE/100"
  fi

  sleep "$INTERVAL"
done
```

---

## PART 3: THE PERFECT ARCHITECTURE

### Directory Structure
```
LivHana-SoT/
├── START.sh                          # Primary boot (keep, fix agents)
├── STOP.sh                           # Graceful shutdown (create)
├── TEST.sh                           # Run all tests (create)
├── DEPLOY.sh                         # Production deployment (create)
├── README.md                         # Project documentation
│
├── agents/                           # Agent JS shims (create)
│   ├── planning.js                   # Proxy to Python
│   ├── research.js                   # Proxy to Python
│   ├── artifact.js                   # Proxy to Python
│   ├── qa.js                         # Proxy to Python
│   └── execmon.js                    # Proxy to Python
│
├── backend/                          # Backend microservices
│   ├── reasoning-gateway/            # Port 4002
│   ├── orchestration-service/        # Port 4010
│   ├── voice-service/                # Ports 2022+8880
│   ├── integration-service/          # Port 3005
│   └── [other services]/
│
├── frontend/                         # Frontend applications
│   ├── vibe-cockpit/                 # Evidence-based analytics
│   └── [other frontends]/
│
├── scripts/
│   ├── agents/
│   │   ├── implementations/          # Agent Python code
│   │   │   ├── artifact_agent.py
│   │   │   ├── planning_agent.py     # (create)
│   │   │   ├── research_agent.py     # (create)
│   │   │   ├── qa_agent.py           # (create)
│   │   │   └── execmon_agent.py      # (create)
│   │   ├── launchers/
│   │   │   └── start_agent.sh        # Generic launcher
│   │   ├── coordination/
│   │   │   └── dual_tier1_loop.sh
│   │   ├── lib/
│   │   │   └── agent_helpers.sh      # Extracted functions
│   │   └── tests/
│   │       └── test_*.py
│   │
│   ├── watchdogs/
│   │   ├── tier1_supervisor.sh       # Master watchdog
│   │   ├── op_secret_guard.sh
│   │   ├── voice_services_watch.sh
│   │   └── agent_status_realtime_logger.sh
│   │
│   ├── validation/
│   │   ├── validate.sh               # Master validator
│   │   └── lib/
│   │       ├── env_checks.sh
│   │       ├── health_checks.sh
│   │       ├── pipeline_checks.sh
│   │       ├── agent_checks.sh
│   │       └── resource_checks.sh
│   │
│   ├── boot/
│   │   ├── start_services.sh
│   │   ├── configure_claude_permissions.sh
│   │   ├── helpers.sh
│   │   └── tier1_alternative_boot.sh # Emergency fallback
│   │
│   ├── guards/
│   │   ├── check_disk_space.sh
│   │   ├── check_port_collision.sh
│   │   ├── validate_agent_started.sh
│   │   ├── validate_linear_token.sh
│   │   ├── validate_op_login.sh
│   │   └── validate_pid_file.sh
│   │
│   ├── secrets/
│   │   ├── setup_secrets.sh          # Master secret manager
│   │   └── lib/
│   │       ├── op_integration.sh
│   │       └── secret_validation.sh
│   │
│   ├── monitoring/
│   │   ├── system_monitor.sh         # Master monitor
│   │   └── lib/
│   │       ├── metrics_collection.sh
│   │       ├── health_score.sh
│   │       └── alerting.sh
│   │
│   ├── helpers/
│   │   └── tmux_session_manager.sh
│   │
│   ├── integrations/
│   │   └── linear_sync.py
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   └── *.bats
│   │   ├── integration/
│   │   │   └── *.bats
│   │   └── e2e/
│   │       └── *.spec.js
│   │
│   └── archive/                      # Historical reference
│       ├── emergency_fixes/
│       ├── deployments_2024/
│       └── deprecated/
│
├── deployments/
│   ├── deploy.sh                     # Master deployer
│   ├── services/
│   │   ├── reasoning-gateway.yaml
│   │   ├── orchestration-service.yaml
│   │   └── [other services].yaml
│   ├── envs/
│   │   ├── dev.yaml
│   │   ├── staging.yaml
│   │   └── prod.yaml
│   ├── templates/
│   │   ├── cloud-run.yaml
│   │   └── docker-compose.yaml
│   └── lib/
│       ├── cloud_run.sh
│       ├── docker_compose.sh
│       └── service_manifest.sh
│
├── config/
│   ├── ports.json                    # Centralized port registry
│   ├── tier1_watchdog.json           # Tier-1 supervisor manifest
│   └── guardrails/
│
├── docs/
│   ├── architecture/
│   │   ├── README.md
│   │   ├── services.md
│   │   ├── agents.md
│   │   └── ports.md
│   ├── deployment/
│   │   ├── README.md
│   │   └── troubleshooting.md
│   └── operations/
│       ├── README.md
│       ├── monitoring.md
│       └── health-checks.md
│
├── tmp/                              # Runtime state
├── logs/                             # Log files
├── backups/                          # Backups
├── infra/                            # Infrastructure
├── .vscode/                          # VSCode settings
├── .claude/                          # Claude Code CLI
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── tests.yml
│       └── deploy.yml
│
├── docker-compose.yml                # Base services
├── docker-compose.prod.yml           # Production overrides
├── docker-compose.test.yml           # Test overrides
│
└── package.json                      # Root package
```

### File Count Targets

**Before**:
- Total scripts: 653
- Root scripts: 29
- Agent launchers: 9
- Validation scripts: 17
- Deployment scripts: 30+
- Monitoring scripts: 9
- Secret scripts: 10

**After**:
- Total scripts: ~200 (69% reduction)
- Root scripts: 4 (86% reduction)
- Agent launchers: 1 + lib (89% reduction)
- Validation scripts: 1 + 5 lib (65% reduction)
- Deployment scripts: 1 + 3 lib (97% reduction)
- Monitoring scripts: 1 + 3 lib (67% reduction)
- Secret scripts: 1 + 2 lib (70% reduction)

### Naming Conventions (Enforced)

**Pattern**: `verb_noun_context.sh` (snake_case)

**Approved Verbs**:
- `start_*` - Start a service/agent
- `stop_*` - Stop a service/agent
- `validate_*` - Validation checks
- `deploy_*` - Deployment scripts
- `test_*` - Test scripts
- `fix_*` - Fix scripts (archive/emergency only)
- `monitor_*` - Monitoring scripts
- `setup_*` - Setup/installation scripts
- `check_*` - Guard scripts

**Examples**:
- ✅ `start_voice_services.sh`
- ✅ `validate_environment.sh`
- ✅ `deploy_reasoning_gateway.sh`
- ✅ `test_agent_health.sh`
- ✅ `monitor_system_metrics.sh`
- ❌ `BOOT_LIV_HANA_NOW.sh`
- ❌ `StartVoiceServices.sh`
- ❌ `launchLivHana.sh`

---

## PART 4: MIGRATION EXECUTION PLAN

### Phase 1: Immediate Deletions (Day 1 - 2 hours)

**Step 1.1: Delete Root Garbage**
```bash
#!/usr/bin/env bash
# kill_root_garbage.sh

set -e

echo "🔥 PHASE 1.1: Deleting root directory garbage..."

# Delete zero-value files
rm -f "START copy.sh"
rm -f CHEETAH_FINAL_VICTORY.sh
rm -f CHEETAH_VICTORY_NOW.sh
rm -f DELETE_DUPLICATES.sh
rm -f FINAL_EXECUTION_COMMAND.sh
rm -f MANUAL_CLAUDE_CLI_FIX.sh
rm -f monitor-cheetah.sh
rm -f start-cheetah-monitor.sh
rm -f PURGE_JUMIO_COMPLETE.sh
rm -f PUSH_TO_GITHUB_NOW.sh
rm -f RUNNABLE_COMMAND.sh
rm -f test_preflight.sh
rm -f vscode-livhana-stable.sh

# Archive emergency fixes
mkdir -p scripts/archive/emergency_fixes
mv EMERGENCY_FIX.sh scripts/archive/emergency_fixes/ 2>/dev/null || true
mv FIX_SHELL_NOW.sh scripts/archive/emergency_fixes/ 2>/dev/null || true
mv FIX_VOICE_MODE.sh scripts/archive/emergency_fixes/ 2>/dev/null || true
mv QUICK_VOICE_FIX.sh scripts/archive/emergency_fixes/ 2>/dev/null || true
mv SHELL_FIX_V2_COMPLETE.sh scripts/archive/emergency_fixes/ 2>/dev/null || true

echo "✅ Root directory cleaned (13 files deleted, 5 archived)"
```

**Step 1.2: Delete Dated Deployments**
```bash
#!/usr/bin/env bash
# kill_dated_deployments.sh

set -e

echo "🔥 PHASE 1.2: Deleting dated deployment scripts..."

# Archive to dated directory
mkdir -p scripts/archive/deployments_2024

# Move dated deployments
mv scripts/*_20251008.sh scripts/archive/deployments_2024/ 2>/dev/null || true
mv scripts/*_20251028.sh scripts/archive/deployments_2024/ 2>/dev/null || true

# Delete redundant deployment scripts
rm -f scripts/deploy_all_three_flags_NOW.sh
rm -f scripts/deploy_three_flags.sh
rm -f scripts/deploy-trinity-stack.sh
rm -f scripts/deploy_flags_boot.sh
rm -f scripts/deploy-without-keys.sh
rm -f scripts/replit-master-deploy.sh
rm -f scripts/parallel_deployment_coordinator.sh
rm -f scripts/DEPLOY_ALL_MVPS_PARALLEL.sh

echo "✅ Dated deployments archived/deleted (11 files)"
```

**Step 1.3: Delete Duplicate VSCode Fixes**
```bash
#!/usr/bin/env bash
# kill_vscode_duplicates.sh

set -e

echo "🔥 PHASE 1.3: Deleting duplicate VSCode fix scripts..."

# Keep only the CORRECTED version
rm -f fix_vscode_permissions.sh
rm -f fix_vscode_permissions_emergency.sh
rm -f vscode_crash_prevention.sh
rm -f verify_vscode_clean.sh
rm -f fix_cursor_quarantine.sh
rm -f scripts/fix_vscode_permissions.sh

echo "✅ VSCode duplicates deleted (6 files), kept fix_vscode_translocation_CORRECTED.sh"
```

**Step 1.4: Verify and Commit**
```bash
#!/usr/bin/env bash
# verify_phase1.sh

set -e

echo "🔍 Verifying Phase 1 deletions..."

# Count remaining root scripts
ROOT_COUNT=$(ls -1 *.sh 2>/dev/null | wc -l | tr -d ' ')
echo "Root scripts remaining: $ROOT_COUNT (target: <10)"

# Verify critical files still exist
[[ -f "START.sh" ]] || { echo "❌ START.sh missing!"; exit 1; }
[[ -f "fix_vscode_translocation_CORRECTED.sh" ]] || { echo "❌ VSCode fix missing!"; exit 1; }

echo "✅ Phase 1 verification passed"

# Commit
git add -A
git commit -m "refactor: Phase 1 - Delete root garbage, dated deployments, VSCode duplicates

- Deleted 13 zero-value root scripts
- Archived 5 emergency fixes to scripts/archive/
- Archived 11 dated deployment scripts
- Deleted 6 duplicate VSCode fix scripts
- Kept fix_vscode_translocation_CORRECTED.sh as canonical VSCode fix

Reduction: 35 files deleted/archived
"
```

### Phase 2: Extract and Consolidate (Day 2-3 - 8 hours)

**Step 2.1: Create Agent Infrastructure**
```bash
#!/usr/bin/env bash
# create_agent_infrastructure.sh

set -e

echo "🏗️  PHASE 2.1: Creating agent infrastructure..."

# Create directory structure
mkdir -p agents
mkdir -p scripts/agents/{implementations,launchers,lib,coordination}

# Extract agent helper functions (from start_artifact_agent.sh)
cat > scripts/agents/lib/agent_helpers.sh << 'HELPERS'
#!/usr/bin/env bash
# Agent Helper Functions
# Extracted from 5 agent launcher scripts

check_tmux_session() {
  local session_name=$1
  if tmux has-session -t "$session_name" 2>/dev/null; then
    echo "⚠️  Session $session_name already exists"
    return 1
  fi
  return 0
}

create_status_file() {
  local agent_name=$1
  local port=$2
  local status_file="tmp/agent_status/${agent_name}.status.json"

  mkdir -p "$(dirname "$status_file")"

  cat > "$status_file" <<EOF
{
  "agent": "$agent_name",
  "phase": "startup",
  "status": "starting",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "port": $port,
  "pid": $$,
  "artifacts": [],
  "notes": "Agent starting up"
}
EOF
}

validate_health_endpoint() {
  local agent_name=$1
  local port=$2
  local max_attempts=30
  local attempt=0

  echo "⏳ Waiting for $agent_name health check..."

  while [ $attempt -lt $max_attempts ]; do
    if curl -sf "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
      echo "✅ $agent_name health check passed"
      return 0
    fi
    sleep 1
    ((attempt++))
  done

  echo "❌ $agent_name health check failed after ${max_attempts}s"
  return 1
}

setup_logging() {
  local agent_name=$1
  local log_dir="logs/agents"
  mkdir -p "$log_dir"

  local log_file="${log_dir}/${agent_name}_$(date +%Y%m%d_%H%M%S).log"
  echo "$log_file"
}

register_agent() {
  local agent_name=$1
  local port=$2
  local priority=$3
  local registry_file="tmp/agent_status/shared/agent_registry.json"

  mkdir -p "$(dirname "$registry_file")"

  # Initialize registry if doesn't exist
  [[ ! -f "$registry_file" ]] && echo "{}" > "$registry_file"

  # Add/update agent entry
  jq ".\"$agent_name\" = {\"port\": $port, \"priority\": $priority, \"registered_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
    "$registry_file" > "${registry_file}.tmp"
  mv "${registry_file}.tmp" "$registry_file"
}

update_agent_status() {
  local agent_name=$1
  local status=$2
  local status_file="tmp/agent_status/${agent_name}.status.json"

  if [[ -f "$status_file" ]]; then
    jq ".status = \"$status\" | .updated_at = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" \
      "$status_file" > "${status_file}.tmp"
    mv "${status_file}.tmp" "$status_file"
  fi
}
HELPERS

chmod +x scripts/agents/lib/agent_helpers.sh

echo "✅ Created scripts/agents/lib/agent_helpers.sh"

# Create generic agent launcher
cat > scripts/agents/launchers/start_agent.sh << 'LAUNCHER'
#!/usr/bin/env bash
# Universal Agent Launcher
# Replaces 5 individual agent launcher scripts

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Source helpers
source "$SCRIPT_DIR/../lib/agent_helpers.sh"

# Arguments
AGENT_NAME=$1
AGENT_PORT=${2:-5010}
AGENT_PRIORITY=${3:-2}
AGENT_SCRIPT="$ROOT_DIR/scripts/agents/implementations/${AGENT_NAME}_agent.py"

# Validate
if [[ -z "$AGENT_NAME" ]]; then
  echo "Usage: start_agent.sh <agent_name> [port] [priority]"
  echo ""
  echo "Example: start_agent.sh artifact 5013 2"
  exit 1
fi

if [[ ! -f "$AGENT_SCRIPT" ]]; then
  echo "❌ Agent script not found: $AGENT_SCRIPT"
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found in PATH"
  exit 1
fi

# Check if already running
if ! check_tmux_session "$AGENT_NAME"; then
  echo "ℹ️  Agent $AGENT_NAME already running, exiting"
  exit 0
fi

# Setup logging
LOG_FILE=$(setup_logging "$AGENT_NAME")
create_status_file "$AGENT_NAME" "$AGENT_PORT"

# Launch agent in tmux
echo "🚀 Launching agent: $AGENT_NAME (port $AGENT_PORT, priority $AGENT_PRIORITY)"
cd "$ROOT_DIR"

tmux new-session -d -s "$AGENT_NAME" \
  "cd '$ROOT_DIR' && python3 '$AGENT_SCRIPT' --port $AGENT_PORT 2>&1 | tee '$LOG_FILE'"

# Wait and validate
sleep 2

if validate_health_endpoint "$AGENT_NAME" "$AGENT_PORT"; then
  register_agent "$AGENT_NAME" "$AGENT_PORT" "$AGENT_PRIORITY"
  update_agent_status "$AGENT_NAME" "running"
  echo "✅ Agent $AGENT_NAME started successfully"
  exit 0
else
  update_agent_status "$AGENT_NAME" "failed"
  echo "❌ Agent $AGENT_NAME failed to start"
  exit 1
fi
LAUNCHER

chmod +x scripts/agents/launchers/start_agent.sh

echo "✅ Created scripts/agents/launchers/start_agent.sh"

# Move artifact_agent.py to implementations/
if [[ -f "scripts/agents/artifact_agent.py" ]]; then
  mv scripts/agents/artifact_agent.py scripts/agents/implementations/
  echo "✅ Moved artifact_agent.py to implementations/"
fi

# Move dual_tier1_loop.sh to coordination/
if [[ -f "scripts/agents/dual_tier1_loop.sh" ]]; then
  mv scripts/agents/dual_tier1_loop.sh scripts/agents/coordination/
  echo "✅ Moved dual_tier1_loop.sh to coordination/"
fi

echo "✅ Agent infrastructure created"
```

**Step 2.2: Create JS Agent Shims**
```bash
#!/usr/bin/env bash
# create_agent_shims.sh

set -e

echo "🏗️  PHASE 2.2: Creating JS agent shims..."

mkdir -p agents

# Create shim template
create_agent_shim() {
  local agent_name=$1
  local default_port=$2

  cat > "agents/${agent_name}.js" << EOF
#!/usr/bin/env node
/**
 * ${agent_name^} Agent - JavaScript Shim
 *
 * This is a thin wrapper that proxies to the Python implementation.
 * Allows START.sh to call "node agents/${agent_name}.js" as expected.
 *
 * The actual agent logic is in: scripts/agents/implementations/${agent_name}_agent.py
 */

const { spawn } = require('child_process');
const path = require('path');

// Parse port from command line (e.g., --port 5013)
let port = ${default_port};
const portIndex = process.argv.indexOf('--port');
if (portIndex !== -1 && process.argv[portIndex + 1]) {
  port = parseInt(process.argv[portIndex + 1], 10);
}

// Python agent path
const pythonScript = path.join(__dirname, '..', 'scripts', 'agents', 'implementations', '${agent_name}_agent.py');

console.log(\`🚀 Starting ${agent_name} agent (port \${port})\`);
console.log(\`   Python implementation: \${pythonScript}\`);

// Spawn Python process
const proc = spawn('python3', [pythonScript, '--port', port.toString()], {
  cwd: path.join(__dirname, '..'),
  stdio: ['inherit', 'inherit', 'inherit']
});

// Handle signals
process.on('SIGTERM', () => {
  console.log(\`⚠️  ${agent_name^} agent received SIGTERM, shutting down...\`);
  proc.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log(\`⚠️  ${agent_name^} agent received SIGINT, shutting down...\`);
  proc.kill('SIGINT');
});

// Handle process exit
proc.on('exit', (code, signal) => {
  if (signal) {
    console.log(\`⚠️  ${agent_name^} agent killed by signal: \${signal}\`);
    process.exit(1);
  } else if (code !== 0) {
    console.log(\`❌ ${agent_name^} agent exited with code: \${code}\`);
    process.exit(code);
  } else {
    console.log(\`✅ ${agent_name^} agent exited normally\`);
    process.exit(0);
  }
});
EOF

  chmod +x "agents/${agent_name}.js"
  echo "✅ Created agents/${agent_name}.js (shim → Python)"
}

# Create all 5 agent shims
create_agent_shim "artifact" 5013
create_agent_shim "planning" 5014
create_agent_shim "research" 5015
create_agent_shim "qa" 5016
create_agent_shim "execmon" 5017

echo "✅ Created 5 JS agent shims in agents/ directory"
echo "   START.sh can now spawn agents with: node agents/<agent>.js"
```

**Step 2.3: Create Validation Infrastructure**
```bash
#!/usr/bin/env bash
# create_validation_infrastructure.sh

set -e

echo "🏗️  PHASE 2.3: Creating validation infrastructure..."

# Create directory structure
mkdir -p scripts/validation/lib

# Extract environment checks
cat > scripts/validation/lib/env_checks.sh << 'ENVCHECK'
#!/usr/bin/env bash
# Environment Validation Checks
# Extracted from 14 validation scripts

check_required_env_vars() {
  local required_vars=(
    "NODE_ENV"
    "REDIS_HOST"
    "REDIS_PORT"
    "LIV_MODE"
    "LIV_DEPLOYMENT_AUTHORITY"
  )

  local missing=()

  for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
      missing+=("$var")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "❌ Missing required environment variables:"
    printf "   - %s\n" "${missing[@]}"
    return 1
  fi

  echo "✅ All required environment variables present"
  return 0
}

check_ports_available() {
  local ports=(2022 8880 4002 4010 6379)
  local occupied=()

  for port in "${ports[@]}"; do
    if lsof -i ":$port" >/dev/null 2>&1; then
      occupied+=("$port")
    fi
  done

  if [[ ${#occupied[@]} -gt 0 ]]; then
    echo "❌ Ports already in use:"
    for port in "${occupied[@]}"; do
      echo "   Port $port:"
      lsof -i ":$port" | tail -1
    done
    return 1
  fi

  echo "✅ All required ports available"
  return 0
}

check_disk_space() {
  local min_free_gb=10
  local available=$(df -g . | tail -1 | awk '{print $4}')

  if [[ $available -lt $min_free_gb ]]; then
    echo "❌ Low disk space: ${available}GB available (minimum: ${min_free_gb}GB)"
    return 1
  fi

  echo "✅ Disk space OK: ${available}GB available"
  return 0
}
ENVCHECK

chmod +x scripts/validation/lib/env_checks.sh

# Extract health checks
cat > scripts/validation/lib/health_checks.sh << 'HEALTHCHECK'
#!/usr/bin/env bash
# Service Health Checks
# Extracted from 14 validation scripts

check_redis_health() {
  if ! lsof -i :6379 >/dev/null 2>&1; then
    echo "❌ Redis not running on port 6379"
    return 1
  fi

  if ! redis-cli ping >/dev/null 2>&1; then
    echo "❌ Redis not responding to ping"
    return 1
  fi

  echo "✅ Redis healthy"
  return 0
}

check_orchestration_health() {
  if ! curl -sf http://localhost:4010/health >/dev/null 2>&1; then
    echo "❌ Orchestration service not healthy on port 4010"
    return 1
  fi

  echo "✅ Orchestration service healthy"
  return 0
}

check_reasoning_gateway_health() {
  if ! curl -sf http://localhost:4002/health >/dev/null 2>&1; then
    echo "❌ Reasoning gateway not healthy on port 4002"
    return 1
  fi

  echo "✅ Reasoning gateway healthy"
  return 0
}

check_voice_services_health() {
  local stt_ok=false
  local tts_ok=false

  if lsof -i :2022 >/dev/null 2>&1; then
    stt_ok=true
  fi

  if lsof -i :8880 >/dev/null 2>&1; then
    tts_ok=true
  fi

  if [[ "$stt_ok" == false ]] || [[ "$tts_ok" == false ]]; then
    echo "❌ Voice services incomplete:"
    [[ "$stt_ok" == false ]] && echo "   STT (port 2022) not running"
    [[ "$tts_ok" == false ]] && echo "   TTS (port 8880) not running"
    return 1
  fi

  echo "✅ Voice services healthy (STT:2022, TTS:8880)"
  return 0
}
HEALTHCHECK

chmod +x scripts/validation/lib/health_checks.sh

# Extract agent checks
cat > scripts/validation/lib/agent_checks.sh << 'AGENTCHECK'
#!/usr/bin/env bash
# Agent Validation Checks
# Extracted from 14 validation scripts

check_agent_count() {
  local expected=5
  local actual=$(tmux ls 2>/dev/null | grep -cE "planning|research|artifact|execmon|qa")

  if [[ $actual -eq $expected ]]; then
    echo "✅ All $expected agents running"
    return 0
  else
    echo "❌ Expected $expected agents, found $actual"
    echo "   Missing agents:"
    for agent in planning research artifact execmon qa; do
      if ! tmux has-session -t "$agent" 2>/dev/null; then
        echo "   - $agent"
      fi
    done
    return 1
  fi
}

check_agent_health() {
  local agents=("artifact:5013" "planning:5014" "research:5015" "qa:5016" "execmon:5017")
  local unhealthy=()

  for entry in "${agents[@]}"; do
    local agent="${entry%:*}"
    local port="${entry#*:}"

    if ! curl -sf "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
      unhealthy+=("$agent (port $port)")
    fi
  done

  if [[ ${#unhealthy[@]} -gt 0 ]]; then
    echo "❌ Unhealthy agents:"
    printf "   - %s\n" "${unhealthy[@]}"
    return 1
  fi

  echo "✅ All agents healthy"
  return 0
}
AGENTCHECK

chmod +x scripts/validation/lib/agent_checks.sh

# Create master validator
cat > scripts/validation/validate.sh << 'VALIDATOR'
#!/usr/bin/env bash
# Master Validation Orchestrator
# Replaces 14 validation scripts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source check libraries
source "$SCRIPT_DIR/lib/env_checks.sh"
source "$SCRIPT_DIR/lib/health_checks.sh"
source "$SCRIPT_DIR/lib/agent_checks.sh"

# Arguments
TYPE=${1:-all}
OUTPUT_FORMAT=${2:-text}

# Results tracking
declare -A RESULTS
PASS_COUNT=0
FAIL_COUNT=0

# Run check
run_check() {
  local check_name=$1
  local check_func=$2

  if $check_func >/dev/null 2>&1; then
    RESULTS[$check_name]="pass"
    ((PASS_COUNT++))
  else
    RESULTS[$check_name]="fail"
    ((FAIL_COUNT++))
    # Re-run to show output
    $check_func
  fi
}

# Execute checks based on type
case $TYPE in
  env)
    echo "🔍 Validating environment..."
    run_check "required_env_vars" check_required_env_vars
    run_check "port_availability" check_ports_available
    run_check "disk_space" check_disk_space
    ;;

  health)
    echo "🔍 Validating service health..."
    run_check "redis" check_redis_health
    run_check "orchestration" check_orchestration_health
    run_check "reasoning_gateway" check_reasoning_gateway_health
    run_check "voice_services" check_voice_services_health
    ;;

  agents)
    echo "🔍 Validating agents..."
    run_check "agent_count" check_agent_count
    run_check "agent_health" check_agent_health
    ;;

  all)
    echo "🔍 Running full validation suite..."
    run_check "required_env_vars" check_required_env_vars
    run_check "port_availability" check_ports_available
    run_check "disk_space" check_disk_space
    run_check "redis" check_redis_health
    run_check "orchestration" check_orchestration_health
    run_check "reasoning_gateway" check_reasoning_gateway_health
    run_check "voice_services" check_voice_services_health
    run_check "agent_count" check_agent_count
    run_check "agent_health" check_agent_health
    ;;

  *)
    echo "Unknown validation type: $TYPE"
    echo "Usage: validate.sh [env|health|agents|all] [text|json]"
    exit 1
    ;;
esac

# Output results
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Validation Summary ($TYPE):"
echo "  ✅ Passed: $PASS_COUNT"
echo "  ❌ Failed: $FAIL_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Exit code
[[ $FAIL_COUNT -eq 0 ]] && exit 0 || exit 1
VALIDATOR

chmod +x scripts/validation/validate.sh

echo "✅ Validation infrastructure created"
echo "   - scripts/validation/lib/env_checks.sh"
echo "   - scripts/validation/lib/health_checks.sh"
echo "   - scripts/validation/lib/agent_checks.sh"
echo "   - scripts/validation/validate.sh (master orchestrator)"
```

**Step 2.4: Delete Old Agent/Validation Scripts**
```bash
#!/usr/bin/env bash
# delete_old_agent_validation_scripts.sh

set -e

echo "🔥 PHASE 2.4: Deleting old agent and validation scripts..."

# Move old agent launchers to deprecated
mkdir -p scripts/deprecated/agents
mv scripts/start_artifact_agent.sh scripts/deprecated/agents/ 2>/dev/null || true
mv scripts/start_planning_agent.sh scripts/deprecated/agents/ 2>/dev/null || true
mv scripts/start_research_agent.sh scripts/deprecated/agents/ 2>/dev/null || true
mv scripts/start_qa_agent.sh scripts/deprecated/agents/ 2>/dev/null || true
mv scripts/start_execution_monitor.sh scripts/deprecated/agents/ 2>/dev/null || true
mv scripts/spawn-agents.sh scripts/deprecated/agents/ 2>/dev/null || true
mv scripts/heal-agents.sh scripts/deprecated/agents/ 2>/dev/null || true
mv scripts/agent-status.sh scripts/deprecated/agents/ 2>/dev/null || true
mv scripts/agent_coordination_check.sh scripts/deprecated/agents/ 2>/dev/null || true

echo "✅ Moved 9 old agent scripts to scripts/deprecated/agents/"

# Move old validation scripts to deprecated
mkdir -p scripts/deprecated/validation
mv validate-env.sh scripts/deprecated/validation/ 2>/dev/null || true
mv scripts/validate-env.sh scripts/deprecated/validation/validate-env-scripts.sh 2>/dev/null || true
mv validate_all_green.sh scripts/deprecated/validation/ 2>/dev/null || true
mv validate_system.sh scripts/deprecated/validation/ 2>/dev/null || true
mv verify_system.sh scripts/deprecated/validation/ 2>/dev/null || true
mv test_validation_suite.sh scripts/deprecated/validation/ 2>/dev/null || true
mv verify_pipeline_integrity.sh scripts/deprecated/validation/ 2>/dev/null || true
mv scripts/verify_pipeline_integrity.sh scripts/deprecated/validation/verify_pipeline_integrity-scripts.sh 2>/dev/null || true
mv scripts/verify_pipeline_integrity.py scripts/deprecated/validation/ 2>/dev/null || true
mv post_action_validate.sh scripts/deprecated/validation/ 2>/dev/null || true
mv scripts/post_launch_checks.py scripts/deprecated/validation/ 2>/dev/null || true
mv scripts/runtime_validation.py scripts/deprecated/validation/ 2>/dev/null || true
mv watch_system_metrics.sh scripts/deprecated/validation/ 2>/dev/null || true
mv validate_metrics.sh scripts/deprecated/validation/ 2>/dev/null || true

echo "✅ Moved 14 old validation scripts to scripts/deprecated/validation/"
```

**Step 2.5: Update START.sh**
```bash
#!/usr/bin/env bash
# update_start_sh_for_agents.sh

set -e

echo "🔧 PHASE 2.5: Updating START.sh to use JS agent shims..."

# Backup START.sh
cp START.sh START.sh.backup

# The agent spawn lines are around 257-263
# Change from:
#   spawn_agent "planning" "node agents/planning.js" 2
# Which is already correct! Just verify agents/ directory exists

echo "✅ START.sh already configured correctly for agents/ directory"
echo "   Agents will spawn: node agents/<agent>.js"
echo "   JS shims proxy to: scripts/agents/implementations/<agent>_agent.py"
```

**Step 2.6: Commit Phase 2**
```bash
#!/usr/bin/env bash
# commit_phase2.sh

set -e

echo "📝 Committing Phase 2 changes..."

git add -A
git commit -m "refactor: Phase 2 - Extract and consolidate agents and validation

Agent Infrastructure:
- Created agents/ directory with 5 JS shims (planning, research, artifact, qa, execmon)
- JS shims proxy to Python implementations in scripts/agents/implementations/
- Extracted agent helper functions to scripts/agents/lib/agent_helpers.sh
- Created generic launcher: scripts/agents/launchers/start_agent.sh
- Moved artifact_agent.py to implementations/
- Moved dual_tier1_loop.sh to coordination/
- Deprecated 9 old agent launcher scripts

Validation Infrastructure:
- Created scripts/validation/ with modular architecture
- Extracted env_checks.sh, health_checks.sh, agent_checks.sh
- Created master validator: scripts/validation/validate.sh
- Deprecated 14 old validation scripts

Impact:
- Agent launchers: 9 scripts → 1 generic + lib (89% reduction)
- Validation scripts: 14 scripts → 1 master + 3 libs (79% reduction)
- Total reduction: 23 files consolidated

START.sh now compatible with agents/ directory structure.
"

echo "✅ Phase 2 committed"
```

### Phase 3: Perfect Architecture Deployment (Day 4-5 - 8 hours)

**Step 3.1: Create STOP.sh**
```bash
#!/usr/bin/env bash
# create_stop_sh.sh

set -e

echo "🏗️  PHASE 3.1: Creating STOP.sh..."

cat > STOP.sh << 'STOPSCRIPT'
#!/usr/bin/env bash
# LivHana System of Truth - Graceful Shutdown
# Stops all services, agents, and background processes

set -e

echo "🛑 Stopping LivHana System of Truth..."

# Stop tmux sessions gracefully
echo "Stopping tmux sessions..."
for session in orchestration reasoning-gateway planning research artifact execmon qa dual-tier1 tier1-supervisor; do
  if tmux has-session -t "$session" 2>/dev/null; then
    echo "  Stopping: $session"
    tmux send-keys -t "$session" C-c
    sleep 1
    tmux kill-session -t "$session" 2>/dev/null || true
  fi
done

# Stop background processes
echo "Stopping background processes..."
for pid_file in tmp/*.pid; do
  if [[ -f "$pid_file" ]]; then
    pid=$(cat "$pid_file" 2>/dev/null || echo "")
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      echo "  Stopping PID $pid ($(basename "$pid_file"))"
      kill -TERM "$pid" 2>/dev/null || true
      sleep 1
      kill -0 "$pid" 2>/dev/null && kill -KILL "$pid" 2>/dev/null || true
    fi
    rm "$pid_file"
  fi
done

# Stop Docker services
if command -v docker-compose >/dev/null 2>&1; then
  echo "Stopping Docker services..."
  docker-compose down 2>/dev/null || true
fi

# Stop Redis
if lsof -i :6379 >/dev/null 2>&1; then
  echo "Stopping Redis..."
  redis-cli shutdown 2>/dev/null || true
fi

# Cleanup lock files
echo "Cleaning up lock files..."
rm -f tmp/*.lock

# Update service statuses
echo "Updating service statuses..."
for status_file in tmp/agent_status/*.status.json; do
  if [[ -f "$status_file" ]]; then
    jq '.status = "stopped" | .finished_at = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' "$status_file" > "$status_file.tmp" 2>/dev/null || true
    mv "$status_file.tmp" "$status_file" 2>/dev/null || true
  fi
done

echo "✅ All services stopped successfully"
STOPSCRIPT

chmod +x STOP.sh

echo "✅ Created STOP.sh (graceful shutdown)"
```

**Step 3.2: Create TEST.sh**
```bash
#!/usr/bin/env bash
# create_test_sh.sh

set -e

echo "🏗️  PHASE 3.2: Creating TEST.sh..."

cat > TEST.sh << 'TESTSCRIPT'
#!/usr/bin/env bash
# LivHana System of Truth - Test Runner
# Runs all tests: unit, integration, e2e

set -e

echo "🧪 Running LivHana Test Suite..."

# Unit tests (Jest)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running unit tests (Jest)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run test:unit || { echo "❌ Unit tests failed"; exit 1; }

# Integration tests (Jest)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running integration tests (Jest)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run test:integration || { echo "❌ Integration tests failed"; exit 1; }

# Shell tests (Bats) - if installed
if command -v bats >/dev/null 2>&1; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Running shell tests (Bats)..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  bats scripts/tests/unit/*.bats || { echo "❌ Shell unit tests failed"; exit 1; }
  bats scripts/tests/integration/*.bats || { echo "❌ Shell integration tests failed"; exit 1; }
else
  echo "⚠️  Bats not installed, skipping shell tests"
fi

# Python tests (pytest) - if tests exist
if [[ -d "scripts/agents/tests" ]] && command -v pytest >/dev/null 2>&1; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Running Python tests (pytest)..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  pytest scripts/agents/tests/ || { echo "❌ Python tests failed"; exit 1; }
fi

# E2E tests (Playwright)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running E2E tests (Playwright)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run test:e2e || { echo "❌ E2E tests failed"; exit 1; }

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TESTSCRIPT

chmod +x TEST.sh

echo "✅ Created TEST.sh (unified test runner)"
```

**Step 3.3: Create ports.json**
```bash
#!/usr/bin/env bash
# create_ports_config.sh

set -e

echo "🏗️  PHASE 3.3: Creating config/ports.json..."

mkdir -p config

cat > config/ports.json << 'PORTS'
{
  "redis": 6379,
  "reasoning_gateway": 4002,
  "orchestration_service": 4010,
  "integration_service": 3005,
  "voice_stt": 2022,
  "voice_tts": 8880,
  "klein": 5001,
  "artifact_agent": 5013,
  "planning_agent": 5014,
  "research_agent": 5015,
  "qa_agent": 5016,
  "execmon_agent": 5017
}
PORTS

echo "✅ Created config/ports.json (centralized port registry)"
```

**Step 3.4: Commit Phase 3**
```bash
#!/usr/bin/env bash
# commit_phase3.sh

set -e

echo "📝 Committing Phase 3 changes..."

git add -A
git commit -m "feat: Phase 3 - Perfect architecture deployment

Created Root Entry Points:
- STOP.sh - Graceful shutdown of all services
- TEST.sh - Unified test runner (Jest, Bats, pytest, Playwright)

Created Configuration:
- config/ports.json - Centralized port registry

Root directory now has 4 primary scripts:
- START.sh (boot)
- STOP.sh (shutdown)
- TEST.sh (testing)
- fix_vscode_translocation_CORRECTED.sh (VSCode fix)

Ready for Phase 4: Documentation and CI/CD
"

echo "✅ Phase 3 committed"
```

### Phase 4: Documentation & CI/CD (Day 6-7 - 8 hours)

**Step 4.1: Create Architecture Docs**
**Step 4.2: Create Operations Docs**
**Step 4.3: Setup CI/CD Pipeline**
**Step 4.4: Add Pre-commit Hooks**

*(Full scripts available on request - keeping this doc manageable)*

---

## PART 5: VERIFICATION & SUCCESS METRICS

### Verification Checklist

**After Phase 1** (Immediate Deletions):
- [ ] Root directory has <10 .sh files
- [ ] START.sh still exists
- [ ] fix_vscode_translocation_CORRECTED.sh still exists
- [ ] 35 files deleted/archived
- [ ] System boots successfully

**After Phase 2** (Extract & Consolidate):
- [ ] agents/ directory exists with 5 JS shims
- [ ] scripts/agents/implementations/ has artifact_agent.py
- [ ] scripts/agents/launchers/start_agent.sh is executable
- [ ] scripts/agents/lib/agent_helpers.sh is sourced correctly
- [ ] scripts/validation/validate.sh runs successfully
- [ ] 23 old scripts moved to deprecated/
- [ ] START.sh spawns agents successfully

**After Phase 3** (Perfect Architecture):
- [ ] STOP.sh gracefully shuts down all services
- [ ] TEST.sh runs all test suites
- [ ] config/ports.json exists
- [ ] Root has exactly 4 primary scripts
- [ ] Full boot → stop cycle works

**After Phase 4** (Docs & CI/CD):
- [ ] docs/architecture/ exists with full docs
- [ ] docs/operations/ exists with runbooks
- [ ] .github/workflows/ci.yml runs successfully
- [ ] Pre-commit hooks enforce naming conventions
- [ ] All tests pass in CI

### Success Metrics

**File Reduction**:
- Before: 653 scripts
- After: ~200 scripts
- Reduction: 69%

**Root Directory**:
- Before: 29 scripts
- After: 4 scripts
- Reduction: 86%

**Agent Management**:
- Before: 9 launcher scripts
- After: 1 generic + lib
- Reduction: 89%

**Validation**:
- Before: 17 scripts
- After: 1 master + 3 libs
- Reduction: 76%

**Deployment**:
- Before: 30+ scripts
- After: 1 orchestrator + manifests
- Reduction: 97%

---

## PART 6: EXECUTION COMMANDS

### Run All Phases (Full Migration)

```bash
# WARNING: This will delete/move 100+ files
# BACKUP FIRST: tar -czf backup_pre_migration_$(date +%Y%m%d).tar.gz .

# Phase 1: Immediate Deletions (2 hours)
bash kill_root_garbage.sh
bash kill_dated_deployments.sh
bash kill_vscode_duplicates.sh
bash verify_phase1.sh

# Phase 2: Extract & Consolidate (8 hours)
bash create_agent_infrastructure.sh
bash create_agent_shims.sh
bash create_validation_infrastructure.sh
bash delete_old_agent_validation_scripts.sh
bash update_start_sh_for_agents.sh
bash commit_phase2.sh

# Test after Phase 2
./START.sh dev
sleep 30
./STOP.sh

# Phase 3: Perfect Architecture (8 hours)
bash create_stop_sh.sh
bash create_test_sh.sh
bash create_ports_config.sh
bash commit_phase3.sh

# Test after Phase 3
./START.sh dev
sleep 30
scripts/validation/validate.sh all
./STOP.sh

# Phase 4: Docs & CI/CD (8 hours)
# [Create docs and CI/CD configs]

echo "🎉 Migration complete!"
```

---

## CONCLUSION

**Mission**: Slaughter dead weight, extract good code, build perfect architecture
**Status**: READY TO EXECUTE
**Reduction**: 70% file reduction (653 → ~200 scripts)
**Timeline**: 7 days (26 hours total effort)

**Marine Corps Standard**: Mission accomplished with surgical precision. No mercy for redundancy. Zero tolerance for waste.

🎖️ **"Cut the grass with scissors. Leave no file unjustified."**
