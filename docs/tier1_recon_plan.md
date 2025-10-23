---
diataxis: reference
owner: RPM Planning Agent (Layer 1.1.1)
created: 2025-10-23T05:35:00Z
last-updated: 2025-10-23T05:35:00Z
model: GPT-5 High (transitioning from GPT-4.1)
---

# Tier-1 Reconnaissance & Task Priority Plan

**RPM Planning Agent Status**: ACTIVE
**Session**: 2025-10-23 05:35:00 UTC
**Mission**: Universal task registry + RPM DNA coordination for Liv Hana Layer 1.1.0

---

## EXECUTIVE SUMMARY FOR LIV HANA

**CRITICAL BLOCKERS IDENTIFIED:**
1. Node v24.10.0 running (requires v20.x) - ALL execution blocked
2. QA model incorrectly configured as GPT-4.1 (should be GPT-5)
3. Research agent status file missing - voice orchestration incomplete

**IMMEDIATE ACTION REQUIRED:**
- Node version downgrade to v20.x via nvm
- QA model specification update in TIER1_FUNNEL_AUTHORITY.md
- Research agent initialization or status file creation

**EXECUTION READINESS:** 🔴 BLOCKED (0% ready until Node version resolved)

---

## RESULTS COMMITTED (RPM DNA)

### Result 1: CODEX Task Queue Prioritized & Executable
**Purpose**: Enable seamless execution pipeline by removing all blockers and sequencing tasks by strategic impact
**Status**: IN PROGRESS (blocked by Node version)
**Completion Criteria**: All 15 pending tasks prioritized, dependencies mapped, execution order defined

### Result 2: QA Validation Pipeline Upgraded to GPT-5
**Purpose**: Ensure maximum quality validation using cutting-edge model capabilities
**Status**: PENDING (documentation update required)
**Completion Criteria**: TIER1_FUNNEL_AUTHORITY.md updated, QA agent reinitialized with GPT-5

### Result 3: Mobile Control Foundation Complete
**Purpose**: Enable Jesse to command Liv Hana from anywhere via Slack + Tailscale
**Status**: PENDING (5 high-priority tasks queued)
**Completion Criteria**: Slack bridge secure, tmux helpers deployed, voice CLI mobile-accessible

---

## MASSIVE ACTION PLAN (MAP)

### PHASE 1: CRITICAL BLOCKERS (DO FIRST)

#### Action 1.1: Resolve Node Version Blocker
**Task**: Install Node v20.x and verify environment
**Owner**: HUMAN (Jesse/Ops) - requires manual nvm intervention
**Priority**: CRITICAL
**Estimated Time**: 5 minutes
**Commands**:
```bash
nvm install 20
nvm use 20
nvm alias default 20
node -v  # verify v20.x.x
```
**Validation**: `node -v` returns v20.x.x, exec.status.json shows preflight pass
**Blockers Removed**: codex-fix-001 through codex-cli-fix-001 (ALL tasks)

#### Action 1.2: Update QA Model Specification
**Task**: Update TIER1_FUNNEL_AUTHORITY.md line 50 - QA model from GPT-4.1 to GPT-5
**Owner**: CODEX (codex-fix-001)
**Priority**: CRITICAL
**File**: `.claude/TIER1_FUNNEL_AUTHORITY.md`
**Change**: Line 50 - `| **1.1.3** | QA Subagent | 🛡️🤖 Sonnet 4.5 OCT 2025 text / GPT-4.1 |`
  → `| **1.1.3** | QA Subagent | 🛡️🤖 Sonnet 4.5 OCT 2025 text / GPT-5 |`
**Validation**: Grep verification shows GPT-5, QA agent relaunches with correct model

#### Action 1.3: Verify 5 Subagents in Authority Document
**Task**: Structural verification of Layer 1.1 subagent definitions
**Owner**: CODEX (codex-fix-006)
**Priority**: CRITICAL
**Validation Criteria**:
- Planning (1.1.1): GPT-5 High Fast → GPT-5 High ✅
- Research (1.1.2): Networked GPT + Perplexity/Apify ✅
- QA (1.1.3): Sonnet 4.5 OCT / GPT-5 (pending fix)
- Artifact+Exec (1.1.4): Claude Code/GPT-4.1 + Cheetah ✅
- All have emojis, responsibilities, outputs ✅

---

### PHASE 2: HIGH-PRIORITY MOBILE CONTROL (DO SECOND)

