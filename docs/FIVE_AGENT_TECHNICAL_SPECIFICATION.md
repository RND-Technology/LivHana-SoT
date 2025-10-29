# Five Agent Technical Specification

**Document ID**: FIVE-AGENT-TECH-SPEC
**Created**: 2025-10-28
**Version**: 1.0.0
**Status**: ACTIVE
**Owner**: Jesse CEO
**Purpose**: Complete technical reference for all 5 agents spawned by START.sh

---

## Executive Summary

- **Total agents**: 5
- **Spawn location**: START.sh lines 31-35
- **Architecture**: Claude Code Task Tool (tmux-based)
- **Total token budget**: 200K tokens (default per agent)
- **Primary model**: Claude 3.5 Sonnet (all agents)
- **Orchestration method**: tmux sessions + status files + task tool coordination

---

## Agent 1: Planning (Layer 1.1)

### Basic Configuration
- **Spawn order**: 1st
- **Layer**: 1.1
- **Type**: claude-code-task
- **Status**: will_auto_spawn

### Spawn Mechanism
```bash
# START.sh line 31
tmux new-session -d -s planning "node agents/planning.js"
```

**Notes**:
- The `node agents/planning.js` command references a **non-existent file** (no agents/ directory)
- This is a **placeholder spawn command** from the original architecture design
- Actual implementation uses **Claude Code Task Tool** via tmux session management
- tmux session name: `planning`
- Process runs in detached background mode (`-d` flag)

### Model Configuration
- **Primary Model**: Claude 3 Opus (strategic planning)
- **Fallback Model**: Gemini 1.5 Pro (cheaper, wider context)
- **Context Window**: 200K tokens
- **Context Budget**: 60K tokens (RPM templates + historical plans + ADRs)
- **Context Utilization**: 30% (leaves 140K for conversation)

### Context Injection

**Priority 1 (Always Load - ~1K tokens)**:
- `.github/copilot-instructions.md` (975 tokens - ground truth)
- System context (environment, git status, agents)

**Priority 2 (Planning-Specific - ~15K tokens)**:
- RPM templates (DNA v3.2)
- Historical RPM plans from `docs/`
- Current initiative tracking

**Priority 3 (Common Utilities - ~5K tokens)**:
- `backend/common/` (shared utilities)
- `.claude/` protocols (INTER_AGENT_COMMUNICATION_PROTOCOL.md)
- Agent registry (`tmp/agent_status/shared/agent_registry.json`)

**Priority 4 (Architecture Docs - ~30K tokens)**:
- All ADRs (Architecture Decision Records)
- Architecture docs from `docs/`
- Session progress (`.claude/SESSION_PROGRESS.md`)

**Priority 5 (Extended Context - ~10K tokens)**:
- Git log (recent commits)
- Related documentation

### Tool Access

**Planning Agent Can Use**:
- **TodoWrite**: Create and manage task lists for RPM plans
- **Read**: Read existing RPM plans, ADRs, documentation
- **Write**: Create new RPM plans, roadmaps, strategy documents
- **Bash**: Execute git commands to check branch status, commit history
- **Grep/Glob**: Search for existing plans, patterns in documentation

**Planning Agent CANNOT Use**:
- Code editing (Edit tool)
- Direct deployment (no infrastructure access)
- Database queries
- External API calls

### Responsibilities
- Create RPM (Result, Purpose, Massive Actions) plans
- Strategic roadmap development
- Architecture Decision Records (ADRs)
- Compliance planning (cannabis regulations, PACT Act)
- Decision analysis (technical trade-offs)
- RPM DNA v3.2 compliance validation

### Status Tracking
- **Status file**: `tmp/agent_status/planning.status.json`
- **Heartbeat**: Updates every 30 seconds
- **Log file**: `logs/agents/planning_YYYYMMDD_HHMMSS.log`

