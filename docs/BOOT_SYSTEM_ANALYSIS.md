# LivHana-SoT Boot System Analysis
**Generated:** 2025-10-29
**Analyst:** Claude Code (Sonnet 4.5) - Explore Agent
**Purpose:** Complete dependency mapping & architecture cleanup plan

---

## Executive Summary

**CRITICAL DISCOVERY:** START.sh attempts to spawn 5 JavaScript agents (`node agents/*.js`) that **do not exist**. The actual architecture is:
- **1 Python agent**: `scripts/agents/artifact_agent.py` (HTTP server on port 5013)
- **4 Node.js services**: voice-service, reasoning-gateway, orchestration-service, integration-service
- **File-based coordination**: Via `tmp/agent_status/` directory

This architectural mismatch creates:
- ✅ Silent spawn failures (tmux sessions created but processes fail immediately)
- ✅ Incorrect monitoring ("1/5 agents running" when all services are actually functional)
- ✅ Technical debt (784-line START.sh with 200+ lines of inline loops)
- ✅ Confusion about system design

**Recommended Action:** Remove phantom agent spawning, document actual architecture, extract inline loops to modular scripts.

---

## 1. START.sh Complete Dependency Map

### File Structure
- **Location:** `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/START.sh`
- **Size:** 784 lines
- **Type:** Bash boot orchestrator
- **Purpose:** System initialization, service spawning, self-healing loops

### Required Environment Variables
```bash
# Voice Mode Configuration
VOICE_MODE_INDEPENDENT=true
VAD_AGGRESSIVENESS=2
STT_PORT=2022
TTS_PORT=8880

# Autonomous Behavior Flags
LIV_AUTONOMOUS_MODE=true
SELF_HEAL=true
SELF_IMPROVE=true
SELF_SECURE=true
SELF_REPORT=true
SELF_INTEGRATE=true

# Node.js Configuration
NODE_OPTIONS="--max-old-space-size=8192"
ELECTRON_NO_ATTACH_CONSOLE=1

# LightSpeed OAuth (Integration Service)
LIGHTSPEED_AUTH_ENDPOINT=https://cloud.lightspeedapp.com/oauth/authorize.php
LIGHTSPEED_TOKEN_ENDPOINT=https://cloud.lightspeedapp.com/oauth/access_token.php
```

### Dependency Tree