#### Action 2.1: Implement Slack Signature Verification
**Task**: Create HMAC SHA256 signature verification module
**Owner**: CODEX (codex-mobile-007)
**Priority**: HIGH
**File**: `backend/integration-service/src/slack/signature-verify.ts`
**Dependencies**: None
**Security Impact**: Prevents unauthorized Slack command injection
**Estimated Lines**: 50-80 lines
**References**: Slack signing secrets documentation

#### Action 2.2: Enhance Slack Bridge Security
**Task**: Add JWT middleware + signature verification to existing bridge
**Owner**: CODEX (codex-mobile-008)
**Priority**: HIGH
**File**: `backend/integration-service/src/slack/bridge.ts`
**Dependencies**: codex-mobile-007 MUST complete first
**Security Impact**: Full authentication + authorization chain
**Estimated Lines**: 30-50 lines modification

#### Action 2.3: Create Redis Queue Consumer for Reasoning Gateway
**Task**: Build job consumer for reasoning.jobs queue
**Owner**: CODEX (codex-mobile-009)
**Priority**: HIGH
**File**: `backend/reasoning-gateway/src/jobs/slack-commands.ts`
**Dependencies**: None
**Purpose**: Process Slack commands through reasoning pipeline
**Estimated Lines**: 100-150 lines

#### Action 2.4: Generate Slack App Manifest
**Task**: Create deployable Slack app configuration
**Owner**: CODEX (codex-mobile-010)
**Priority**: HIGH
**File**: `config/slack-app-manifest.json`
**Dependencies**: None
**Contents**: `/agent` command definition, interactivity endpoints, OAuth scopes
**Estimated Lines**: 50-100 lines JSON

#### Action 2.5: Custom Greeting Integration
**Task**: Extract Jesse's custom greeting from birth files, integrate into boot prompt
**Owner**: CODEX (codex-fix-002)
**Priority**: HIGH
**File**: `scripts/claude_tier1_boot.sh`
**Search Locations**: `.claude/birth/`, `.claude/prompts/`, `docs/COMMANDER_*.md`
**Purpose**: Personalize Liv Hana voice greeting per Jesse's original vision

---

### PHASE 3: MEDIUM-PRIORITY INFRASTRUCTURE (DO THIRD)

#### Action 3.1: Create Watchdog Script
**Task**: Implement missing watch-session-progress.sh referenced by boot script
**Owner**: CODEX (codex-mobile-013)
**Priority**: MEDIUM
**File**: `scripts/watch-session-progress.sh`
**Purpose**: Monitor SESSION_PROGRESS.md for critical events, alert Jesse
**Estimated Lines**: 80-120 lines bash
**Features**: Tail -f with pattern matching, Slack notifications, auto-rotation

#### Action 3.2: Create tmux Helper Scripts
**Task**: Build mobile control helpers for voice CLI persistence
**Owner**: CODEX (codex-mobile-011)
**Priority**: MEDIUM
**Files**:
  - `scripts/mobile/vmute.sh`
  - `scripts/mobile/vresume.sh`
  - `scripts/mobile/vstatus.sh`
**Purpose**: Enable mobile pause/resume/status for voice sessions
**Estimated Lines**: 30-50 lines each

#### Action 3.3: Create tmux Session Bootstrap
**Task**: Build persistent voice CLI session starter
**Owner**: CODEX (codex-mobile-012)
**Priority**: MEDIUM
**File**: `scripts/mobile/start-voice-session.sh`
**Purpose**: Launch voice CLI in detached tmux session for mobile access
**Estimated Lines**: 50-80 lines

#### Action 3.4: Create Research Agent Retry Logic
**Task**: Wrapper script to handle API 500 errors gracefully
**Owner**: CODEX (codex-fix-003)
**Priority**: MEDIUM
**File**: `scripts/guards/research_agent_retry.sh`
**Purpose**: Prevent research agent failures from blocking pipeline
**Estimated Lines**: 40-60 lines bash
**Features**: Exponential backoff, max retries, logging

---

### PHASE 4: LOW-PRIORITY DOCUMENTATION (DO LAST)

#### Action 4.1: Update Revenue Baseline References
**Task**: Global find-replace $108/day → $3k/day across all docs
**Owner**: CODEX (codex-fix-005)
**Priority**: LOW
**Scope**: `docs/*.md`
**Purpose**: Reflect new revenue reality post-deployment
**Estimated Files**: 5-10 files
**Validation**: Grep verification shows no $108 references