### Sample Status File
```json
{
  "agent": "planning",
  "phase": "startup",
  "status": "running",
  "started_at": "2025-10-28T15:10:28Z",
  "finished_at": "",
  "artifacts": ["/path/to/logs/agents/planning_20251028_101028.log"],
  "notes": "tmux session created"
}
```

### Cost Profile
- **Frequency**: Low (batch planning sessions)
- **Impact**: High (strategic direction)
- **Priority**: Quality > Cost
- **Monthly estimate**: ~$14 (4 RPM planning sprints @ $3.45 each)

---

## Agent 2: Research (Layer 1.2)

### Basic Configuration
- **Spawn order**: 2nd
- **Layer**: 1.2
- **Type**: claude-code-task
- **Status**: will_auto_spawn

### Spawn Mechanism
```bash
# START.sh line 32
tmux new-session -d -s research "node agents/research.js"
```

**Notes**:
- Same placeholder pattern as Planning agent
- tmux session name: `research`
- Process runs in detached background mode

### Model Configuration
- **Primary Model**: Gemini 1.5 Pro (wide context master)
- **Fallback Model**: Claude 3.5 Sonnet (better synthesis, smaller context)
- **Context Window**: 2M tokens (Gemini)
- **Context Budget**: 500K-1M tokens (entire backend + docs)
- **Context Utilization**: 25-50% (can load entire codebase)

### Context Injection

**Priority 1 (Always Load - ~1K tokens)**:
- `.github/copilot-instructions.md`
- System context

**Priority 2 (Research-Specific - ~100K tokens)**:
- Documentation corpus (4,032+ markdown files)
- Web search results
- Best practices documentation

**Priority 3 (Common Utilities - ~50K tokens)**:
- All `backend/common/` utilities
- Agent coordination protocols

**Priority 4 (Architecture Docs - ~100K tokens)**:
- All ADRs
- All architecture docs
- Technical documentation

**Priority 5 (Extended Context - ~250K-750K tokens)**:
- Entire backend directory (if needed)
- Frontend code (if needed)
- Infrastructure configs

### Tool Access

**Research Agent Can Use**:
- **WebSearch**: Search web for best practices, regulations, updates
- **WebFetch**: Fetch and analyze specific URLs
- **Read**: Read all documentation files
- **Grep/Glob**: Search across entire codebase
- **Bash**: Execute research-related commands
- **Write**: Create research reports, summaries

**Research Agent CANNOT Use**:
- Code editing (not responsible for implementation)
- Direct deployment
- TodoWrite (delegates to Planning)

### Responsibilities
- Web research (best practices, regulations)
- Codebase analysis (cross-service dependencies)
- Documentation search (semantic search across 4,032+ files)
- Performance analysis (bottlenecks, optimization)
- Security audit (vulnerability detection)
- Technology evaluation
- Competitive analysis

### Status Tracking
- **Status file**: `tmp/agent_status/research.status.json`
- **Heartbeat**: Every 30 seconds
- **Log file**: `logs/agents/research_YYYYMMDD_HHMMSS.log`

### Cost Profile
- **Frequency**: Medium (research sprints)
- **Impact**: High (informs strategic decisions)
- **Priority**: Cost > Speed (Gemini is cost-effective)
- **Monthly estimate**: ~$30 (research for 40 features + 4 architecture migrations)

---

## Agent 3: Artifact (Layer 1.3)

### Basic Configuration
- **Spawn order**: 3rd
- **Layer**: 1.3
- **Type**: claude-code-task
- **Status**: will_auto_spawn

### Spawn Mechanism
```bash
# START.sh line 33
tmux new-session -d -s artifact "node agents/artifact.js"
```

**Notes**:
- tmux session name: `artifact`
- This is the **primary implementation agent**
- Highest frequency agent (bulk implementation work)

### Model Configuration

**Task-Based Model Selection** (varies by language):

- **TypeScript/Node.js**: Claude 3.5 Sonnet (PRIMARY - 95/100 quality)
  - BullMQ queue integration
  - Docker Compose orchestration
  - Microservices architecture

