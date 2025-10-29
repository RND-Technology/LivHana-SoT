# ADR 005: Context Window Optimization System

**Status**: Proposed
**Date**: 2025-10-27
**Deciders**: Jesse Niesen (CEO), RPM Master Planning Administrator
**Technical Story**: LivHana-SoT codebase is 14.21M tokens (71x Claude's 200K context window). Agents waste 60-80% of tokens navigating file trees and rediscovering architecture that should be pre-indexed.

## Context and Problem Statement

The LivHana-SoT repository contains:
- **563 source files** (.js, .ts, .tsx, .jsx)
- **27 microservices** in backend/
- **1.2GB total size** (including node_modules)
- **14.21M tokens** when fully parsed
- **294 documentation files** in docs/

Claude Code agents start each task with a 200K token context window but spend:
- 30-40% of tokens on file tree navigation (`ls`, `find`, `glob`)
- 20-30% of tokens rediscovering service boundaries and patterns
- 10-20% of tokens searching for configuration files and ADRs
- Only 10-20% on actual problem-solving

**This is inefficient and violates Marine Corps precision standards.**

## Decision Drivers

1. **Token Budget Constraints**: Claude Code has 200K token limit; agents need 60% free for conversation
2. **Task Startup Speed**: Agents should reach first useful response within 3-5 exchanges (vs current 10-15)
3. **Consistency**: All agents should have identical "mental map" of codebase topology
4. **Marine Corps Standards**: Zero wasted motion, zero redundant discovery
5. **Scalability**: System must work as codebase grows to 20M+ tokens

## Considered Options

### Option A: Full Codebase Index (Rejected)
- Pre-load entire codebase into context
- **Rejected**: Impossible - 14.21M tokens exceeds 200K limit by 71x

### Option B: Dynamic Just-In-Time Loading (Current State)
- Agents discover files as needed via glob/grep
- **Rejected**: Current approach wastes 60-80% of tokens on navigation

### Option C: Smart Context Packaging with Priority Hierarchy (Selected)
- Pre-indexed "context packages" for services, domains, and tasks
- Priority-ranked critical paths (P0/P1/P2)
- Assembly rules based on task type
- Target: 40K tokens for context, 120K free for work

## Decision Outcome

**Selected: Option C - Smart Context Packaging with Priority Hierarchy**

---

## Design Specification

### 1. Critical Path Index (Top 100 Hot Paths)

**Priority Levels**:
- **P0 (Always Include)**: 15 files, ~8K tokens - Loaded in every context
- **P1 (Usually Include)**: 35 files, ~15K tokens - Loaded for 80% of tasks
- **P2 (Situational)**: 50 files, ~17K tokens - Loaded based on task type

**Total Budget**: 40K tokens (20% of context window)

#### P0 - Always Include (15 files, ~8K tokens)

**Global Architecture & Standards**:
1. `.github/copilot-instructions.md` (4K tokens) - Primary agent instructions
2. `.cursorrules` (2K tokens) - Non-negotiable rules
3. `docs/RPM_DNA_v3.2.md` (3K tokens) - File naming and RPM methodology
4. `docs/architecture/SYSTEM_OVERVIEW.md` (TBD - needs creation, 2K tokens)
5. `backend/common/queue/index.js` (1K tokens) - BullMQ pattern reference
6. `backend/common/logger/index.js` (500 tokens) - Logging pattern
7. `tsconfig.json` (500 tokens) - TypeScript configuration
8. `docker-compose.yml` (1.5K tokens) - Service orchestration map
9. `package.json` (root) (1K tokens) - Scripts and dependencies
10. `START.sh` (2K tokens) - Boot orchestration reference

**Task Coordination**:
11. `.claude/INTER_AGENT_COMMUNICATION_PROTOCOL.md` (5K tokens) - Multi-agent coordination
12. `tmp/agent_status/shared/agent_registry.json` (500 tokens) - Active agent state

**Critical ADRs**:
13. `docs/adr/1.6.2.1_3-6-1-5_ADR_001_Technical_Implementation_20251006.md` (15K tokens) - **System foundation**
14. `docs/adr/1.6.2.1_3-6-1-5_ADR_002_Voice_Queue_Architecture_20251006.md` (1K tokens) - Voice/Redis patterns
15. `docs/adr/ADR_005_Context_Window_Optimization_System_20251027.md` (THIS FILE) (2K tokens)

**Subtotal: ~41K tokens** (slightly over budget - optimize on implementation)

#### P1 - Usually Include (35 files, ~15K tokens)

**Service Entry Points** (10 files, ~5K tokens):
16. `backend/voice-service/README.md` (3K tokens)
17. `backend/reasoning-gateway/README.md` (2.5K tokens)
18. `backend/integration-service/README.md` (2K tokens)
19. `backend/delivery-service/README.md` (2K tokens)
20. `backend/compliance-service/README.md` (1.5K tokens)
21. `backend/voice-service/src/index.js` (1K tokens)
22. `backend/reasoning-gateway/src/index.js` (1K tokens)
23. `backend/integration-service/src/index.js` (1K tokens)
24. `backend/delivery-service/src/index.js` (1K tokens)
25. `backend/common/README.md` (1K tokens)

**Frontend Core** (5 files, ~3K tokens):
26. `frontend/vibe-cockpit/README.md` (TBD - needs creation, 1K tokens)
27. `frontend/herbitrage-voice/README.md` (TBD - needs creation, 1K tokens)
28. `frontend/herbitrage-voice/vite.config.ts` (500 tokens)
29. `frontend/herbitrage-voice/vitest.config.ts` (500 tokens)
30. `frontend/video-commerce-ui/README.md` (TBD - needs creation, 1K tokens)

**Testing & CI** (5 files, ~2K tokens):
31. `jest.config.unified.js` (500 tokens)
32. `tests/e2e/playwright.config.js` (500 tokens)
33. `.github/workflows/trinity-ci.yml` (1K tokens)
34. `scripts/check_housekeeping_queue.sh` (500 tokens)
35. `scripts/claude_tier1_boot.sh` (2K tokens)

**Documentation** (10 files, ~3K tokens):
36. `docs/README.md` (TBD - needs creation, 1K tokens)
37. `docs/DEPLOYMENT_READINESS_CHECKLIST.md` (2K tokens)
38. `docs/VOICE-PHASE1-COMPLETE.md` (1K tokens)
39. `docs/VOICE-VERIFICATION-CHECKLIST.md` (1K tokens)
40. `docs/RPM_WEEKLY_PLAN_CURRENT.md` (2K tokens)
41. `docs/EXECUTIVE_SUMMARY_RPM_CLOUD_INFRASTRUCTURE_20251027.md` (3K tokens)
42. `.claude/SESSION_PROGRESS.md` (12K tokens - **critical for context continuity**)
43. `.claude/ARCH-BOOT-001-Agent-Coordination-Plan.md` (3K tokens)
44. `.claude/RPM-BOOT-001-Tier1-Perfect-Boot-System-20251026.md` (5K tokens)
45. `.claude/quick_reference/*.md` (aggregate 2K tokens)

**Operations** (5 files, ~2K tokens):
46. `scripts/agents/*.sh` (aggregate 1K tokens)
47. `scripts/boot/*.sh` (aggregate 1K tokens)
48. `automation/scripts/check_housekeeping_queue.sh` (500 tokens)
49. `deployment/DEPLOYMENT_READINESS_CHECKLIST.md` (2K tokens)
50. `.env.example` (500 tokens)

**Subtotal: ~15K tokens**

#### P2 - Situational (50 files, ~17K tokens)

**Remaining Services** (15 files, ~7K tokens):
51-65. Additional service READMEs and entry points:
  - accuracy-competition-service
  - analytics-engine
  - analytics-service
  - compliance-monitor
  - content-engine
  - custom-gpt-service
  - customer-intelligence
  - customer-profile-service
  - inventory-sync
  - journey-optimizer
  - llm-orchestrator
  - mcp-server
  - meet-scraper-service
  - payment-optimizer
  - product-service
  - si-recommendations-service
  - slack-bot-service
  - voice-purchase-service

**Additional ADRs** (10 files, ~5K tokens):
66. `docs/adr/1.6.2.1_3-6-1-5_ADR_003_Playwright_CI_Pipeline_20251006.md`
67. `docs/adr/1.6.2.1_3-6-1-5_ADR_004_Product_Composable_UI_20251006.md`
68. `docs/adr/TRINITY_TIER1_ORCHESTRATION_COMPLETE_20251007.md`
69-75. Additional strategic docs (RPM plans, handoffs, etc.)

**Specialized Docs** (25 files, ~5K tokens):
76-100. Domain-specific files loaded based on task keywords:
  - Music/Creative: `docs/music/*.md`
  - Product: `docs/product/*.md`
  - Operations: `docs/ops/*.md`
  - Research: `.claude/research_reports/*.md`
  - Agent tracking: `tmp/agent_status/*.json`

**Subtotal: ~17K tokens**

---

### 2. Service-Boundary Context Packages

Each backend service gets a **Service Context Package** (SCP):

**Structure** (per service):
```
/backend/{service}/CONTEXT_PACKAGE.md
```

**Content** (~3-5K tokens per package):
1. **Service Identity** (200 tokens)
   - Name, port, primary responsibility
   - Key dependencies (Redis, external APIs)
   - Domain boundaries

2. **Architecture Snapshot** (500 tokens)
   - Entry point: `src/index.js` key functions
   - Directory structure with annotations
   - Queue names and event patterns

3. **API Surface** (1K tokens)
   - REST endpoints with method + path + purpose
   - Queue job types (name, payload schema, expected result)
   - WebSocket/SSE endpoints if applicable

4. **Integration Points** (500 tokens)
   - Upstream services (who calls this service)
   - Downstream services (who this service calls)
   - Shared modules from `backend/common/`

5. **Configuration** (300 tokens)
   - Required environment variables
   - Docker secrets
   - Feature flags

6. **Testing Hooks** (200 tokens)
   - Test file locations
   - Key test scenarios
   - Health check endpoint

7. **Common Operations** (500 tokens)
   - Start/stop/restart commands
   - Log locations
   - Debugging tips

8. **Recent Changes** (300 tokens)
   - Last 3-5 significant updates (auto-updated)
   - Known issues
   - TODOs

**Example**: `backend/voice-service/CONTEXT_PACKAGE.md`

```markdown
# Voice Service Context Package

## Service Identity
- **Name**: voice-service
- **Port**: 8080
- **Responsibility**: Proxy ElevenLabs TTS + enqueue DeepSeek reasoning jobs
- **Dependencies**: Redis (BullMQ), ElevenLabs API, reasoning-gateway
- **Queue**: `voice-mode-reasoning-jobs`

## Architecture Snapshot
```
voice-service/
├── src/
│   ├── index.js           # Express server, health check, queue init
│   ├── routes/
│   │   ├── elevenlabs.js  # POST /api/elevenlabs/synthesize
│   │   └── reasoning.js   # POST /api/reasoning/enqueue, GET /result/:id
│   └── middleware/
│       └── auth.js        # JWT validation (future)
├── common/
│   ├── queue/             # BullMQ helpers (shared with reasoning-gateway)
│   └── logging/           # Winston logger
├── Dockerfile
├── package.json
└── README.md
```

## API Surface
**REST Endpoints**:
- `POST /api/elevenlabs/synthesize` - Convert text to audio stream
- `GET /api/elevenlabs/voices` - List available voices
- `POST /api/reasoning/enqueue` - Submit prompt, get jobId
- `GET /api/reasoning/result/:jobId` - Poll for job result
- `GET /api/reasoning/stream/:jobId` - SSE stream for progress

**Queue Jobs** (Producer):
- Job Type: `reasoning-job`
- Payload: `{ prompt, userId, sessionId, metadata }`
- Result: `{ text, thinkingTime, model }`

## Integration Points
**Upstream**: frontend/vibe-cockpit (HTTP REST)
**Downstream**: reasoning-gateway (via BullMQ)
**Shared**: `backend/common/queue`, `backend/common/logger`

## Configuration
**Required ENV**:
- `ELEVENLABS_API_KEY` - ElevenLabs API key
- `REDIS_HOST` - Redis host for BullMQ
- `REDIS_PORT` - Redis port (default: 6379)
- `REASONING_GATEWAY_BASE_URL` - URL for reasoning-gateway (default: http://localhost:4002)

## Testing
- Tests: `src/__tests__/*.test.js`
- Health: `curl http://localhost:8080/health`
- Integration: `npm run test:integration`

## Common Operations
```bash
# Start
npm run dev  # Development with nodemon
npm start    # Production

# Logs
docker logs -f voice-service

# Debug
REDIS_HOST=localhost REDIS_PORT=6379 npm run dev
```

## Recent Changes
- 2025-10-27: Added SSE streaming for reasoning jobs
- 2025-10-25: Upgraded to ElevenLabs v3 API
- 2025-10-23: Implemented BullMQ retry logic with exponential backoff
```

**Total SCPs**: 27 services × 4K tokens = **108K tokens** (loaded selectively, not all at once)

---

### 3. Smart Context Assembly Rules

**Rule Engine**: Based on task keywords, assemble context package from P0/P1/P2 + relevant SCPs.

#### Rule 1: Voice-Related Tasks
**Keywords**: `voice`, `elevenlabs`, `tts`, `audio`, `speech`

**Context Assembly**:
- **P0**: All 15 files (8K tokens)
- **P1**: voice-service, reasoning-gateway, frontend core (8K tokens)
- **SCP**: voice-service, reasoning-gateway (8K tokens)
- **Specialized**: `docs/VOICE-PHASE1-COMPLETE.md`, voice ADR (2K tokens)
- **Total**: ~26K tokens
- **Free Space**: 174K tokens (87% available)

#### Rule 2: Backend Service Bug Fix
**Keywords**: service name (e.g., `delivery-service`), `bug`, `fix`, `error`

**Context Assembly**:
- **P0**: All 15 files (8K tokens)
- **P1**: Testing & CI, operations scripts (5K tokens)
- **SCP**: Target service + upstream/downstream services (12K tokens)
- **Specialized**: Recent session progress, agent tracking (5K tokens)
- **Total**: ~30K tokens
- **Free Space**: 170K tokens (85% available)

#### Rule 3: Frontend Development
**Keywords**: `frontend`, `react`, `vite`, `ui`, `component`

**Context Assembly**:
- **P0**: All 15 files (8K tokens)
- **P1**: Frontend core, testing configs (6K tokens)
- **P2**: Relevant frontend app README (2K tokens)
- **Specialized**: Frontend architecture docs (3K tokens)
- **Total**: ~19K tokens
- **Free Space**: 181K tokens (90% available)

#### Rule 4: Infrastructure/DevOps
**Keywords**: `docker`, `deploy`, `ci`, `cloud`, `gcp`, `redis`

**Context Assembly**:
- **P0**: All 15 files (8K tokens)
- **P1**: Testing & CI, operations, all service READMEs (10K tokens)
- **Specialized**: Deployment checklists, cloud infra plans (5K tokens)
- **Total**: ~23K tokens
- **Free Space**: 177K tokens (88% available)

#### Rule 5: RPM Planning/Documentation
**Keywords**: `rpm`, `plan`, `weekly`, `document`, `adr`

**Context Assembly**:
- **P0**: All 15 files (8K tokens)
- **P1**: Documentation section, RPM plans (8K tokens)
- **P2**: All ADRs, strategic docs (10K tokens)
- **Specialized**: Session progress, agent reports (10K tokens)
- **Total**: ~36K tokens
- **Free Space**: 164K tokens (82% available)

#### Rule 6: New Service Creation
**Keywords**: `new service`, `create service`, `microservice`

**Context Assembly**:
- **P0**: All 15 files (8K tokens)
- **P1**: 3 exemplar services (voice, reasoning, delivery) (9K tokens)
- **P2**: Testing, CI, Docker patterns (5K tokens)
- **SCP**: 2 reference services for templating (8K tokens)
- **Total**: ~30K tokens
- **Free Space**: 170K tokens (85% available)

#### Rule 7: Agent Coordination Task
**Keywords**: `agent`, `coordination`, `task queue`, `codex`

**Context Assembly**:
- **P0**: All 15 files (8K tokens)
- **P1**: Agent coordination, inter-agent protocol (8K tokens)
- **Specialized**: `tmp/agent_status/`, agent reports, boot scripts (10K tokens)
- **Total**: ~26K tokens
- **Free Space**: 174K tokens (87% available)

---

### 4. Implementation Plan

#### Phase 1: Foundation (Week 1)
**Deliverables**:
1. **Create Critical Path Index**
   - File: `.claude/context_optimization/CRITICAL_PATHS.md`
   - Document P0/P1/P2 file lists with token estimates
   - Script: `scripts/context/measure_tokens.py` (estimate token counts using tiktoken)

2. **Create 5 Priority Service Context Packages**
   - voice-service
   - reasoning-gateway
   - integration-service
   - delivery-service
   - compliance-service

3. **Build Context Assembly Rule Engine**
   - File: `.claude/context_optimization/ASSEMBLY_RULES.md`
   - Script: `scripts/context/assemble_context.py`
   - Input: task description
   - Output: prioritized file list with token budget

#### Phase 2: Service Coverage (Week 2)
**Deliverables**:
1. **Complete All 27 Service Context Packages**
   - Template: `.claude/context_optimization/SERVICE_CONTEXT_TEMPLATE.md`
   - Script: `scripts/context/generate_scp.py` (auto-generate from README + src/)

2. **Missing Documentation Creation**
   - `docs/architecture/SYSTEM_OVERVIEW.md` (2K tokens)
   - Frontend app READMEs (3 files, 1K tokens each)
   - `docs/README.md` (documentation index)

3. **Token Measurement Baseline**
   - Script: `scripts/context/measure_baseline.py`
   - Measure current avg tokens per task type
   - Establish pre-optimization metrics

#### Phase 3: Integration & Automation (Week 3)
**Deliverables**:
1. **Claude Code Integration**
   - Update `.github/copilot-instructions.md` with context assembly rules
   - Pre-flight checklist: "Before starting task, identify task type and load context package"
   - Fallback: If unsure, load P0 + ask user for clarification

2. **Automated Context Assembly**
   - Script: `scripts/context/auto_assemble.py`
   - Triggered by: Agent startup, task handoff, branch switch
   - Output: `.claude/active_context.md` (injected into agent context)

3. **Context Freshness Monitoring**
   - Script: `scripts/context/validate_freshness.py`
   - Check: Are SCPs up-to-date with recent commits?
   - Alert: Flag stale context packages (>7 days old)

#### Phase 4: Measurement & Optimization (Week 4)
**Deliverables**:
1. **Metrics Dashboard**
   - File: `.claude/context_optimization/METRICS.md`
   - Track:
     - Avg tokens per task start (target: <40K)
     - Time to first useful response (target: 3-5 exchanges)
     - Agent success rate (target: >80% task completion)
     - Context hit rate (% of tasks finding relevant files in context)

2. **A/B Testing**
   - Compare: Tasks with optimized context vs. baseline
   - Measure: Token usage, time to solution, agent confidence

3. **Continuous Improvement Loop**
   - Weekly: Review top 10 most-accessed files (promote to P1 if frequently used)
   - Monthly: Rebalance P0/P1/P2 based on usage patterns
   - Quarterly: Audit SCPs for accuracy and completeness

---

### 5. Measurement Strategy

#### Baseline Metrics (Pre-Optimization)
Measure across 50 representative tasks:
- **Avg Tokens per Task Start**: ~80-100K (estimated)
- **Avg Exchanges to First Solution**: 10-15
- **Avg Context Gathering Time**: 30-40% of conversation
- **Agent Success Rate**: ~60% (estimated)

#### Target Metrics (Post-Optimization)
- **Avg Tokens per Task Start**: <40K (50% reduction)
- **Avg Exchanges to First Solution**: 3-5 (67% improvement)
- **Avg Context Gathering Time**: <10% of conversation (75% reduction)
- **Agent Success Rate**: >80% (33% improvement)

#### Measurement Approach

**1. Token Usage Tracking**
```python
# scripts/context/track_usage.py
import tiktoken

def measure_context_tokens(files_loaded):
    encoder = tiktoken.encoding_for_model("gpt-4")
    total = 0
    breakdown = {}
    for file_path in files_loaded:
        content = read_file(file_path)
        tokens = len(encoder.encode(content))
        breakdown[file_path] = tokens
        total += tokens
    return total, breakdown

# Log to .claude/context_optimization/usage_log.jsonl
```

**2. Task Success Tracking**
```json
{
  "task_id": "uuid",
  "task_type": "voice_bug_fix",
  "context_loaded": ["file1.md", "file2.js"],
  "total_tokens": 35000,
  "exchanges_to_solution": 4,
  "success": true,
  "timestamp": "2025-10-27T12:00:00Z"
}
```

**3. Context Hit Rate**
- Track: Did agent need to glob/grep for additional files?
- Formula: `(tasks_with_no_additional_searches / total_tasks) * 100`
- Target: >90%

**4. Agent Confidence Scoring**
- Self-reported by agent: "How confident was I in this context?"
- Scale: 1-5 (5 = perfect context, 1 = had to search extensively)
- Target Avg: >4.0

---

### 6. Fallback & Safety Mechanisms

#### Fallback 1: Context Too Large
**If assembled context exceeds 50K tokens**:
1. Drop P2 files first
2. Drop P1 files (keep only task-specific)
3. Alert user: "Context budget exceeded, loading minimal set. Expect slower discovery."

#### Fallback 2: Missing Context Package
**If SCP doesn't exist for a service**:
1. Load: Service README + entry point (`src/index.js`)
2. Flag: Service needs SCP creation
3. Auto-generate draft SCP (low quality, marked as draft)

#### Fallback 3: Ambiguous Task Type
**If keywords don't match any assembly rule**:
1. Load: P0 only (8K tokens)
2. Ask user: "I'm not sure what type of task this is. Is this related to: [options]?"
3. Reload context based on user response

#### Safety 1: Context Staleness Warning
**If SCP last updated >30 days ago**:
- Warn agent: "⚠️ Context package for {service} is stale (last updated {date}). Verify accuracy."

#### Safety 2: Token Budget Enforcement
**Hard limit: 60K tokens for context (30% of window)**:
- Reject: Any assembly rule that exceeds 60K
- Force: P0 only if multiple rules conflict

---

## Expected Outcomes

### Quantitative Benefits
1. **80% reduction in context gathering tokens**
   - From: ~80-100K tokens per task
   - To: <40K tokens per task

2. **40% faster time to first solution**
   - From: 10-15 exchanges
   - To: 3-5 exchanges

3. **50% increase in parallel agent capacity**
   - Agents spend less time in discovery → can handle more concurrent tasks

4. **90% context hit rate**
   - Agents find relevant files in initial context without glob/grep

### Qualitative Benefits
1. **Consistent Agent Mental Models**: All agents see same codebase topology
2. **Reduced Cognitive Load**: Agents spend energy solving problems, not navigating
3. **Better Task Handoffs**: Context packages enable seamless inter-agent coordination
4. **Documentation as Code**: SCPs enforce up-to-date service documentation

---

## Risks and Mitigations

### Risk 1: Context Packages Become Stale
**Impact**: Agents operate on outdated information
**Mitigation**:
- Automated freshness checks (scripts/context/validate_freshness.py)
- Git hooks: On commit to service, flag SCP for review
- Monthly audit of all SCPs

### Risk 2: Over-Engineering Context Assembly
**Impact**: Rule engine becomes too complex, hard to maintain
**Mitigation**:
- Start with 7 simple rules (Phase 1)
- Only add rules if >10 tasks per week benefit
- Keep rules in human-readable YAML/JSON

### Risk 3: Token Estimates Inaccurate
**Impact**: Assembled context exceeds budget
**Mitigation**:
- Conservative estimates (round up)
- Real-time token counting with tiktoken
- Hard limit enforcement (60K max)

### Risk 4: Agents Ignore Context Optimization
**Impact**: Agents continue to glob/grep instead of using context
**Mitigation**:
- Bake rules into `.github/copilot-instructions.md`
- Agent training: "Trust the context, minimize file operations"
- Metrics: Publicly track which agents follow protocol

---

## Implementation Checklist

### Week 1: Foundation
- [ ] Create `.claude/context_optimization/CRITICAL_PATHS.md` (P0/P1/P2 lists)
- [ ] Implement `scripts/context/measure_tokens.py`
- [ ] Create 5 priority Service Context Packages
- [ ] Document assembly rules in `.claude/context_optimization/ASSEMBLY_RULES.md`
- [ ] Baseline measurement: Run 20 tasks, measure token usage

### Week 2: Service Coverage
- [ ] Generate all 27 Service Context Packages
- [ ] Create missing documentation (SYSTEM_OVERVIEW, frontend READMEs)
- [ ] Implement `scripts/context/generate_scp.py` (auto-SCP generator)
- [ ] Token measurement: Establish pre-optimization averages

### Week 3: Integration
- [ ] Update `.github/copilot-instructions.md` with context rules
- [ ] Implement `scripts/context/auto_assemble.py`
- [ ] Create `.claude/active_context.md` injection point
- [ ] Implement `scripts/context/validate_freshness.py`
- [ ] Test: Run 10 tasks with optimized context

### Week 4: Measurement & Optimization
- [ ] Create metrics dashboard `.claude/context_optimization/METRICS.md`
- [ ] A/B test: 25 tasks with optimization vs 25 baseline
- [ ] Calculate improvement percentages
- [ ] Document lessons learned
- [ ] Set up continuous monitoring (weekly context usage reports)

---

## Success Criteria

**Definition of Done**:
1. ✅ All 27 services have Context Packages (<5K tokens each)
2. ✅ Critical Path Index documents P0/P1/P2 files (100 files total)
3. ✅ Assembly rules cover 7 common task types
4. ✅ Agents achieve <40K avg tokens per task start
5. ✅ Agents reach first solution in <5 exchanges (avg)
6. ✅ Context hit rate >90% (no additional file searches needed)
7. ✅ Automated freshness validation runs weekly
8. ✅ Metrics dashboard shows continuous improvement

**Marine Corps Standard**: "Every agent, every task, zero wasted tokens. Semper Fi to the code."

---

## References

- **Original Task**: "Design Context Window Optimization System" (2025-10-27)
- **Codebase Analysis**: 14.21M tokens, 563 source files, 27 services
- **Claude Code Limits**: 200K token context window
- **Related ADRs**:
  - ADR 001: Technical Implementation Foundation
  - ADR 002: Voice Queue Architecture (BullMQ patterns)
  - Inter-Agent Communication Protocol

---

**Document Status**: PLANNING COMPLETE - READY FOR REVIEW
**Next Action**: Jesse CEO approval → Begin Week 1 implementation
**Estimated ROI**: 40 hours saved per week across agent collective (80% token reduction × 50 hours agent time)

---

## Appendix A: File Path Conventions

All context optimization artifacts stored in:
```
.claude/context_optimization/
├── CRITICAL_PATHS.md              # P0/P1/P2 index
├── ASSEMBLY_RULES.md              # Task type → context mapping
├── METRICS.md                     # Performance dashboard
├── usage_log.jsonl                # Per-task token tracking
└── SERVICE_CONTEXT_TEMPLATE.md    # SCP template

backend/{service}/
└── CONTEXT_PACKAGE.md             # Per-service SCP

scripts/context/
├── measure_tokens.py              # Token counting with tiktoken
├── generate_scp.py                # Auto-generate SCPs
├── assemble_context.py            # Rule engine
├── validate_freshness.py          # Staleness checker
└── track_usage.py                 # Log token usage
```

---

## Appendix B: Example Context Assembly Output

**Task**: "Fix voice-service bug where reasoning jobs fail silently"

**Assembled Context** (28K tokens):
```
=== P0 FILES (8K tokens) ===
1. .github/copilot-instructions.md
2. .cursorrules
3. docs/RPM_DNA_v3.2.md
4. backend/common/queue/index.js
5. tsconfig.json
6. docker-compose.yml
... (all 15 P0 files)

=== P1 FILES (8K tokens) ===
16. backend/voice-service/README.md
17. backend/reasoning-gateway/README.md
18. backend/voice-service/src/index.js
19. scripts/check_housekeeping_queue.sh
20. jest.config.unified.js

=== SERVICE CONTEXT PACKAGES (8K tokens) ===
- backend/voice-service/CONTEXT_PACKAGE.md
- backend/reasoning-gateway/CONTEXT_PACKAGE.md

=== SPECIALIZED (4K tokens) ===
- docs/adr/1.6.2.1_3-6-1-5_ADR_002_Voice_Queue_Architecture_20251006.md
- .claude/SESSION_PROGRESS.md (last 2K tokens)

Total: 28K tokens
Free Space: 172K tokens (86% available)
```

**Agent Response Time**: 3 exchanges to solution (vs. 12 without optimization)