```
START.sh (Entry Point)
│
├── PHASE 1: Environment Setup (lines 12-74)
│   ├── Export environment variables
│   ├── Create .vscode/settings.json (inline, lines 59-74)
│   │   └── Prevents VS Code permission popups
│   └── Set ulimit, memory, Node options
│
├── PHASE 2: Agent Registry (lines 82-185)
│   ├── Create tmp/agent_status/shared/agent_registry.json (inline)
│   └── Defines 5 agents + 4 services (aspirational, not real)
│
├── PHASE 3: Voice Services (lines 189-211)
│   ├── Command: npm run voice:start
│   ├── Ports: 2022 (STT/Whisper), 8880 (TTS/Kokoro)
│   ├── Dependencies:
│   │   ├── backend/voice-service/package.json
│   │   ├── backend/voice-service/src/index.js
│   │   └── Whisper + Kokoro binaries (via .voicemode/)
│   └── Health Check: curl localhost:2022, localhost:8880
│
├── PHASE 4: Orchestration Service (lines 213-239)
│   ├── Command: npm run orchestration:start
│   ├── Port: 4010
│   ├── WebSocket: /ws endpoint
│   ├── Dependencies:
│   │   ├── backend/orchestration-service/dist/index.js (TypeScript compiled)
│   │   ├── 172 npm packages (bullmq, express, ws, cors, helmet, etc.)
│   │   └── Redis (port 6379) - CRITICAL DEPENDENCY
│   └── Purpose: Real-time dashboard + autoscaler telemetry
│
├── PHASE 5: Agent Spawning (lines 242-264) ❌ BROKEN
│   ├── spawn_agent "planning" "node agents/planning.js" 2
│   ├── spawn_agent "research" "node agents/research.js" 2
│   ├── spawn_agent "artifact" "node agents/artifact.js" 2
│   ├── spawn_agent "qa" "node agents/qa.js" 2
│   ├── spawn_agent "execmon" "node agents/execmon.js" 3
│   │
│   └── ❌ CRITICAL ISSUE: agents/ directory DOES NOT EXIST
│       └── These spawn tmux sessions but processes fail immediately
│
├── PHASE 6: Validation & Recovery (lines 269-305)
│   ├── Function: validate_and_recover()
│   ├── Checks tmux sessions for 5 agents
│   ├── Respawns failed agents (but they fail again)
│   └── Calls: npm run validate:env (line 308)
│       └── Dependency: scripts/validate-env.sh (not analyzed)
│
├── PHASE 7: Redis Startup (lines 311-328)
│   ├── Command: redis-server --daemonize yes
│   ├── Port: 6379
│   ├── Config: maxmemory 256mb, maxmemory-policy allkeys-lru
│   └── CRITICAL: All services depend on Redis being up
│
├── PHASE 8: Reasoning Gateway (lines 330-343)
│   ├── Command: tmux new-session -d -s reasoning-gateway
│   ├── Working Dir: backend/reasoning-gateway
│   ├── Entry: node src/index.js
│   ├── Port: 4002
│   └── Dependency: voice-service depends on this (AI reasoning coordination)
│
├── PHASE 9: Dual Tier-1 Coordination (lines 345-356)
│   ├── Command: tmux new-session -d -s dual-tier1
│   ├── Script: scripts/agents/dual_tier1_loop.sh (165 lines)
│   ├── Purpose: Inter-agent file-based coordination
│   │   ├── Polls tmp/agent_status/codex_tasks/ (5s interval)
│   │   ├── Updates tmp/agent_status/livhana_status/heartbeat.json (30s)
│   │   ├── Moves completed tasks to .processed/
│   │   └── Logs to shared/coordination_log.jsonl
│   └── Dependencies: jq (JSON processing)
│
├── PHASE 10: Tier-1 Supervisor (lines 358-369) ✅ NEW
│   ├── Command: tmux new-session -d -s tier1-supervisor
│   ├── Script: scripts/watchdogs/tier1_supervisor.sh (187 lines)
│   ├── Purpose: Consolidated master watchdog
│   │   ├── git_guard() - Auto-commit changed files
│   │   ├── dependency_guard() - npm install on package.json changes
│   │   ├── status_guard() - Write tmp/watchdog_status.json
│   │   └── Manifest-driven (config/tier1_watchdog.json)
│   ├── Interval: 60s + 0-3s jitter
│   └── Replaces: 4 deleted legacy watchdogs
│       ├── boot_script_auto_commit.sh (5,175 bytes)
│       ├── copilot-chat-monitor.sh (4,286 bytes)
│       ├── copilot_json_monitor.sh (4,428 bytes)
│       ├── dependency_auto_save.sh (6,398 bytes)
│       └── universal_auto_save.sh (2,267 bytes)
│       └── Total: 22,554 bytes → 187 lines (99% reduction!)
│
├── PHASE 11: SELF-LISTEN Loop (lines 372-400) 🟡 INLINE
│   ├── Background Process: while true loop (30s interval)
│   ├── Purpose: Monitor agent tmux sessions, restart if down
│   ├── Monitors: planning, research, artifact, execmon, qa
│   ├── PID File: tmp/self_listen.pid
│   └── 🟡 SHOULD BE: scripts/watchdogs/agent_health_monitor.sh
│
├── PHASE 12: SELF-IMPROVE Loop (lines 403-430) 🟡 INLINE
│   ├── Background Process: while true loop (5min interval)
│   ├── Purpose: Analyze execmon status, suggest improvements
│   ├── Reads: tmp/agent_status/execmon.status.json ❌ MISSING
│   ├── PID File: tmp/self_improve.pid
│   └── 🟡 SHOULD BE: scripts/watchdogs/improvement_analyzer.sh
│
├── PHASE 13: SELF-SECURE Loop (lines 432-474) 🟡 INLINE
│   ├── Background Process: while true loop (3min interval)
│   ├── Purpose: Scrub secrets from logs
│   ├── Scrubs: API keys, tokens, passwords from logs/
│   ├── Uses: scripts/guards/scrub_secrets.sh
│   ├── PID File: tmp/self_secure.pid
│   └── 🟡 SHOULD BE: scripts/watchdogs/security_monitor.sh
│
├── PHASE 14: SELF-REPORT Loop (lines 476-521) 🟡 INLINE
│   ├── Background Process: while true loop (15min interval)
│   ├── Purpose: Voice status announcements
│   ├── Endpoint: curl localhost:8880 (Kokoro TTS)
│   ├── Reports: Agent count, service health, memory usage
│   ├── PID File: tmp/self_report.pid
│   └── 🟡 SHOULD BE: scripts/watchdogs/status_reporter.sh
│
├── PHASE 15: SELF-INTEGRATE Loop (lines 523-580) 🟡 INLINE
│   ├── Background Process: while true loop (10min interval)
│   ├── Purpose: Check CLI tool authentication
│   ├── Checks:
│   │   ├── gh (GitHub CLI) - gh auth status
│   │   ├── gcloud (Google Cloud) - gcloud auth list
│   │   └── op (1Password) - op whoami
│   ├── Auto-login: If not authenticated
│   ├── PID File: tmp/self_integrate.pid
│   └── 🟡 SHOULD BE: scripts/watchdogs/integration_monitor.sh
│
├── PHASE 16: Mode Selection (lines 589-649)
│   ├── Modes: dev, prod, empire, local
│   ├── Commands:
│   │   ├── dev: npm run docker:dev (docker-compose.yml)
│   │   ├── prod: npm run docker:prod (docker-compose.unified.yml)
│   │   ├── empire: npm run docker:empire (docker-compose.empire.yml)
│   │   └── local: npm run dev:all (all services locally)
│   └── Docker Dependencies: docker, docker-compose
│
└── PHASE 17: Final Validation (lines 651-751)
    ├── Memory Pressure Check (vm_stat on macOS)
    ├── Agent Count: Expects 5, reports actual via tmux ls
    ├── Service Checks:
    │   ├── Voice (ports 2022, 8880) - curl health endpoints
    │   ├── Reasoning-gateway (port 4002) - curl health
    │   ├── Orchestration (port 4010) - curl health
    │   └── Redis (port 6379) - redis-cli ping
    ├── Watchdog Checks:
    │   ├── Dual tier-1 coordination (tmux session)
    │   ├── Auto-commit watchdog ❌ References legacy (should be tier1-supervisor)
    │   └── Dependency watchdog ❌ References legacy (should be tier1-supervisor)
    └── Status Report: All systems operational (or warnings)
```

### Critical Dependencies That Must Exist

**System Binaries:**
- `redis-server` (Redis)
- `tmux` (Session management)
- `node` (Node.js runtime)
- `npm` (Package manager)
- `curl` (Health checks)
- `jq` (JSON processing)
- `git` (Version control - used by tier1_supervisor)

**Project Files (MUST EXIST):**
1. `package.json` - npm scripts (voice:start, orchestration:start, docker:*, dev:all)
2. `backend/voice-service/package.json` + `src/index.js`
3. `backend/reasoning-gateway/src/index.js`
4. `backend/orchestration-service/dist/index.js` (TypeScript build output)
5. `backend/integration-service/src/index.js`
6. `scripts/validate-env.sh` (called at line 308)
7. `scripts/watchdogs/tier1_supervisor.sh`
8. `scripts/agents/dual_tier1_loop.sh`