- **Python Services**: GPT-4 Turbo (PRIMARY)
  - Compliance service
  - MCP servers
  - Large file scaffolding (16K output)

- **React/Frontend**: GPT-4o (PRIMARY - multimodal)
  - UI components
  - Vue components
  - vibe-cockpit pages

- **Large Files**: GPT-4 Turbo (16K output limit)

- **Infrastructure**: Claude 3.5 Sonnet
  - Docker
  - GCP
  - Cloud Run
  - BigQuery

- **Context Budget**: 30-50K tokens per task (service-scoped)

### Context Injection

**Priority 1 (Always Load - ~1K tokens)**:
- `.github/copilot-instructions.md`
- System context

**Priority 2 (Service-Level - ~15K tokens)**:
- Target service README.md
- Service implementation files (src/)
- Service package.json / requirements.txt / Dockerfile

**Priority 3 (Common Utilities - ~5K tokens)**:
- `backend/common/` (shared utilities)
- Agent registry

**Priority 4 (Architecture Docs - ~10K tokens)**:
- Related ADRs (service-specific)
- Current RPM plans
- Session progress

**Priority 5 (Extended Context - ~10-20K tokens)**:
- Related services (cross-dependencies)
- Test files (service-level)

### Tool Access

**Artifacts Agent Can Use** (FULL ACCESS):
- **Edit**: Edit existing code files
- **Write**: Create new files
- **Read**: Read all codebase files
- **Bash**: Execute build/test commands
- **Grep/Glob**: Search for patterns
- **NotebookEdit**: Edit Jupyter notebooks
- **TodoWrite**: Track implementation tasks

**Artifacts Agent Has MOST POWER** - can modify code directly.

### Responsibilities
- Code implementation (TypeScript, Python, React)
- File scaffolding (new services, components)
- Refactoring and optimization
- Bug fixes
- Integration patterns (BullMQ, Redis, Docker)
- Database schema implementation
- API endpoint development
- Configuration file creation

### Status Tracking
- **Status file**: `tmp/agent_status/artifact.status.json`
- **Heartbeat**: Every 30 seconds
- **Log file**: `logs/agents/artifact_YYYYMMDD_HHMMSS.log`

### Cost Profile
- **Frequency**: Highest (continuous implementation)
- **Impact**: Critical (ships code)
- **Priority**: Balance (speed + quality + cost)
- **Monthly estimate**: ~$94 (40 feature implementations @ $2.35 each)

---

## Agent 4: ExecMon (Execution Monitor, Layer 1.4)

### Basic Configuration
- **Spawn order**: 4th
- **Layer**: 1.4
- **Type**: claude-code-task
- **Status**: will_auto_spawn

### Spawn Mechanism
```bash
# START.sh line 34
tmux new-session -d -s execmon "node agents/execmon.js"
```

**Notes**:
- tmux session name: `execmon`
- Continuous monitoring role
- Longest-running agent (always active)

### Model Configuration
- **Primary Model**: DeepSeek Coder V2 (ultra-low latency)
- **Fallback Model**: Claude 3.5 Sonnet (higher accuracy, slower)
- **Context Window**: 128K tokens
- **Context Budget**: 10-20K tokens (script + logs + metrics)
- **Context Utilization**: 6% (minimal context for speed)

### Context Injection

**Priority 1 (Always Load - ~1K tokens)**:
- `.github/copilot-instructions.md`
- System context

**Priority 2 (Monitoring-Specific - ~5K tokens)**:
- Target script being monitored
- Recent logs/output
- Metrics/thresholds

**Priority 3 (Agent Registry - ~2K tokens)**:
- `tmp/agent_status/shared/agent_registry.json`
- Current agent health status

**Priority 4 (Minimal Context - ~2-5K tokens)**:
- Error patterns
- Known issues

### Tool Access

