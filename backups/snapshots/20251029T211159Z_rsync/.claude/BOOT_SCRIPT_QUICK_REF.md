# Claude Tier-1 Boot Script - Quick Reference

**Script:** `/scripts/claude_tier1_boot.sh`
**Last Updated:** 2025-10-23

---

## Quick Start

```bash
# Standard boot (with all services)
./scripts/claude_tier1_boot.sh

# Boot without integration-service
SKIP_INTEGRATION_SERVICE=1 ./scripts/claude_tier1_boot.sh

# Boot with strict memory checks
STRICT_LOW_MEM=1 ./scripts/claude_tier1_boot.sh
```

---

## Boot Sequence

1. **🔍 Predictive Pre-Boot Validation** (NEW)
   - Critical dependencies (Node, npm, tmux, op, claude)
   - 1Password Desktop app status
   - Disk space (≥5GB required)
   - Port conflicts (3005, 2022, 8880)
   - Existing agent health

2. **🌍 Environment Setup**
   - Memory pressure check
   - 1Password authentication
   - GCP project setup
   - API keys from 1Password
   - Node.js version validation

3. **✈️ Pre-Flight Safety Checks**
   - PO1 cleanup
   - Pre-flight validation script
   - Python/PyYAML check

4. **🔍 Pipeline Integrity Validation**
   - Config validation
   - Compliance guardrails

5. **🎤 Voice Mode Preparation**
   - STT service check (port 2022)
   - TTS service check (port 8880)
   - Voice mode boot script

6. **📝 Render Engineered Prompt**
   - System prompt generation
   - Voice instructions prepend
   - Funnel authority check

7. **✅ Pre-Launch Checks**
   - Git status
   - Compliance service
   - Prompt preview

8. **⏱️ Session Watchdog**
   - Background monitoring (300s threshold)

9. **📝 Session Log Update**
   - Boot timestamp
   - System state snapshot

10. **🎯 Claude Session Ready**
    - Instructions for Cursor
    - Key files summary

11. **🤖 5-Subagent Architecture**
    - Agent tracking setup
    - Status directories
    - Auto-spawn instructions

12. **🏥 Post-Boot Health Validation** (NEW)
    - Agent responsiveness (5 checks)
    - Voice connectivity (STT + TTS)
    - Integration service health
    - Tmux session count
    - File system health
    - **Health Score: 0-120 points**

13. **🌟 Boot Complete**
    - Voice greeting (if score ≥95)
    - Status dashboard
    - Success confirmation

---

## Health Score Breakdown

**Total: 120 points**

| Component | Points | Check |
|-----------|--------|-------|
| Planning Agent | 20 | Tmux session + status file + active |
| Research Agent | 20 | Tmux session + status file + active |
| Artifacts Agent | 20 | Tmux session + status file + active |
| Execution Monitor | 20 | Tmux session + status file + active |
| QA Agent | 20 | Tmux session + status file + active |
| Tmux Sessions (≥5) | 10 | Session count |
| integration-service | 5 | Port 3005 + /health |
| STT (Whisper) | 2 | Port 2022 listening |
| TTS (Kokoro) | 3 | Port 8880 listening |

**Grades:**
- 🌟 **EXCELLENT (≥95):** All systems operational, voice greeting plays
- ✅ **GOOD (80-94):** Minor degradation, fully functional
- ⚠️ **FAIR (60-79):** Significant issues, monitor closely
- ❌ **POOR (<60):** Multiple systems down, consider restart

---

## Environment Variables

### Boot Control
- `MAX_AUTO` (default: 1) - Auto-start voice + agents
- `SKIP_INTEGRATION_SERVICE` (default: 0) - Skip integration-service start
- `SKIP_AGENT_SPAWN` (auto-set) - Skip agent spawn if all healthy

### Memory Checks
- `LOW_MEM_WARN_PCT` (default: 10) - Warning threshold %
- `LOW_MEM_CRIT_PCT` (default: 5) - Critical threshold %
- `STRICT_LOW_MEM` (default: 0) - Hard-fail on low memory

### Node.js
- `STRICT_NODE_20` (default: false) - Require exactly Node 20.x

### 1Password
- `OP_ACCOUNT_SLUG` (default: reggiedro.1password.com)
- `OP_SERVICE_ACCOUNT_TOKEN` - Service account token (optional)
- `OP_BIOMETRIC_UNLOCK_ENABLED` (auto-set: 1)

### GCP
- `GCP_PROJECT_ID` (auto-set: reggieanddrodispensary)
- `GOOGLE_APPLICATION_CREDENTIALS` (auto-set if key exists)

---

## Predictive Checks (NEW)

### 1. Critical Dependencies
**Function:** `check_critical_dependencies()`

Validates:
- Node.js installed
- npm installed
- tmux installed
- 1Password CLI (`op`) installed
- Claude CLI installed (warning only)

**Failure:** Hard-fail with install commands

### 2. Port Availability
**Function:** `check_port_available(port, service)`

Checks:
- Port 3005 (integration-service)
- Port 2022 (STT/Whisper)
- Port 8880 (TTS/Kokoro)

**Behavior:** Skip service start if port in use

### 3. 1Password Desktop
**Function:** `check_1password_desktop()`

Validates:
- 1Password.app process running
- CLI integration enabled

**Failure:** Warning with settings path

### 4. Disk Space
**Function:** `check_disk_space(threshold)`

Thresholds:
- Critical: <5GB → Hard-fail
- Warning: 5-10GB → Warning
- Healthy: ≥10GB → Success

### 5. Agent Health
**Function:** `check_agent_health(agent)`