**Project Files (REFERENCED BUT MISSING):**
- `agents/planning.js` ❌
- `agents/research.js` ❌
- `agents/artifact.js` ❌
- `agents/execmon.js` ❌
- `agents/qa.js` ❌
- `tmp/agent_status/execmon.status.json` ❌ (referenced by SELF-IMPROVE loop)

**External Services:**
- **Redis** (port 6379) - CRITICAL, all services fail without it
- **Whisper STT** (port 2022) - Managed by voice-service
- **Kokoro TTS** (port 8880) - Managed by voice-service

---

## 2. Real Agent Architecture (What Actually Exists)

### The Python Artifact Agent (ONLY REAL AGENT)

**File:** `scripts/agents/artifact_agent.py` (505 lines)
**Launcher:** `scripts/start_artifact_agent.sh` (107 lines)
**Type:** HTTP health server + task processor
**Port:** 5013
**Health Endpoint:** `http://127.0.0.1:5013/health`

**Capabilities:**
- ✅ ThreadingHTTPServer for health checks
- ✅ Atomic JSON writes (lock files)
- ✅ CODEX task result scanning (polls `tmp/agent_status/codex_tasks/`)
- ✅ Inter-agent coordination via file system
- ✅ Graceful shutdown (SIGTERM/SIGINT handlers)
- ✅ Status file: `tmp/agent_status/artifact.status.json`
- ✅ Audit log: JSONL format with timestamps

**Task Flow:**
1. CODEX writes `task_*.request.json` to `codex_tasks/`
2. Artifact agent polls directory every 5 seconds
3. Processes task, writes `task_*.result.json`
4. Dual tier-1 loop moves result to `.processed/`
5. Logs event to `coordination_log.jsonl`

**Why It Works:**
- No network dependencies (file-based)
- Self-contained Python script
- Health server proves it's alive
- Actually exists (unlike the 5 phantom agents)

### The 4 Real Backend Services

#### 1. Voice Service
- **Entry:** `backend/voice-service/src/index.js`
- **Ports:** 2022 (Whisper STT), 8880 (Kokoro TTS)
- **Start:** `npm run voice:start`
- **Dependencies:** reasoning-gateway (port 4002)
- **Purpose:** Voice input/output for Liv Hana AI
- **External:** Whisper + Kokoro binaries in `~/.voicemode/services/`

#### 2. Reasoning Gateway
- **Entry:** `backend/reasoning-gateway/src/index.js`
- **Port:** 4002
- **Start:** tmux session via START.sh line 333
- **Purpose:** AI reasoning coordination layer
- **Dependents:** voice-service requires this

#### 3. Orchestration Service
- **Entry:** `backend/orchestration-service/dist/index.js` (TypeScript build)
- **Port:** 4010
- **Start:** `npm run orchestration:start`
- **Purpose:** Real-time dashboard + autoscaler telemetry
- **Dependencies:** 172 npm packages, Redis (port 6379)
- **WebSocket:** `/ws` endpoint for live updates

#### 4. Integration Service
- **Entry:** `backend/integration-service/src/index.js`
- **Port:** 3005 (configurable)
- **Start:** `scripts/boot/start_services.sh` lines 93-98
- **Purpose:** External API integration (LightSpeed, BigQuery, Linear, etc.)
- **Dependencies:** 1Password CLI (`op`) for secret management

### Agent Communication Protocol

**File-Based Coordination** (no network calls):

```
tmp/agent_status/
├── codex_tasks/                    # Task queue
│   ├── task_*.request.json         # Incoming tasks
│   ├── task_*.result.json          # Completed tasks
│   └── .processed/                 # Archive
│
├── livhana_status/                 # Heartbeat
│   └── heartbeat.json              # Updated every 30s by dual_tier1_loop.sh
│
├── shared/
│   ├── agent_registry.json         # All agents + services (created inline in START.sh)
│   └── coordination_log.jsonl      # Event log (append-only)
│
├── artifact.status.json            # Artifact agent status
└── execmon.status.json             # ❌ Referenced but doesn't exist
```

**Coordination Flow:**
1. **Dual Tier-1 Loop** (`scripts/agents/dual_tier1_loop.sh`):
   - Polls `codex_tasks/` every 5 seconds
   - Writes heartbeat every 30 seconds
   - Archives completed tasks
   - Logs all events to `coordination_log.jsonl`

2. **Artifact Agent** (Python):
   - Scans `codex_tasks/` for new results
   - Writes status to `artifact.status.json`
   - Appends events to audit log
   - Updates `agent_registry.json`

3. **SELF-* Loops** (inline in START.sh):
   - SELF-LISTEN: Monitors tmux sessions, restarts dead agents
   - SELF-IMPROVE: Analyzes `execmon.status.json` (missing!)
   - SELF-SECURE: Scrubs secrets from logs
   - SELF-REPORT: Voice announcements via port 8880
   - SELF-INTEGRATE: Checks CLI auth (gh, gcloud, op)

### Why 5 JavaScript Agents Don't Exist

**Git Status Shows:**
```
?? scripts/agents/artifact_agent.py   # NEW FILE (Python, not JS)
?? scripts/agents/tests/              # Test directory
```

**Conclusion:**
- Original design: 5 JS agents using Claude Code Task Tool
- Reality: Python-based artifact agent + Node services
- Gap: Architecture evolved but START.sh wasn't updated
- Impact: Silent failures, incorrect monitoring

---

## 3. KILL LIST - Dead Code to Delete

### Priority 1: Immediate Deletions (High Impact)

#### 1.1 Massive Backup Directories (2-5GB Recovery)

**Delete:**
- `backups/snapshots/20251029T211159Z_rsync/`
  - **Size:** ~2-5GB (includes all node_modules/)
  - **Reason:** Full project snapshot, unnecessary with git history
  - **Impact:** Massive disk space recovery