**ExecMon Agent Can Use**:
- **Read**: Read logs, status files, script output
- **Bash**: Execute validation commands, health checks
- **BashOutput**: Monitor background processes
- **Grep/Glob**: Search logs for errors, patterns
- **Write**: Create monitoring reports

**ExecMon Agent CANNOT Use**:
- Code editing (not responsible for fixes)
- TodoWrite (delegates to Planning)
- Direct deployment

### Responsibilities
- Script validation (check exit codes)
- Timing analysis (track execution duration)
- Health monitoring (agent heartbeats)
- Error detection (log analysis)
- Performance metrics (latency, throughput)
- Resource monitoring (CPU, memory, disk)
- Self-healing triggers (restart failed agents)
- Continuous monitoring (24/7 uptime)

### Status Tracking
- **Status file**: `tmp/agent_status/execmon.status.json`
- **Heartbeat**: Updates continuously (most frequent)
- **Log file**: `logs/agents/execmon_monitor_YYYYMMDD_HHMMSS.log`

### Sample Status File
```json
{
  "agent": "execmon",
  "phase": "monitor",
  "status": "running",
  "started_at": "2025-10-28T15:10:28Z",
  "updated_at": "2025-10-28T16:27:31Z",
  "finished_at": "",
  "artifacts": ["/path/to/logs/agents/execmon_monitor_20251028_101028.log"],
  "notes": "heartbeat active"
}
```

### Cost Profile
- **Frequency**: Highest (continuous monitoring)
- **Impact**: Critical (system health)
- **Priority**: Cost > Quality (DeepSeek is 100x cheaper)
- **Monthly estimate**: ~$16 (80 hours @ $0.20/hour)

---

## Agent 5: QA (Quality Assurance, Layer 1.5)

### Basic Configuration
- **Spawn order**: 5th (final agent)
- **Layer**: 1.5
- **Type**: claude-code-task
- **Status**: will_auto_spawn

### Spawn Mechanism
```bash
# START.sh line 35
tmux new-session -d -s qa "node agents/qa.js"
```

**Notes**:
- tmux session name: `qa`
- Final signoff authority
- Quality gatekeeper

### Model Configuration
- **Primary Model**: Claude 3.5 Sonnet (best test generation)
- **Fallback Model**: GPT-4 Turbo (test coverage analysis)
- **Context Window**: 200K tokens
- **Context Budget**: 40-60K tokens (service + tests + acceptance criteria)
- **Context Utilization**: 20-30%

### Context Injection

**Priority 1 (Always Load - ~1K tokens)**:
- `.github/copilot-instructions.md`
- System context

**Priority 2 (Testing-Specific - ~20K tokens)**:
- Target service code
- Existing test files
- Test frameworks (Playwright, Jest configs)

**Priority 3 (Quality Standards - ~10K tokens)**:
- Acceptance criteria
- Quality guardrails
- Compliance requirements

**Priority 4 (Architecture Docs - ~10K tokens)**:
- Related ADRs
- Testing standards documentation

**Priority 5 (Extended Context - ~10K tokens)**:
- Integration test patterns
- Coverage reports

### Tool Access

**QA Agent Can Use**:
- **Read**: Read all code, tests, documentation
- **Write**: Create test files, test reports
- **Bash**: Execute tests (npm test, pytest, etc.)
- **Grep/Glob**: Search for test patterns
- **Edit**: Edit existing test files (rare)
- **TodoWrite**: Track QA issues/blockers

**QA Agent Has VETO POWER** - can block deployments if quality bar not met.

### Responsibilities
- Test generation (Playwright, Jest, pytest)
- Integration testing (end-to-end workflows)
- Test coverage analysis (quality metrics)
- Regression testing (CI/CD validation)
- Manual QA (acceptance criteria verification)
- Quality gate enforcement (block low-quality code)
- Bug validation (reproduce, verify fixes)
- Compliance validation (guardrails, regulations)