Checks:
- Tmux session exists
- Status file recent (<5 min)
- Status reports "active"

**Idempotency:** Skips spawn if healthy

### 6. Voice Connectivity
**Function:** `check_voice_connectivity()`

Tests:
- STT service responsive
- TTS service responsive

**Returns:** Issue count (0-2)

---

## Troubleshooting

### Boot Fails: Missing Dependencies
```bash
# Error: "Node.js not found"
nvm install 20 && nvm use 20

# Error: "tmux not found"
brew install tmux

# Error: "1Password CLI not found"
brew install 1password-cli
```

### Boot Fails: 1Password Authentication
```bash
# Error: "1Password Desktop app NOT running"
# → Launch 1Password.app

# Error: "CLI integration may not be enabled"
# → Open 1Password
# → Settings → Developer
# → Check: "Connect with 1Password CLI"
# → Restart 1Password.app
```

### Boot Fails: Low Disk Space
```bash
# Error: "Low disk space (3GB available < 5GB threshold)"
# → Free up space:
docker system prune -a --volumes  # Clean Docker
npm cache clean --force           # Clean npm
rm -rf ~/.Trash/*                 # Empty trash

# Check space:
df -h /
```

### Boot Warns: Port Conflict
```bash
# Warning: "Port 3005 already in use by node (PID 1234)"
# Option 1: Kill existing service
kill 1234

# Option 2: Let boot script skip (idempotent)
# → Boot will assume existing service is good
```

### Agent Not Healthy
```bash
# Check agent status file
cat tmp/agent_status/planning.status.json

# Check tmux session
tmux attach -t planning

# Restart agent manually
./scripts/start_planning_agent.sh
```

### Voice Services Not Running
```bash
# Start STT (Whisper)
mcp__voicemode__service whisper start

# Start TTS (Kokoro)
mcp__voicemode__service kokoro start

# Check status
lsof -i :2022  # STT
lsof -i :8880  # TTS
```

---

## Files Generated

### Boot Log
```
logs/claude_tier1_boot_YYYYMMDD_HHMMSS.log
```

### Status Files
```
tmp/agent_status/planning.status.json
tmp/agent_status/research.status.json
tmp/agent_status/artifact.status.json
tmp/agent_status/execmon.status.json
tmp/agent_status/qa.status.json
```

### PID Files
```
tmp/integration-service.pid
tmp/agent_status/voice_watcher.pid
tmp/agent_status/research.pid
```

### Session Files
```
tmp/claude_tier1_state.json      # State tracking
tmp/claude_tier1_prompt.txt      # Rendered prompt
.claude/SESSION_PROGRESS.md      # Session log
```

---

## Integration Points

### Called Scripts
- `scripts/boot/helpers.sh` - Utility functions
- `scripts/guards/validate_po1_structure.sh` - PO1 validation
- `scripts/guards/validate_status.sh` - Status validation
- `scripts/agents/voice_orchestrator_watch.sh` - Voice watcher
- `scripts/start_research_agent.sh` - Research agent
- `scripts/po1_dotdirs_cleanup.sh` - Cleanup
- `scripts/preflight_checks.sh` - Pre-flight
- `scripts/verify_pipeline_integrity.py` - Pipeline check
- `scripts/voice_mode_boot.sh` - Voice prep
- `scripts/render_claude_prompt.py` - Prompt rendering
- `scripts/claude_voice_session.sh` - Voice session
- `scripts/start_planning_agent.sh` - Planning agent
- `scripts/start_artifact_agent.sh` - Artifacts agent
- `scripts/start_execution_monitor.sh` - Execution monitor
- `scripts/start_qa_agent.sh` - QA agent
- `scripts/guards/validate_agent_started.sh` - Agent validation
- `scripts/guards/wait_for_service.sh` - Service wait
- `scripts/guards/scrub_secrets.sh` - Secret scrubbing
- `scripts/post_launch_checks.py` - Post-launch health

---

## Testing Commands

### Syntax Check
```bash
bash -n scripts/claude_tier1_boot.sh
```

### Dry Run (with debug)
```bash
bash -x scripts/claude_tier1_boot.sh 2>&1 | tee /tmp/boot_debug.log
```

### Check Current System State
```bash
# Agents
tmux ls | grep -E "(planning|research|artifact|execmon|qa)"

# Services
lsof -i :3005  # integration-service
lsof -i :2022  # STT
lsof -i :8880  # TTS

# Health Score Estimate
for agent in planning research artifact execmon qa; do
  [[ -f tmp/agent_status/${agent}.status.json ]] && echo "✅ $agent" || echo "❌ $agent"
done
```

---

## Performance

**Boot Time:** ~10-15 seconds (3s validation + 7-12s services)

**Resource Usage:**
- CPU: <5% during boot
- Memory: ~50MB temporary
- Disk I/O: <10MB (logs + status)

---

## Change Log

### 2025-10-23 - Major Enhancement
- ✅ Added predictive pre-boot validation
- ✅ Eliminated race conditions (idempotent agents)
- ✅ Added comprehensive health monitoring
- ✅ Voice-first boot success greeting
- ✅ Port conflict pre-resolution
- ✅ Disk space validation
- ✅ 1Password Desktop validation
- ✅ 120-point health scoring system

### Previous Versions
- See git history for earlier changes

---

**Quick Help:**
```bash
# Show this help
cat .claude/BOOT_SCRIPT_QUICK_REF.md

# Full documentation
cat .claude/BOOT_SCRIPT_ENHANCEMENTS.md

# View boot log
tail -f logs/claude_tier1_boot_*.log | tail -100
```