#### Action 4.2: Create COMMANDER_CODEX_ORDERS.md
**Task**: Establish human-to-CODEX directive file
**Owner**: CODEX (codex-mobile-015)
**Priority**: LOW
**File**: `COMMANDER_CODEX_ORDERS.md`
**Purpose**: Boot script references this for Jesse directives
**Contents**: Template for directive format, examples, escalation paths
**Estimated Lines**: 100-150 lines

#### Action 4.3: Enhance Mobile Control Documentation
**Task**: COMPLETED (codex-mobile-014)
**Owner**: CODEX
**Priority**: LOW
**File**: `docs/mobile-control.md`
**Status**: ✅ COMPLETE (Patch applied by external CODEX - file updated with all mobile control sections)

---

### PHASE 5: SYSTEM MAINTENANCE (MANUAL)

#### Action 5.1: Fix Claude CLI Auto-Update
**Task**: Resolve npm global conflict blocking Claude CLI updates
**Owner**: HUMAN (Jesse/Ops) - requires sudo
**Priority**: CRITICAL (but not blocking current work)
**Manual Steps**:
```bash
# Document current state
npm list -g @anthropic-ai/claude-code
which claude

# Attempt removal
npm rm -g @anthropic-ai/claude-code

# If fails with ENOTEMPTY:
sudo rm -rf /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code

# Reinstall via Homebrew
brew reinstall anthropic-ai/claude-code/claude-code

# Verify
which claude  # Should return /opt/homebrew/bin/claude
claude --version
claude doctor  # Run from interactive terminal
```
**Rollback**: `cp ~/.zshrc.backup.* ~/.zshrc` if PATH breaks

---

## TASK DEPENDENCY GRAPH

```
CRITICAL PATH (blocks ALL):
├─ Action 1.1: Node v20.x install ⚠️ BLOCKER
│  └─ Unblocks: ALL 16 CODEX tasks
│
├─ Action 1.2: QA model → GPT-5 ⚠️ BLOCKER
│  └─ Unblocks: QA validation pipeline
│
└─ Action 1.3: Verify 5 subagents ⚠️ BLOCKER
   └─ Unblocks: Voice orchestration confidence

MOBILE CONTROL PATH (sequential):
├─ Action 2.1: Signature verification (independent)
│  └─ Action 2.2: Bridge security (depends on 2.1)
│
├─ Action 2.3: Redis consumer (independent)
├─ Action 2.4: Slack manifest (independent)
└─ Action 2.5: Custom greeting (independent)

INFRASTRUCTURE PATH (parallel):
├─ Action 3.1: Watchdog script (independent)
├─ Action 3.2: tmux helpers (independent)
├─ Action 3.3: tmux bootstrap (independent)
└─ Action 3.4: Retry logic (independent)

DOCUMENTATION PATH (parallel):
├─ Action 4.1: Revenue baseline update (independent)
└─ Action 4.2: COMMANDER file (independent)
```

---

## COORDINATION PROTOCOL

### With Research Agent (1.1.2)
**Status**: ❌ MISSING - No research.status.json found
**Expected Location**: `tmp/agent_status/research.status.json`
**Action Required**: Launch research agent OR create placeholder status
**Coordination**: Once active, monitor for `status: passed` before voice gating

### With QA Agent (1.1.3)
**Status**: ❌ MISSING - No qa.status.json found
**Expected Location**: `tmp/agent_status/qa.status.json`
**Action Required**: Launch QA agent after Node version fixed
**Coordination**: Monitors exec.status.json for changes, auto-triggers validation

### With Artifact+Exec (1.1.4 / CODEX)
**Status**: ✅ ACTIVE - exec.status.json present (failed state)
**Last Run**: 2025-10-23T02:13:42Z
**Failure**: Node version v24.7.0 → v20.x required
**Coordination**: Queue tasks in codex_tasks.json, monitor artifact.status.json

### With Liv Hana Voice (1.1.0)
**Status**: ⚠️ AWAITING BRIEFING
**Briefing Content**:
  - 3 CRITICAL blockers identified
  - 15 tasks prioritized across 4 phases
  - Node version is HARD BLOCKER for all execution
  - Mobile control pipeline ready for CODEX execution
**Approval Required**: Voice gate approval before Ops deployment

---

## FUNNEL STAGE TRACKING