### Status Tracking
- **Status file**: `tmp/agent_status/qa.status.json`
- **Heartbeat**: Every 30 seconds
- **Log file**: `logs/agents/qa_YYYYMMDD_HHMMSS.log`

### Cost Profile
- **Frequency**: Medium (per feature/fix)
- **Impact**: Critical (final signoff)
- **Priority**: Quality > Speed (thorough validation)
- **Monthly estimate**: ~$31 (included in feature implementation + architecture migration costs)

---

## Spawn Sequence

### Execution Order
1. **Planning spawns at line 31** → Layer 1.1 → Strategic direction
2. **Research spawns at line 32** → Layer 1.2 → Information gathering
3. **Artifact spawns at line 33** → Layer 1.3 → Implementation
4. **ExecMon spawns at line 34** → Layer 1.4 → Continuous monitoring
5. **QA spawns at line 35** → Layer 1.5 → Quality validation

### Sequential Logic
```
Planning → defines what to build
    ↓
Research → gathers information
    ↓
Artifact → implements the code
    ↓
ExecMon → monitors execution
    ↓
QA → validates quality
```

### Timing
- All 5 agents spawn within 3 seconds (lines 31-36)
- `sleep 3` on line 36 allows agents to initialize
- Validation on lines 37-44 checks if all 5 are running

### Self-Healing
```bash
# Lines 39-44
if [ "$RUNNING" -eq 5 ]; then
  echo "✅ All 5 agents spawned successfully"
else
  echo "⚠️  Only $RUNNING/5 agents running - attempting self-heal..."
  npm run agents:heal
fi
```

**Healing Script**: `scripts/heal-agents.sh`
- Checks which agents are missing
- Respawns failed agents
- Validates all 5 are running
- Logs recovery history

---

## Token Economics

### Per-Agent Token Budgets

| Agent | Model | Context Window | Context Budget | Reserved for Conversation | Utilization % |
|-------|-------|---------------|----------------|---------------------------|---------------|
| **Planning** | Claude 3 Opus | 200K | 60K | 140K | 30% |
| **Research** | Gemini 1.5 Pro | 2M | 500K-1M | 1M-1.5M | 25-50% |
| **Artifact** | Task-dependent | 128K-200K | 30-50K | 78K-150K | 20-30% |
| **ExecMon** | DeepSeek Coder | 128K | 10-20K | 108K-118K | 8-16% |
| **QA** | Claude 3.5 Sonnet | 200K | 40-60K | 140K-160K | 20-30% |

### Total System Budget
- **Maximum concurrent context**: ~2.6M tokens (if all agents at max)
- **Typical concurrent context**: ~650K tokens (normal operation)
- **Reserved for conversations**: ~1.95M tokens across all agents

### Cost Breakdown (Monthly)

| Agent | Frequency | Cost/Month | Percentage |
|-------|-----------|------------|------------|
| **Planning** | Low | $14 | 9% |
| **Research** | Medium | $30 | 19% |
| **Artifact** | Highest | $94 | 61% |
| **ExecMon** | Continuous | $16 | 10% |
| **QA** | Medium | Included in Artifact | - |
| **TOTAL** | | **$154/month** | 100% |

### Cost Optimization Strategies

1. **Use cheapest model for high-frequency tasks** (ExecMon → DeepSeek)
2. **Use expensive models only for critical tasks** (Planning → Claude Opus)
3. **Cache frequently loaded context** (copilot-instructions.md)
4. **Load only relevant context** (service-scoped vs full codebase)
5. **Fallback to cheaper models** when quality bar met

---

## Inter-Agent Communication

### Communication Method
**Primary**: Claude Code Task Tool

**How It Works**:
1. Agent A needs help from Agent B
2. Agent A uses **TodoWrite** tool to create task for Agent B
3. Task includes:
   - Clear objective
   - Context/files to review
   - Expected output
   - Acceptance criteria
