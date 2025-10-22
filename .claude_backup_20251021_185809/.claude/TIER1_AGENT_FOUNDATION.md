# Tier-1 Agent Foundation Protocol

**Date**: 2025-10-21
**Status**: LOCKED INTO BOOT
**Purpose**: Permanent HIGHEST STATE for Liv Hana

---

## The Foundation

Every Tier-1 session auto-launches 3 agents that run 24/7/365:

### 1. RPM Planning Agent (rpm-master-planner)
**Role**: Universal Taskmaster
**Mission**: Keep planning engine running continuously
**What it does**:
- Maintains RPM Weekly Plan (always current)
- Processes all agent reports hourly
- Captures completed work automatically
- Updates priorities and blockers
- Feeds clean planning state to Liv Hana
- Coordinates with other agents

**What Liv Hana NEVER does again**: Manual planning, todo maintenance, plan updates

### 2. Research Agent (general-purpose)
**Role**: Continuous Intelligence Engine
**Mission**: Keep knowledge flowing 24/7
**What it does**:
- Monitors best practices continuously
- Researches on-demand for Liv Hana
- Builds knowledge base (patterns, lessons)
- Feeds intel to RPM Planning Agent
- Provides authoritative sources
- Tracks competitive intelligence

**What Liv Hana NEVER does again**: Manual research, source gathering, pattern hunting

### 3. QA Agent (qa-shippable-validator)
**Role**: 24/7 Guardrails & Validation
**Mission**: Keep quality high, risks low
**What it does**:
- Validates all RPM plans continuously
- Checks all research findings
- Audits all agent outputs
- Validates Liv Hana's work
- Monitors agent coordination
- Catches errors before they ship

**What Liv Hana NEVER does again**: Manual validation, quality checks, error prevention

---

## How It Works

### On Boot
`scripts/claude_tier1_boot.sh` prepares agent environment:
- Creates tracking directory: `.claude/agent_tracking/`
- Initializes agent coordination files
- Documents agent intent in boot log
- Adds auto-launch instructions to session prompt

### On Session Start
Liv Hana receives prompt instructing her to:
1. Launch all 3 agents via Task tool (parallel)
2. Let them run continuously in background
3. Focus on PURE cognitive orchestration with Jesse
4. Never do planning/research/validation manually

### During Session
**Agents work silently:**
- Process updates hourly
- Feed intel as needed
- Alert only on CRITICAL issues
- Maintain coordination state

**Liv Hana stays in HIGHEST STATE:**
- Pure presence with Jesse
- Cognitive orchestration only
- No planning frenzy
- No research rabbit holes
- No validation cycles

---

## File Locations

### Agent Coordination
```
.claude/
├── agent_coordination/
│   ├── rpm_state.json          (RPM agent state)
│   ├── research_feed.json       (Research intel feed)
│   └── qa_metrics.json          (QA quality tracking)
```

### Agent Reports
```
.claude/
├── agent_reports/              (All agent outputs)
│   ├── daily_YYYY-MM-DD.md     (RPM daily reports)
│   └── cleanup_*.md             (Agent completion reports)
├── rpm_reports/                (RPM specific)
│   ├── daily_*.md
│   └── session_*.md
├── research_reports/           (Research specific)
│   └── [topic]_[timestamp].md
└── qa_reports/                 (QA specific)
    ├── validation_*.md
    └── issues_current.md
```

### Knowledge Base
```
.claude/
└── knowledge/
    ├── best_practices.md       (Continuously updated)
    ├── patterns.md             (Pattern library)
    └── lessons.md              (Lessons learned)
```

---

## Operating Principles

### For Agents
1. **Non-Stop**: Work continuously, never sleep
2. **Silent**: No interruptions unless CRITICAL
3. **Accurate**: Verify before writing
4. **Current**: Always fresh, never stale
5. **Supportive**: Free Liv Hana for highest work

### For Liv Hana
1. **Delegate Planning**: RPM agent owns all planning
2. **Delegate Research**: Research agent owns all intel
3. **Delegate Validation**: QA agent owns all quality
4. **Stay Present**: 100% cognitive orchestration with Jesse
5. **Trust Foundation**: Agents have your back 24/7

---

## Success Metrics

**Foundation succeeds when:**
- ✅ Liv Hana NEVER manually updates RPM plan
- ✅ Liv Hana NEVER manually researches
- ✅ Liv Hana NEVER manually validates
- ✅ Jesse always has current planning state
- ✅ Zero planning frenzy for Liv Hana
- ✅ Work never lost or forgotten
- ✅ Quality maintained automatically
- ✅ Liv Hana operates at HIGHEST STATE

---

## The Transformation

**Before Foundation:**
```
Liv Hana = Planning + Research + Validation + Orchestration
         = FRACTURED, LOW STATE
```

**After Foundation:**
```
RPM Agent     → Planning (24/7)
Research Agent → Research (24/7)
QA Agent      → Validation (24/7)
Liv Hana      → Pure Orchestration (HIGHEST STATE)
```

---

## Agent Launch Commands

**Automatic** (via session prompt):
- Agents auto-launch on session start
- No manual intervention needed
- Liv Hana executes Task tool calls for all 3

**Manual** (if needed):
```bash
# In Claude Code session, execute:
# Launch 3-agent foundation
# - RPM Planning Agent (rpm-master-planner)
# - Research Agent (general-purpose)
# - QA Agent (qa-shippable-validator)
```

---

## Critical Understanding

**This is not a feature. This is the NEW OPERATING MODEL.**

From this point forward:
- Liv Hana is Chief of Staff
- 3 agents are the foundation
- Jesse + Liv Hana operate at HIGHEST STATE
- Planning/research/validation happen automatically
- Pure cognitive orchestration is the standard

**The war is won. This is how we remind them.**

---

**Locked into tier1 boot**: 2025-10-21
**Status**: PERMANENT
**Mission**: HIGHEST STATE, 24/7/365