| Task ID | Funnel Stage | Status | Next Gate |
|---------|--------------|--------|-----------|
| codex-fix-001 | Top (Planning) | Pending | Node version resolution |
| codex-fix-002 | Top (Planning) | Pending | Node version resolution |
| codex-fix-003 | Middle (Implementation) | Pending | Node version resolution |
| codex-fix-004 | Middle (Implementation) | Pending | Node version resolution |
| codex-fix-005 | Bottom (Completion) | Pending | Node version resolution |
| codex-fix-006 | Top (Planning) | Pending | Node version resolution |
| codex-mobile-007 | Middle (Implementation) | Pending | Node version resolution |
| codex-mobile-008 | Middle (Implementation) | Pending | codex-mobile-007 + Node |
| codex-mobile-009 | Middle (Implementation) | Pending | Node version resolution |
| codex-mobile-010 | Bottom (Completion) | Pending | Node version resolution |
| codex-mobile-011 | Middle (Implementation) | Pending | Node version resolution |
| codex-mobile-012 | Middle (Implementation) | Pending | Node version resolution |
| codex-mobile-013 | Middle (Implementation) | Pending | Node version resolution |
| codex-mobile-014 | Bottom (Completion) | ✅ Complete | N/A |
| codex-mobile-015 | Bottom (Completion) | Pending | Node version resolution |
| codex-cli-fix-001 | Top (Planning) | Pending | Manual intervention |

**Funnel Health**: 🔴 BLOCKED at Top due to Node version
**Velocity**: 0 tasks/hour (execution pipeline halted)
**Forecast**: 5 minutes to unblock → 3-4 hours to complete all 15 tasks

---

## RPM WEEKLY ROLLUP (Week of Oct 23, 2025)

### COMPLETIONS THIS WEEK
- ✅ codex-mobile-014: Mobile control documentation updated

### IN-PROGRESS THIS WEEK
- 🔄 Node version resolution (CRITICAL PATH)
- 🔄 QA model upgrade specification
- 🔄 Mobile control security implementation (5 tasks)
- 🔄 Infrastructure scripts (4 tasks)

### UPCOMING PRIORITIES NEXT WEEK
- Mobile control deployment to production
- Revenue baseline documentation updates
- Claude CLI auto-update resolution
- Research agent activation and integration

---

## METRICS & KPIs

**Task Completion Rate**: 1/16 (6.25%)
**Critical Blockers**: 3
**High-Priority Tasks**: 5
**Estimated Completion Time**: 3-4 hours (post-Node fix)
**Risk Level**: HIGH (Node version blocking ALL execution)
**Coordination Health**: MEDIUM (2/4 agents missing status files)

---

## ESCALATION ALERTS

### 🚨 ALERT 1: Node Version HARD BLOCKER
**Severity**: CRITICAL
**Impact**: ALL 15 pending tasks blocked
**Owner**: Jesse/Ops (manual intervention required)
**SLA**: 5 minutes to resolve
**Escalation Path**: This alert → Liv Hana voice → Jesse approval → Ops execution

### 🚨 ALERT 2: QA Model Downgrade Risk
**Severity**: CRITICAL
**Impact**: Quality validation using outdated GPT-4.1 instead of GPT-5
**Owner**: CODEX (codex-fix-001)
**SLA**: 10 minutes to resolve (after Node fix)
**Escalation Path**: This alert → CODEX task queue → Jesse approval

### ⚠️ ALERT 3: Missing Agent Status Files
**Severity**: HIGH
**Impact**: Voice orchestration cannot verify research/QA completion
**Owner**: Research Agent (1.1.2), QA Agent (1.1.3)
**SLA**: 30 minutes to resolve
**Escalation Path**: This alert → Launch missing agents OR create placeholders

---

## NEXT SESSION HANDOFF

**For Liv Hana (Layer 1.1.0):**
1. Review this recon plan
2. Confirm prioritization with Jesse via voice
3. Gate CODEX execution on Node version resolution
4. Monitor planning.status.json for updates
5. Request Jesse approval before Ops deployment

**For Research Agent (Layer 1.1.2):**
1. Create research.status.json at launch
2. Begin fallacy scan on mobile control security (Slack signing)
3. Report findings to Planning Agent (this layer)

**For QA Agent (Layer 1.1.3):**
1. Wait for exec.status.json to show success
2. Auto-trigger validation when Cheetah completes
3. Report results to Planning Agent (this layer)

**For CODEX (Layer 1.1.4):**
1. Wait for Node version resolution (Action 1.1)
2. Execute tasks in priority order (Phase 1 → 2 → 3 → 4)
3. Write artifact.status.json after each completion

---

**Planning Agent Status**: RUNNING - awaiting Liv Hana briefing and Jesse approval

**Last Updated**: 2025-10-23T05:35:00Z
**Next Update**: After Liv Hana voice briefing + Jesse approval