4. Agent B receives task via Task Tool
5. Agent B completes task, marks as done
6. Agent A reviews output, continues work

### Communication Protocol
**File**: `.claude/INTER_AGENT_COMMUNICATION_PROTOCOL.md`

**Key Rules**:
- Agents do NOT share memory (isolated tmux sessions)
- Agents communicate via **task tool** or **status files**
- Agents read status files to check health: `tmp/agent_status/*.status.json`
- Agents share context via **file system** (write/read artifacts)

### Shared Resources

**Agent Registry** (Live Status):
```json
// tmp/agent_status/shared/agent_registry.json
{
  "agents": {
    "planning": {"status": "running", "pid": 12345, "port": null},
    "research": {"status": "running", "pid": 12346, "port": null},
    "artifact": {"status": "running", "pid": 12347, "port": null},
    "execmon": {"status": "running", "pid": 12348, "port": null},
    "qa": {"status": "running", "pid": 12349, "port": null}
  },
  "last_update": "2025-10-28T16:27:31Z"
}
```

### Coordination Pattern

**Example: Feature Implementation**

1. **Planning** creates RPM plan → writes to `docs/rpm/FEATURE_X.md`
2. **Research** searches for best practices → writes to `docs/research/FEATURE_X_research.md`
3. **Artifact** reads both files → implements code → writes to `backend/feature-x/`
4. **ExecMon** monitors build → writes logs to `tmp/exec_logs/feature_x_build.log`
5. **QA** reads code + tests → validates → writes to `tmp/qa_reports/feature_x_validation.json`

**No direct agent-to-agent calls**. All coordination via file system + task tool.

---

## Health Monitoring

### Health Check Mechanism

**Heartbeat System**:
- Each agent writes status.json every 30 seconds
- ExecMon agent monitors all status files
- If status.json not updated in 60 seconds → agent considered DEAD
- Self-healing triggered automatically

### Status File Schema
```json
{
  "agent": "string (planning|research|artifact|execmon|qa)",
  "phase": "string (startup|running|monitor|complete)",
  "status": "string (running|stopped|error)",
  "started_at": "ISO8601 timestamp",
  "updated_at": "ISO8601 timestamp (heartbeat)",
  "finished_at": "ISO8601 timestamp or empty",
  "artifacts": ["array of file paths created"],
  "notes": "string (human-readable status)"
}
```

### Self-Healing Process

**Trigger**: Agent heartbeat > 60s old

**Actions**:
1. ExecMon detects stale heartbeat
2. Check if tmux session still exists: `tmux ls | grep {agent}`
3. If exists → kill session: `tmux kill-session -t {agent}`
4. Respawn agent: `tmux new-session -d -s {agent} "node agents/{agent}.js"`
5. Wait for new heartbeat (max 30s)
6. Log recovery: `logs/agent_recovery_history.json`

**Escalation**:
- If 3 failed restart attempts → ESCALATE
- Voice notification: "{Agent} failed to recover"
- Continue with 4/5 agents (degraded mode)

### System Health Dashboard

**Location**: `tmp/claude_tier1_state.json`

**Sample**:
```json
{
  "heartbeat": {
    "last_utc": "2025-10-28T16:27:31Z"
  },
  "foundation": {
    "rpm_planning": {
      "running": true,
      "since": "2025-10-28T15:10:28Z"
    },
    "research": {
      "running": true,
      "since": "2025-10-28T15:10:28Z"
    },
    "qa_guardrails": {
      "running": true,
      "since": "2025-10-28T15:10:28Z"
    }
  },
  "runtime": {
    "last_emit_utc": "2025-10-28T16:27:31Z",
    "last_health_utc": "2025-10-28T16:27:31Z"
  },
  "voice_mode": {
    "ready": true,
    "pid": ""
  },
  "stay_to_oned": true
}
```

---

## Boot Sequence Integration

### Pre-Agent Steps (Lines 1-30)