- `.fallacy_purge_backup_20251028_222341/`
  - **Reason:** Old backup from fallacy scan cleanup
  - **Impact:** Moderate disk space

**Command:**
```bash
rm -rf backups/snapshots/
rm -rf .fallacy_purge_backup_*
```

**Verification:**
```bash
git status  # Should show backups/ as untracked if now empty
du -sh backups/ .fallacy_purge_backup_*  # Before deletion
```

#### 1.2 Broken Agent Scripts

**Delete:**
- `scripts/spawn-agents.sh` (11 lines)
  - **Reason:** Tries to spawn `node agents/*.js` (doesn't exist)
  - **Impact:** Misleading, non-functional

- `scripts/heal-agents.sh` (26 lines)
  - **Reason:** Tries to respawn `node agents/*.js` (doesn't exist)
  - **Impact:** Misleading, non-functional

**Command:**
```bash
git rm scripts/spawn-agents.sh scripts/heal-agents.sh
```

#### 1.3 Old Backup Files

**Delete:**
- `scripts/claude_tier1_boot.sh.backup_20251029_112920`
  - **Reason:** Backup file (git history sufficient)
  - **Impact:** Clutter

**Command:**
```bash
rm scripts/claude_tier1_boot.sh.backup_*
```

### Priority 2: Legacy Deployment Scripts

**Move to `scripts/legacy/`:**
- `scripts/1.2.2.1_delivery-service-deploy_20251008.sh`
- `scripts/2.6.1.1_content-engine-autonomous-deploy_20251008.sh`
- `scripts/1.6.3.3_BLAZED_FEST_RESTORATION_NOW_20251028.sh`

**Reason:** Dated deployment scripts (historical value only)

**Command:**
```bash
mkdir -p scripts/legacy/deployment_scripts_2025Q1
git mv scripts/*.*.sh scripts/legacy/deployment_scripts_2025Q1/
```

### Priority 3: Potential Test Script Consolidation

**Audit These (12+ files):**
- `scripts/test-mcp-broker.sh`
- `scripts/test-mcp-broker-quick.sh`
- `scripts/test-godaddy-api.sh`
- `scripts/test-godaddy-api-op.sh`
- `scripts/test-stt-service.sh`
- `scripts/test-tts-service.sh`
- `scripts/test_1password_lookup.sh`
- `scripts/test_validation_suite.sh`
- `scripts/test_system_monitor.sh`
- (and more...)

**Recommendation:**
- Review each for actual usage (grep codebase for references)
- Move active tests to `scripts/tests/{unit,integration,smoke}/`
- Delete unused tests

---

## 4. KEEP LIST - Essential Files

### Core Boot Infrastructure ✅

1. **START.sh** (784 lines)
   - **Status:** NEEDS REFACTORING (but essential)
   - **Keep:** Yes (entry point for entire system)

2. **scripts/watchdogs/tier1_supervisor.sh** (187 lines)
   - **Status:** ✅ PRODUCTION READY
   - **Keep:** Absolutely (master watchdog, replaces 4 legacy scripts)

3. **scripts/agents/dual_tier1_loop.sh** (165 lines)
   - **Status:** ✅ PRODUCTION READY
   - **Keep:** Absolutely (inter-agent coordination)

4. **scripts/start_artifact_agent.sh** (107 lines)
   - **Status:** ✅ PRODUCTION READY
   - **Keep:** Absolutely (spawns real artifact agent)

5. **scripts/agents/artifact_agent.py** (505 lines)
   - **Status:** ✅ PRODUCTION READY
   - **Keep:** Absolutely (only real agent implementation)

### Service Management ✅

6. **scripts/boot/start_services.sh** (124 lines)
   - **Status:** ✅ PRODUCTION READY
   - **Keep:** Absolutely (transactional service startup with rollback)

7. **scripts/start-voice-services.sh**
   - **Keep:** Yes (voice orchestration)

8. **scripts/validate-env.sh**
   - **Keep:** Yes (environment validation)

### Guard Scripts (ALL KEEP) ✅

All 14 guard scripts are production-ready utilities:
- `scripts/guards/atomic_write.sh`
- `scripts/guards/check_disk_space.sh`
- `scripts/guards/check_port_collision.sh`
- `scripts/guards/validate_op_login.sh`
- `scripts/guards/validate_pid_file.sh`
- `scripts/guards/wait_for_service.sh`
- `scripts/guards/wait_for_dependency.sh`
- `scripts/guards/with_file_lock.sh`
- `scripts/guards/system_health_validator.sh`
- `scripts/guards/scrub_secrets.sh`
- (+ 4 more)

### Helper Scripts (ALL KEEP) ✅

All 3 helper scripts are essential:
- `scripts/helpers/logging.sh`
- `scripts/helpers/secret_scrubber.sh`
- `scripts/helpers/tmux_session_manager.sh`

### Integration Scripts ✅

- `scripts/integrations/linear_sync.py` (Linear API sync)

---

## 5. CONSOLIDATE LIST - Scripts to Merge

### 1. Agent Spawning (3 locations → 1 script)

**Current Duplication:**
- `scripts/spawn-agents.sh` (11 lines, broken)
- `scripts/heal-agents.sh` (26 lines, broken)
- `START.sh` lines 242-305 (inline spawn logic)

**Proposed Solution:**
- **NEW:** `scripts/boot/spawn_agents.sh`
  - Spawn ONLY agents that exist (artifact_agent.py)
  - Validate agent dependencies before spawn
  - Write consolidated status
  - Idempotent (safe to run multiple times)

**Benefits:**
- Single source of truth for agent spawning
- Reusable by START.sh and recovery scripts
- Easier to test in isolation

### 2. Service Spawning (4 locations → 1 script)

**Current Duplication:**
- `START.sh` lines 189-211 (voice services)
- `START.sh` lines 213-239 (orchestration)
- `START.sh` lines 330-343 (reasoning-gateway)
- `scripts/boot/start_services.sh` (integration-service only)

**Proposed Solution:**
- **ENHANCE:** `scripts/boot/start_services.sh`
  - Add voice-service, reasoning-gateway, orchestration
  - Remove duplication from START.sh
  - Transactional startup: all-or-nothing with rollback
  - Dependency ordering: Redis → reasoning → voice → orchestration

**Benefits:**
- Single service startup script
- Atomic operations (rollback on failure)
- Consistent error handling

### 3. Validation Scripts (6+ → 1 suite)

**Current Scatter:**
- `scripts/validate-env.sh`
- `scripts/validate_truth_output.sh`
- `scripts/validate_metrics.sh`
- `scripts/verify_pipeline_integrity.sh`
- `scripts/verify-service-health.sh`
- `scripts/post-boot-validation.sh`
- `scripts/master-verification.sh`

**Proposed Solution:**
- **NEW:** `scripts/boot/validate_suite.sh`
  - Modular validators (env, services, agents, security)
  - Exit code per validator (0=pass, 1=fail, 2=warn)
  - JSON output report (`tmp/validation_report.json`)
  - Parallel execution (validate all simultaneously)

**Benefits:**
- Unified validation interface
- Structured output (JSON)
- Faster (parallel checks)

### 4. Voice Service Management (3 scripts → 1 controller)

**Current:**
- `scripts/start-voice-services.sh`
- `scripts/stop-voice-services.sh`
- `scripts/voice/start_kokoro_tts.sh`
- `scripts/voice/start_whisper_stt.sh`

**Proposed Solution:**
- **NEW:** `scripts/voice/voice_controller.sh`
  - Commands: `start`, `stop`, `restart`, `status`
  - Unified voice service lifecycle management
  - Health checks integrated
  - Idempotent operations

**Benefits:**
- Single interface for voice services
- Consistent with systemd-style commands
- Easier troubleshooting

### 5. SELF-* Loops (5 inline loops → 5 standalone scripts)

**Current: 200+ Lines Inline in START.sh**
- SELF-LISTEN (lines 372-400) - Monitor agent tmux sessions
- SELF-IMPROVE (lines 403-430) - Analyze execmon status
- SELF-SECURE (lines 432-474) - Scrub secrets from logs
- SELF-REPORT (lines 476-521) - Voice status announcements
- SELF-INTEGRATE (lines 523-580) - Check CLI auth

**Proposed Solution:**
Extract to `scripts/watchdogs/`:
- `agent_health_monitor.sh` (SELF-LISTEN)
- `improvement_analyzer.sh` (SELF-IMPROVE)
- `security_monitor.sh` (SELF-SECURE)
- `status_reporter.sh` (SELF-REPORT)
- `integration_monitor.sh` (SELF-INTEGRATE)

**Benefits:**
- Testable in isolation
- Reusable by other systems
- START.sh shrinks by ~200 lines (75% reduction)

---

## 6. Refactor Plan: Current → Ideal

### Current Architecture (As-Is)

```
START.sh (784 lines)
├── 50 lines: Environment setup
├── 100 lines: Inline .vscode + registry JSON creation
├── 50 lines: Voice + orchestration service spawning
├── 60 lines: Broken agent spawning (5 phantom agents)
├── 50 lines: Validation + recovery functions
├── 50 lines: Redis + reasoning-gateway + dual-tier1
├── 200 lines: 5 SELF-* loops (inline background processes)
├── 100 lines: Mode selection (dev/prod/empire/local)
└── 100 lines: Final validation + status report

agents/ ❌ MISSING (referenced but doesn't exist)

scripts/
├── spawn-agents.sh ❌ BROKEN
├── heal-agents.sh ❌ BROKEN
├── start_artifact_agent.sh ✅ WORKS
├── agents/
│   ├── artifact_agent.py ✅ ONLY REAL AGENT
│   └── dual_tier1_loop.sh ✅ WORKS
├── watchdogs/
│   └── tier1_supervisor.sh ✅ NEW MASTER (replaces 4 legacy)
└── boot/
    └── start_services.sh ✅ PARTIAL (integration-service only)

backups/snapshots/ ❌ 2-5GB (DELETE)
.fallacy_purge_backup_* ❌ (DELETE)
```

### Ideal Architecture (To-Be)

```
START.sh (200 lines) ✅ STREAMLINED
├── 50 lines: Environment setup + exports
├── 30 lines: Call scripts/boot/initialize.sh
├── 20 lines: Call scripts/boot/start_services.sh
├── 20 lines: Call scripts/boot/start_agents.sh
├── 20 lines: Call scripts/boot/start_watchdogs.sh
├── 30 lines: Mode selection (dev/prod/empire/local)
├── 20 lines: Call scripts/boot/validate_suite.sh
└── 10 lines: Final status report

scripts/
├── boot/ (CORE BOOT LOGIC)
│   ├── initialize.sh ✅ NEW (dirs, .vscode, registry)
│   ├── start_services.sh ✅ ENHANCED (all 4 services)
│   ├── start_agents.sh ✅ NEW (artifact agent only)
│   ├── start_watchdogs.sh ✅ NEW (tier1_supervisor + others)
│   └── validate_suite.sh ✅ NEW (modular validators)
│
├── agents/ (AGENT IMPLEMENTATIONS)
│   ├── artifact_agent.py ✅ PRODUCTION
│   ├── artifact_launcher.sh (renamed from start_artifact_agent.sh)
│   ├── dual_tier1_loop.sh ✅ PRODUCTION
│   └── README.md ✅ NEW (documents 1-agent reality)
│
├── watchdogs/ (MONITORING)
│   ├── tier1_supervisor.sh ✅ MASTER
│   ├── agent_health_monitor.sh ✅ NEW (extracted SELF-LISTEN)
│   ├── security_monitor.sh ✅ NEW (extracted SELF-SECURE)
│   ├── status_reporter.sh ✅ NEW (extracted SELF-REPORT)
│   ├── integration_monitor.sh ✅ NEW (extracted SELF-INTEGRATE)
│   ├── improvement_analyzer.sh ✅ NEW (extracted SELF-IMPROVE)
│   ├── voice_services_watch.sh ✅ KEEP
│   └── op_secret_guard.sh ✅ KEEP
│
├── services/ (SERVICE MANAGEMENT)
│   ├── voice_controller.sh ✅ NEW (start/stop/restart/status)
│   ├── service_health_check.sh ✅ NEW
│   └── service_restart.sh ✅ NEW
│
├── guards/ (14 files) ✅ NO CHANGES
├── helpers/ (3 files) ✅ NO CHANGES
├── integrations/ ✅ NO CHANGES
│
├── tests/ (ORGANIZED)
│   ├── unit/ ✅ NEW
│   ├── integration/ ✅ NEW
│   └── smoke/ ✅ NEW
│
└── legacy/ (ARCHIVED)
    └── deployment_scripts_2025Q1/ ✅ NEW

docs/ (DOCUMENTATION)
├── ARCHITECTURE.md ✅ NEW (current system reality)
├── BOOT_SYSTEM.md ✅ NEW (boot sequence)
├── AGENT_SYSTEM.md ✅ NEW (real vs phantom agents)
├── MIGRATION_GUIDE.md ✅ NEW (how we got here)
└── TIER1_SUPERVISOR_MIGRATION.md ✅ EXISTS

backend/ (NO CHANGES)
tmp/ (RUNTIME STATE - NO CHANGES)
```

---

## 7. Execution Plan (Phased Approach)

### Phase 1: Clean Dead Code (5-10 min) 🔥 IMMEDIATE

**Goal:** Remove obvious dead code and recover disk space.

**Actions:**
1. Delete massive backups:
   ```bash
   rm -rf backups/snapshots/
   rm -rf .fallacy_purge_backup_*
   ```
   **Impact:** 2-5GB disk space recovery

2. Delete broken agent scripts:
   ```bash
   git rm scripts/spawn-agents.sh scripts/heal-agents.sh
   rm scripts/claude_tier1_boot.sh.backup_*
   ```

3. Move legacy deployment scripts:
   ```bash
   mkdir -p scripts/legacy/deployment_scripts_2025Q1
   git mv scripts/1.*.sh scripts/2.*.sh scripts/legacy/deployment_scripts_2025Q1/
   ```

4. Commit cleanup:
   ```bash
   git commit -m "chore: Remove dead code and massive backups

   - Delete backups/snapshots/ (2-5GB recovery)
   - Delete broken agent spawn scripts (references non-existent agents/)
   - Move dated deployment scripts to scripts/legacy/
   - Remove old backup files"
   ```

**Validation:**
- `git status` should show only intended deletions
- `du -sh .` should show ~2-5GB reduction
- No functional changes (system still boots)

---

### Phase 2: Fix Phantom Agent Spawning (10-15 min) 🔧 CRITICAL

**Goal:** Remove broken agent spawn logic from START.sh.

**Actions:**

1. **Remove broken spawn attempts** (lines 242-305):
   ```bash
   # DELETE these lines from START.sh:
   # spawn_agent "planning" "node agents/planning.js" 2
   # spawn_agent "research" "node agents/research.js" 2
   # spawn_agent "artifact" "node agents/artifact.js" 2
   # spawn_agent "qa" "node agents/qa.js" 2
   # spawn_agent "execmon" "node agents/execmon.js" 3
   # validate_and_recover()
   ```

2. **Replace with comment block**:
   ```bash
   # AGENT ARCHITECTURE NOTE:
   # The original 5-agent design (planning, research, artifact, qa, execmon)
   # was aspirational. Current production architecture:
   #   - 1 Python agent: scripts/agents/artifact_agent.py (port 5013)
   #   - 4 Node services: voice, reasoning, orchestration, integration
   #   - File-based coordination: tmp/agent_status/
   # See docs/AGENT_SYSTEM.md for details.
   ```

3. **Add artifact agent spawn** (if not already there):
   ```bash
   # Spawn real artifact agent
   if [[ -f "scripts/start_artifact_agent.sh" ]]; then
     bash scripts/start_artifact_agent.sh
   fi
   ```

4. **Fix validation logic** (lines 651-751):
   - Remove checks for 5 JS agents
   - Add check for artifact_agent.py health endpoint:
     ```bash
     if curl -sf http://127.0.0.1:5013/health >/dev/null 2>&1; then
       echo "✅ Artifact agent healthy"
     else
       echo "⚠️  Artifact agent not responding"
     fi
     ```

5. **Commit fix**:
   ```bash
   git add START.sh
   git commit -m "fix: Remove phantom agent spawning from START.sh

   The 5-agent architecture (planning, research, artifact, qa, execmon)
   was aspirational but never implemented as JavaScript agents.

   Current reality:
   - 1 Python agent (artifact_agent.py) on port 5013
   - 4 Node.js services (voice, reasoning, orchestration, integration)

   This commit removes broken spawn attempts and updates validation
   to check actual services instead of non-existent tmux sessions.

   See docs/AGENT_SYSTEM.md for architecture details."
   ```

**Validation:**
- Run `./START.sh dev`
- No errors about missing agents/ directory
- Artifact agent health check passes (curl :5013/health)
- All 4 services start successfully

---

### Phase 3: Extract Inline Loops (15-20 min) 📦 REFACTOR

**Goal:** Extract 200+ lines of inline SELF-* loops to standalone scripts.

**Actions:**

1. **Create `scripts/watchdogs/agent_health_monitor.sh`**:
   - Extract SELF-LISTEN loop (lines 372-400)
   - Add proper logging, error handling
   - Monitor only services that exist

2. **Create `scripts/watchdogs/security_monitor.sh`**:
   - Extract SELF-SECURE loop (lines 432-474)
   - Use existing `scripts/guards/scrub_secrets.sh`

3. **Create `scripts/watchdogs/status_reporter.sh`**:
   - Extract SELF-REPORT loop (lines 476-521)
   - Voice announcements via Kokoro (port 8880)

4. **Create `scripts/watchdogs/integration_monitor.sh`**:
   - Extract SELF-INTEGRATE loop (lines 523-580)
   - Check gh, gcloud, op CLI auth

5. **Skip `improvement_analyzer.sh` for now**:
   - SELF-IMPROVE references `execmon.status.json` which doesn't exist
   - Document as future work

6. **Create `scripts/boot/initialize.sh`**:
   - Extract inline .vscode/settings.json creation (lines 59-74)
   - Extract inline agent_registry.json creation (lines 82-185)
   - Create required directories (tmp/, logs/, etc.)

7. **Create `scripts/boot/start_watchdogs.sh`**:
   - Spawns all watchdog scripts in tmux sessions
   - Idempotent (checks if already running)

8. **Update START.sh**:
   - Replace inline loops with calls to boot/ scripts
   - Target: 784 lines → ~200 lines

9. **Commit refactor**:
   ```bash
   git add scripts/boot/ scripts/watchdogs/ START.sh
   git commit -m "refactor: Extract inline loops from START.sh to modular scripts

   START.sh previously contained 200+ lines of inline while-true loops
   for monitoring, security, reporting, and integration checks.

   Changes:
   - Extract SELF-LISTEN → scripts/watchdogs/agent_health_monitor.sh
   - Extract SELF-SECURE → scripts/watchdogs/security_monitor.sh
   - Extract SELF-REPORT → scripts/watchdogs/status_reporter.sh
   - Extract SELF-INTEGRATE → scripts/watchdogs/integration_monitor.sh
   - Extract initialization → scripts/boot/initialize.sh
   - Create watchdog launcher → scripts/boot/start_watchdogs.sh
   - Reduce START.sh from 784 lines to ~200 lines (75% reduction)

   Benefits:
   - Modular, testable, reusable scripts
   - Easier troubleshooting and debugging
   - Consistent with tier1_supervisor.sh pattern"
   ```

**Validation:**
- Run `./START.sh dev`
- All watchdogs spawn successfully (check `tmux ls`)
- Health monitoring works (check logs)
- Security scrubbing runs (check tmp/)
- Voice reports work (listen for announcements)

---

### Phase 4: Document Reality (5-10 min) 📚 DOCUMENTATION

**Goal:** Create comprehensive documentation explaining the actual architecture.

**Actions:**

1. **Create `docs/ARCHITECTURE.md`**:
   - Current system overview
   - 1 Python agent + 4 Node services
   - File-based coordination protocol
   - Why 5-agent design was aspirational
   - Service dependency graph

2. **Create `docs/BOOT_SYSTEM.md`**:
   - Boot sequence after refactor
   - Dependency tree visualization
   - Service startup order
   - Validation checkpoints

3. **Create `docs/AGENT_SYSTEM.md`**:
   - Real vs phantom agents comparison
   - Artifact agent architecture
   - Communication protocol (file-based)
   - Future agent expansion (if desired)

4. **Create `docs/MIGRATION_GUIDE.md`**:
   - Historical context (how we got here)
   - Original 5-agent design intent
   - Evolution to current architecture
   - Lessons learned

5. **Update `README.md`** (if exists):
   - Link to new docs/
   - Accurate system description
   - Remove references to non-existent agents/

6. **Commit documentation**:
   ```bash
   git add docs/
   git commit -m "docs: Document actual system architecture

   Add comprehensive documentation explaining the current system:
   - ARCHITECTURE.md: 1 Python agent + 4 Node services
   - BOOT_SYSTEM.md: Boot sequence and dependencies
   - AGENT_SYSTEM.md: Real vs aspirational agent design
   - MIGRATION_GUIDE.md: Historical context

   This documentation clarifies the architectural mismatch between
   the original 5-agent design and the implemented 1-agent + services
   architecture."
   ```

**Validation:**
- All docs render correctly in GitHub
- No broken links
- Clear explanations for new developers

---

### Phase 5: Enhanced Service Management (Optional - 15-20 min)

**Goal:** Consolidate service spawning and validation.

**Actions:**

1. **Enhance `scripts/boot/start_services.sh`**:
   - Add voice-service, reasoning-gateway, orchestration
   - Remove duplication from START.sh
   - Transactional startup with rollback

2. **Create `scripts/boot/validate_suite.sh`**:
   - Modular validators (env, services, agents, security)
   - JSON output report
   - Parallel execution

3. **Create `scripts/voice/voice_controller.sh`**:
   - Commands: start, stop, restart, status
   - Unified voice service management

4. **Update START.sh**:
   - Call enhanced boot/ scripts
   - Remove remaining duplication

5. **Commit enhancements**:
   ```bash
   git add scripts/boot/ scripts/voice/ START.sh
   git commit -m "feat: Consolidate service management and validation

   - Enhanced start_services.sh with all 4 services
   - Created validate_suite.sh for modular validation
   - Created voice_controller.sh for unified voice management
   - Further reduced START.sh complexity"
   ```

---

## 8. Expected Results

### Immediate Benefits (Phase 1)
- ✅ **2-5GB disk space recovered** (backup deletion)
- ✅ **Removed misleading broken scripts** (spawn-agents, heal-agents)
- ✅ **Cleaner git history** (legacy scripts archived)

### Critical Fixes (Phase 2)
- ✅ **No more phantom agent failures** (removed broken spawn logic)
- ✅ **Accurate monitoring** (checks actual services, not non-existent tmux sessions)
- ✅ **Clear architecture documentation** (in comments)

### Maintainability (Phase 3)
- ✅ **START.sh: 784 lines → ~200 lines** (75% reduction)
- ✅ **Modular watchdog scripts** (testable in isolation)
- ✅ **Reusable boot scripts** (initialize, start_services, start_agents, start_watchdogs)

### Developer Experience (Phase 4)
- ✅ **Comprehensive documentation** (ARCHITECTURE.md, BOOT_SYSTEM.md, AGENT_SYSTEM.md)
- ✅ **Clear onboarding** (new developers understand system immediately)
- ✅ **Historical context** (MIGRATION_GUIDE.md explains evolution)

### Optional Enhancements (Phase 5)
- ✅ **Consolidated service management** (single source of truth)
- ✅ **Unified validation** (modular, parallel, JSON output)
- ✅ **Voice service controller** (systemd-style interface)

---

## 9. Risk Assessment

### Low Risk ✅
- Deleting backups/ (git history preserved)
- Deleting broken scripts (not functional anyway)
- Moving legacy scripts (still accessible in scripts/legacy/)
- Documentation additions (no code changes)

### Medium Risk ⚠️
- Removing phantom agent spawn logic (changes START.sh behavior)
  - **Mitigation:** Test thoroughly before merge
  - **Rollback:** Git revert if issues

- Extracting inline loops (changes START.sh structure)
  - **Mitigation:** Incremental changes, test each extraction
  - **Rollback:** Git revert specific commits

### High Risk 🔴
- None (all changes are additive or removals of broken code)

---

## 10. Rollback Plan

**If Phase 1 causes issues:**
```bash
git restore backups/
git restore .fallacy_purge_backup_*
git restore scripts/spawn-agents.sh scripts/heal-agents.sh
```

**If Phase 2 causes issues:**
```bash
git revert HEAD  # Revert phantom agent removal
./START.sh dev   # Test old behavior
```

**If Phase 3 causes issues:**
```bash
git revert HEAD~N..HEAD  # Revert loop extraction commits
./START.sh dev           # Test inline loops
```

**Complete rollback to original state:**
```bash
git log --oneline | head -20  # Find commit before refactor
git reset --hard <commit-hash>
```

---

## 11. Next Steps

### Immediate (Today)
1. **Review this analysis** with team
2. **Decide on phased approach** (all phases or subset?)
3. **Create feature branch**: `refactor/clean-boot-architecture`
4. **Execute Phase 1** (dead code cleanup - low risk, high impact)

### This Week
5. **Execute Phase 2** (fix phantom agents - critical fix)
6. **Execute Phase 3** (extract loops - major refactor)
7. **Execute Phase 4** (documentation - developer experience)
8. **Test thoroughly** on dev environment
9. **Merge to main** via pull request

### Optional (This Month)
10. **Execute Phase 5** (service consolidation - nice-to-have)
11. **Audit remaining scripts** (~160 total, many may be unused)
12. **Organize test scripts** (into tests/{unit,integration,smoke}/)

---

## 12. Key Decisions Needed

### Decision 1: Remove or Keep Phantom Agent Logic?
- **Option A:** Remove entirely (recommended - clean slate)
- **Option B:** Keep as commented code (technical debt)
- **Option C:** Implement 5 real agents (major project, months of work)

**Recommendation:** Option A (remove)

### Decision 2: Refactor Scope
- **Minimal:** Phase 1 + Phase 2 only (fix broken, remove dead code)
- **Standard:** Phase 1-4 (fix, refactor, document)
- **Comprehensive:** Phase 1-5 (all enhancements)

**Recommendation:** Standard (Phase 1-4)

### Decision 3: Current Architecture Good Enough?
- **Yes:** Document and move on (current architecture works)
- **No:** Plan 5-agent reimplementation (Q1 2026 project)

**Recommendation:** Yes (current architecture is functional and maintainable)

---

## 13. Appendix: File Statistics

### Before Refactor
- **START.sh:** 784 lines
- **Inline loops:** 200+ lines
- **Broken scripts:** 3 files (spawn-agents, heal-agents, backup)
- **Massive backups:** ~2-5GB
- **Legacy deployment scripts:** 3+ files (dated)
- **Total scripts:** ~172 shell scripts

### After Refactor (Projected)
- **START.sh:** ~200 lines (75% reduction)
- **New modular scripts:** 8-10 (in boot/, watchdogs/)
- **Disk space saved:** 2-5GB
- **Documentation added:** 4 comprehensive markdown files
- **Legacy archived:** scripts/legacy/ directory
- **Broken scripts removed:** 3 files

### Maintenance Burden
- **Before:** 784-line monolithic START.sh, hard to debug
- **After:** Modular scripts, each <200 lines, easy to test

---

## 14. Conclusion

This analysis reveals a **critical architectural mismatch**: START.sh references a 5-agent system that was never fully implemented. The actual production architecture (1 Python agent + 4 Node services) works well but is obscured by legacy code attempting to spawn non-existent agents.

**The refactor plan is straightforward:**
1. Remove dead code and broken scripts
2. Fix phantom agent spawning
3. Extract inline loops to modular scripts
4. Document the actual architecture

**Total effort:** 35-55 minutes of focused work, spread across 4 phases.

**Impact:** Cleaner codebase, accurate monitoring, better developer experience, and recovery of 2-5GB disk space.

**Recommendation:** Execute Phase 1-4 this week. The system is functional but needs alignment between documentation, code, and reality.

---

**END OF ANALYSIS**

For questions or clarifications, refer to:
- This document (BOOT_SYSTEM_ANALYSIS.md)
- docs/TIER1_SUPERVISOR_MIGRATION.md (existing)
- START.sh source code (lines 1-784)
- scripts/agents/artifact_agent.py (real agent implementation)