```bash
# Lines 1-15: Header and initialization
echo "LIV HANA SYSTEM OF TRUTH v2.0"
echo "Tier-1 Orchestration · 5-Agent Foundation"

# Lines 16-28: Agent registry creation
mkdir -p tmp/agent_status/shared
cat > tmp/agent_status/shared/agent_registry.json << 'EOF'
{
  "agents": {
    "planning": {"status": "starting", "pid": null, "port": null},
    "research": {"status": "starting", "pid": null, "port": null},
    "artifact": {"status": "starting", "pid": null, "port": null},
    "execmon": {"status": "starting", "pid": null, "port": null},
    "qa": {"status": "starting", "pid": null, "port": null}
  }
}
EOF

# Line 29: Spawn announcement
echo "🤖 Spawning 5 agents..."
```

### Agent Spawn (Lines 31-35)
```bash
# Line 31: Planning Agent
tmux new-session -d -s planning "node agents/planning.js"

# Line 32: Research Agent
tmux new-session -d -s research "node agents/research.js"

# Line 33: Artifact Agent
tmux new-session -d -s artifact "node agents/artifact.js"

# Line 34: ExecMon Agent
tmux new-session -d -s execmon "node agents/execmon.js"

# Line 35: QA Agent
tmux new-session -d -s qa "node agents/qa.js"
```

### Post-Agent Steps (Lines 36-87)

```bash
# Line 36: Wait for initialization
sleep 3

# Lines 37-44: Validation and self-healing
RUNNING=$(tmux ls 2>/dev/null | grep -E "planning|research|artifact|execmon|qa" | wc -l)
if [ "$RUNNING" -eq 5 ]; then
  echo "✅ All 5 agents spawned successfully"
else
  echo "⚠️  Only $RUNNING/5 agents running - attempting self-heal..."
  npm run agents:heal
fi

# Lines 46-47: Environment validation
echo "🔍 Validating environment..."
npm run validate:env

# Lines 49-50: Voice services
echo "🎤 Starting voice services (STT:2022, TTS:8880)..."
npm run voice:start

# Lines 53-74: Voice mode configuration
export LIV_MODE="voice-plan-only"
export LIV_DEPLOYMENT_AUTHORITY="human-only"
export VOICE_VAD_AGGRESSIVENESS=0
export VOICE_LISTEN_MIN=2.0
export VOICE_LISTEN_MAX=120

# Lines 76-82: Service orchestration
case "${1:-dev}" in
  dev) npm run docker:dev ;;
  prod) npm run docker:prod ;;
  empire) npm run docker:empire ;;
  local) npm run dev:all ;;
esac
```

---

## Debugging and Troubleshooting

### Check Agent Status
```bash
# View all tmux sessions
tmux ls

# Attach to agent session (view real-time output)
tmux attach -t planning
tmux attach -t research
tmux attach -t artifact
tmux attach -t execmon
tmux attach -t qa

# Detach from session: Ctrl+B, then D
```

### Check Agent Health
```bash
# View status files
cat tmp/agent_status/planning.status.json
cat tmp/agent_status/research.status.json
cat tmp/agent_status/artifact.status.json
cat tmp/agent_status/execmon.status.json
cat tmp/agent_status/qa.status.json

# View agent registry
cat tmp/agent_status/shared/agent_registry.json

# View system health
cat tmp/claude_tier1_state.json
```

### Check Agent Logs
```bash
# View recent logs
tail -f logs/agents/planning_*.log
tail -f logs/agents/research_*.log
tail -f logs/agents/artifact_*.log
tail -f logs/agents/execmon_*.log
tail -f logs/agents/qa_*.log
```

### Manually Restart Agent
```bash
# Kill agent session
tmux kill-session -t planning

# Respawn agent
tmux new-session -d -s planning "node agents/planning.js"

# Verify it's running
tmux ls | grep planning
```

### Run Self-Healing Script
```bash
# Auto-heal missing agents
npm run agents:heal

# Or directly
bash scripts/heal-agents.sh
```

### Common Issues

**Issue**: Agent not spawning
- **Cause**: tmux session already exists
- **Fix**: `tmux kill-session -t {agent}` then respawn

**Issue**: Agent not updating heartbeat
- **Cause**: Process crashed or hung
- **Fix**: Kill and respawn via self-healing script

**Issue**: All agents show "starting" status
- **Cause**: `agents/*.js` files don't exist (placeholder commands)
- **Expected**: This is normal - agents are managed via Claude Code Task Tool, not Node.js processes

**Issue**: Only 4/5 agents running
- **Cause**: One agent failed to spawn
- **Fix**: Self-healing script auto-triggers, or run `npm run agents:heal`

---

## Future Enhancements

### Planned Improvements

**Superintelligence Boot (Option B)**:
- Meta-cognitive boot validation (Liv Hana analyzes her own startup)
- Intent-driven resource orchestration (predict session purpose)
- Autonomous self-healing watchdog (continuous health monitoring)
- See: `docs/SUPERINTELLIGENCE_BOOT_ARCHITECTURE.md`

**Model Optimization (ARCH-MODEL-001)**:
- Task-specific model selection (5 models, 6 agents)
- 60% faster development
- 40% cost reduction
- See: `.claude/ARCH-MODEL-001-Agent-Role-Assignment-Matrix-20251027.md`

**Context Window Optimization**:
- Context caching (avoid reloading common files)
- Intelligent context selection (AI-powered relevance)
- Cross-agent context sharing (reduce duplication)

**Advanced Coordination**:
- Parallel agent execution (Planning + Research simultaneously)
- Dynamic priority queues (urgent tasks first)
- Workload balancing (distribute tasks across agents)

---

## References

### Internal Documentation
- **START.sh**: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/START.sh`
- **Spawn Script**: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/spawn-agents.sh`
- **Heal Script**: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/heal-agents.sh`
- **Agent Tracking**: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/agent_tracking/foundation_agents_20251028_101028.json`
- **Copilot Instructions**: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.github/copilot-instructions.md`

### Related Documents
- **Superintelligence Architecture**: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/docs/SUPERINTELLIGENCE_BOOT_ARCHITECTURE.md`
- **Model Assignment Matrix**: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/ARCH-MODEL-001-Agent-Role-Assignment-Matrix-20251027.md`
- **Session Progress**: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/SESSION_PROGRESS.md`

---

## Appendix: Quick Reference

### Agent Summary Table

| Agent | Layer | Model | Context Budget | Primary Responsibility | Monthly Cost |
|-------|-------|-------|----------------|------------------------|--------------|
| **Planning** | 1.1 | Claude 3 Opus | 60K | Strategic planning, RPM plans | $14 |
| **Research** | 1.2 | Gemini 1.5 Pro | 500K-1M | Web research, documentation search | $30 |
| **Artifact** | 1.3 | Task-dependent | 30-50K | Code implementation | $94 |
| **ExecMon** | 1.4 | DeepSeek Coder | 10-20K | Continuous monitoring | $16 |
| **QA** | 1.5 | Claude 3.5 Sonnet | 40-60K | Test generation, validation | Included |

### Command Reference

```bash
# View agents
tmux ls

# Attach to agent
tmux attach -t {agent}

# Kill agent
tmux kill-session -t {agent}

# Respawn agent
tmux new-session -d -s {agent} "node agents/{agent}.js"

# Self-heal
npm run agents:heal

# Check status
cat tmp/agent_status/{agent}.status.json

# View logs
tail -f logs/agents/{agent}_*.log

# Full system restart
./START.sh dev
```

---

**END OF SPECIFICATION**

**Status**: Complete technical reference for all 5 agents.

**Next Steps**: Use this document for debugging, onboarding, and system understanding.

**Version**: 1.0.0 - 2025-10-28
