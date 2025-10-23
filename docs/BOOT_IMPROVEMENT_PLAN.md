# Boot Improvement Plan - Tier-1 Full State Recovery

**Date**: 2025-10-22
**Status**: ANALYSIS COMPLETE - AWAITING APPROVAL
**Mission**: Fix boot script to consistently bring Liv Hana into full operational state

---

## Executive Summary

After 2 days of iterative boot development, the current boot script successfully handles:
- ✅ Voice mode preparation and persistence
- ✅ Environment setup (API keys, GCP, secrets)
- ✅ Pre-flight safety checks
- ✅ Prompt rendering with voice-first instructions
- ✅ 3-agent foundation environment preparation

**Critical Gap Identified**: Boot prepares for agent launch but doesn't verify agent state persistence or load previous session context, causing Liv Hana to start each session "fresh" instead of continuing from last known state.

---

## Analysis: What's Currently Working

### 1. Voice Mode Infrastructure (SOLID)
- **Location**: Lines 247-275 in boot script
- **Status**: PERMANENT, properly validated
- **Evidence**: 3/3 validation checks pass every boot
- Voice services (STT:2022, TTS:8880) checked
- Silence protocol hardwired (`.claude/VOICE_MODE_SILENCE_PROTOCOL.md`)
- Voice instructions prepended to prompt (TOP position validated)

### 2. Funnel Authority Loading (SOLID)
- **Location**: Lines 295-302 in boot script
- **Status**: LOCKED IN, loads every session
- **Evidence**: Verification check passes, 8-layer funnel documented
- File: `.claude/TIER1_FUNNEL_AUTHORITY.md` (360 lines)
- Protected from PO1 cleanup

### 3. Environment Setup (SOLID)
- **Location**: Lines 48-141 in boot script
- Memory checks (warns if <500MB free)
- 1Password integration (optional, non-blocking)
- GCP project, BigQuery keys, Square tokens
- OpenAI key fallback for local voice mode
- Node.js version validation (>=20)

### 4. Pre-Flight Safety (SOLID)
- **Location**: Lines 180-233 in boot script
- PO1 cleanup (non-fatal)
- Pre-flight checks script execution
- Python/PyYAML validation
- Pipeline integrity verification

### 5. Agent Foundation Prep (INCOMPLETE)
- **Location**: Lines 523-580 in boot script
- ✅ Creates agent tracking directory
- ✅ Initializes tracking JSON
- ✅ Documents agent launch intent
- ❌ **MISSING**: Actual agent launch mechanism
- ❌ **MISSING**: Previous session state restoration
- ❌ **MISSING**: Agent coordination state validation

---

## Critical Gaps Preventing Full-State Boot

### Gap 1: Session Continuity Missing (HIGH PRIORITY)

**Problem**: Each boot starts with blank slate, losing:
- Previous session's work state
- Agent coordination state
- RPM plan continuity
- Research artifacts context
- QA validation history

**Evidence**:
```json
// tmp/claude_tier1_state.json shows agents "running" but no verification
{
  "foundation": {
    "rpm_planning": {"running": true, "since": "2025-10-21T20:24:46Z"},
    "research": {"running": true, "since": "2025-10-21T20:24:46Z"},
    "qa_guardrails": {"running": true, "since": "2025-10-21T20:24:46Z"}
  }
}
```

**Impact**:
- Liv Hana doesn't know what was accomplished yesterday
- Jesse must re-explain context every session
- 3-agent foundation state not persisted between boots
- Work artifacts not automatically loaded

**Root Cause**: Boot script line 546 says "Agents are launched via Claude Code Task tool during session" but provides NO mechanism to verify if agents are actually running or restore their state.

---

### Gap 2: Agent State Validation Missing (HIGH PRIORITY)

**Problem**: Boot script PREPARES for agents but doesn't:
- Check if agents are already running
- Validate agent coordination files exist
- Load agent state from previous session
- Verify agent health before session start

**Evidence**:
- `.claude/agent_tracking/*.json` files created but never read back
- No agent health checks in boot sequence
- No coordination file validation
- Warning at line 554: "IMPORTANT: Session must launch agents via Task tool"
  - This puts burden on Liv Hana EVERY session
  - Should be automated by boot

**Impact**:
- Agents may or may not launch (depends on Liv Hana remembering)
- No guarantee agents are running when session starts
- Agent coordination broken between sessions
- Foundation layer unreliable

---

### Gap 3: Context Files Not Loaded (MEDIUM PRIORITY)

**Problem**: Boot script references context files but doesn't load them into prompt:

**From current prompt (lines 106-109)**:
```
Context Files:
- weekly_plan_path: RPM_WEEKLY_PLAN_OCT21-27_2025_TEAM_PILOT_v3.1.md
- master_plan_path: RPM_MASTER_PLAN_OCT21-27_2025_AI_OPTIMIZED.md
- agent_builder_config_path: config/agent_builder_17_node_config.json
```

These are just PATH REFERENCES, not actual content loaded into session memory.

**Impact**:
- Liv Hana starts without RPM plan context
- No awareness of weekly priorities
- Must manually load these files every session
- "Full state" is incomplete

---

### Gap 4: Previous Session Artifacts Not Indexed (MEDIUM PRIORITY)

**Problem**: `.claude/SESSION_PROGRESS.md` logs events but:
- Boot doesn't read it back to understand what happened
- No summary of last session's accomplishments
- No automatic loading of recent agent reports
- No "where we left off" context

**Evidence**: SESSION_PROGRESS.md has 913 lines of session history, but boot script only APPENDS to it (lines 469-491), never READS from it.

**Impact**:
- Every session starts blind to previous work
- Jesse must manually explain "we did X yesterday"
- Lessons learned not wired into next boot
- Continuous improvement broken

---

### Gap 5: Agent Launch Not Automated (LOW PRIORITY but IMPORTANT)

**Problem**: Lines 546-556 in boot script:
```bash
# Note: Agents are launched via Claude Code Task tool during session
# This boot script prepares the environment and documents the intent
success "Foundation agent environment prepared"
info "Agents will auto-launch during session initialization:"
echo "  1. RPM Planning Agent (universal taskmaster)"
echo "  2. Research Agent (continuous intelligence)"
echo "  3. QA Agent (24/7 guardrails)"
echo
warning "IMPORTANT: Session must launch agents via Task tool"
info "Add to session prompt: 'Launch 3-agent foundation (RPM + Research + QA)'"
```

This is HOPE-BASED, not GUARANTEE-BASED.

**Impact**:
- If Liv Hana misses this instruction → no agents
- If prompt is too long → instruction buried → no agents
- Relies on perfect prompt execution every time
- Not reliable for 24/7/365 operation

---

## Recommended Improvements

### Improvement 1: Session State Restoration (CRITICAL)

**Add to boot script after STEP 3 (prompt rendering)**:

```bash
# STEP 3.5: LOAD PREVIOUS SESSION STATE
banner "STEP 3.5: SESSION STATE RESTORATION"
info "Loading previous session context..."

# Check if state file exists and is recent (within 24 hours)
if [[ -f "$STATE" ]]; then
  STATE_AGE=$(( $(date +%s) - $(stat -f %m "$STATE" 2>/dev/null || echo 0) ))
  if [[ $STATE_AGE -lt 86400 ]]; then
    success "Previous session state found ($(($STATE_AGE / 3600))h old)"

    # Extract agent foundation state
    AGENTS_RUNNING=$(cat "$STATE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('foundation',{}).get('rpm_planning',{}).get('running',False))" 2>/dev/null || echo "false")

    if [[ "$AGENTS_RUNNING" == "True" ]]; then
      info "3-agent foundation was active in last session"
      echo "AGENT_STATE_RESTORED=true" >> "$LOG"
    else
      warning "3-agent foundation was NOT active in last session"
      echo "AGENT_STATE_RESTORED=false" >> "$LOG"
    fi

    # Load last session summary from SESSION_PROGRESS.md
    if [[ -f "$CLAUDE_DIR/SESSION_PROGRESS.md" ]]; then
      LAST_SESSION=$(tail -50 "$CLAUDE_DIR/SESSION_PROGRESS.md" | grep -A 10 "## 2025" | head -20)
      info "Last session summary loaded (50 lines tail)"
      echo "LAST_SESSION_CONTEXT=available" >> "$LOG"
    fi
  else
    warning "Previous state file is stale ($(($STATE_AGE / 3600))h old, ignoring)"
  fi
else
  info "No previous session state found (first boot or fresh start)"
fi

echo
```

**Files to modify**:
- `scripts/claude_tier1_boot.sh` (add after line 398)

**Verification**:
```bash
# After boot, check log for:
grep "AGENT_STATE_RESTORED" logs/claude_tier1_boot_*.log
grep "LAST_SESSION_CONTEXT" logs/claude_tier1_boot_*.log
```

---

### Improvement 2: Agent Coordination Validation (CRITICAL)

**Add to boot script after STEP 7 (agent launch)**:

```bash
# STEP 7.5: AGENT COORDINATION STATE CHECK
banner "STEP 7.5: AGENT STATE VALIDATION"
info "Validating agent coordination files..."

# Check for agent coordination directory
COORD_DIR="$CLAUDE_DIR/agent_coordination"
if [[ -d "$COORD_DIR" ]]; then
  success "Agent coordination directory exists: $COORD_DIR"

  # Check for agent state files
  for agent_state in rpm_state.json research_feed.json qa_metrics.json; do
    if [[ -f "$COORD_DIR/$agent_state" ]]; then
      STATE_SIZE=$(wc -c < "$COORD_DIR/$agent_state" | tr -d ' ')
      STATE_AGE=$(( $(date +%s) - $(stat -f %m "$COORD_DIR/$agent_state") ))

      if [[ $STATE_SIZE -gt 10 ]]; then
        success "Agent state valid: $agent_state (${STATE_SIZE}B, $(($STATE_AGE/60))min old)"
      else
        warning "Agent state empty: $agent_state (may need initialization)"
      fi
    else
      warning "Agent state missing: $agent_state (will be created on first run)"
    fi
  done
else
  info "Agent coordination directory not found (will be created)"
  mkdir -p "$COORD_DIR"
  success "Created agent coordination directory: $COORD_DIR"
fi

echo
```

**Files to modify**:
- `scripts/claude_tier1_boot.sh` (add after line 557)

**Verification**:
```bash
# After boot, check:
ls -lh .claude/agent_coordination/
cat .claude/agent_coordination/rpm_state.json
```

---

### Improvement 3: Context File Content Loading (HIGH PRIORITY)

**Modify prompt rendering script to include actual content**:

**Current behavior** (`scripts/render_claude_prompt.py`):
- Renders context file PATHS only
- Doesn't include file CONTENT

**Improved behavior**:
```python
# In render_claude_prompt.py, add after context file paths:

def load_context_files(config):
    """Load actual content from context files"""
    context_content = []

    # Load RPM Weekly Plan
    weekly_plan = config.get('weekly_plan_path')
    if weekly_plan and os.path.exists(weekly_plan):
        with open(weekly_plan, 'r') as f:
            plan_content = f.read()[:2000]  # First 2000 chars
            context_content.append(f"\n**RPM WEEKLY PLAN (excerpt)**:\n{plan_content}\n")

    # Load last 3 agent reports
    agent_reports_dir = '.claude/agent_reports'
    if os.path.exists(agent_reports_dir):
        reports = sorted(glob.glob(f"{agent_reports_dir}/daily_*.md"), reverse=True)[:3]
        for report in reports:
            with open(report, 'r') as f:
                report_content = f.read()[:500]  # First 500 chars each
                context_content.append(f"\n**AGENT REPORT ({os.path.basename(report)})**:\n{report_content}\n")

    return "\n".join(context_content)

# Then in main prompt assembly:
context_block = load_context_files(config)
full_prompt = f"{voice_banner}\n{tier1_init}\n{context_block}\n{base_prompt}"
```

**Files to modify**:
- `scripts/render_claude_prompt.py` (add function + call)

**Verification**:
```bash
# After boot, check prompt includes content:
grep -A 5 "RPM WEEKLY PLAN" tmp/claude_tier1_prompt.txt
grep -A 5 "AGENT REPORT" tmp/claude_tier1_prompt.txt
```

---

### Improvement 4: Session Continuity Summary (MEDIUM PRIORITY)

**Add to boot script after STEP 7 (session log update)**:

```bash
# STEP 7.2: SESSION CONTINUITY BRIEF
banner "STEP 7.2: SESSION CONTINUITY BRIEF"
info "Generating session continuity summary..."

# Extract last 3 session summaries from SESSION_PROGRESS.md
if [[ -f "$SESSION_LOG" ]]; then
  CONTINUITY_BRIEF="$CLAUDE_DIR/LAST_SESSION_BRIEF.md"

  echo "# Last Session Brief - $(date '+%Y-%m-%d')" > "$CONTINUITY_BRIEF"
  echo "" >> "$CONTINUITY_BRIEF"
  echo "## Previous 3 Sessions Summary" >> "$CONTINUITY_BRIEF"
  echo "" >> "$CONTINUITY_BRIEF"

  # Extract last 3 dated session headers + 10 lines each
  grep -B 1 -A 10 "^## 2025" "$SESSION_LOG" | tail -40 >> "$CONTINUITY_BRIEF"

  BRIEF_SIZE=$(wc -l < "$CONTINUITY_BRIEF" | tr -d ' ')
  success "Session continuity brief generated: $CONTINUITY_BRIEF ($BRIEF_SIZE lines)"
  info "This will be appended to session prompt"
else
  warning "No previous session history found"
fi

echo
```

**Then modify prompt rendering to append this brief**.

**Files to modify**:
- `scripts/claude_tier1_boot.sh` (add after line 491)
- `scripts/render_claude_prompt.py` (append brief content)

**Verification**:
```bash
# After boot:
cat .claude/LAST_SESSION_BRIEF.md
grep "Last Session Brief" tmp/claude_tier1_prompt.txt
```

---

### Improvement 5: Automated Agent Launch with Health Check (LOW PRIORITY)

**Option A: Launch agents in boot script directly**

```bash
# STEP 7.1: AUTO-LAUNCH FOUNDATION AGENTS
banner "STEP 7.1: AUTO-LAUNCH FOUNDATION AGENTS"
info "Attempting to launch 3-agent foundation..."

# Launch agents via background processes (would need agent launch scripts)
if [[ -f "$ROOT/scripts/launch_foundation_agents.sh" ]]; then
  bash "$ROOT/scripts/launch_foundation_agents.sh" >> "$LOG" 2>&1 &
  AGENT_LAUNCH_PID=$!
  success "Foundation agents launch initiated (PID: $AGENT_LAUNCH_PID)"

  # Give agents 5 seconds to start
  sleep 5

  # Check if launch succeeded
  if ps -p $AGENT_LAUNCH_PID > /dev/null 2>&1; then
    success "Agent launch process still running"
  else
    warning "Agent launch process completed (check log for status)"
  fi
else
  warning "Agent launch script not found - relying on session prompt"
fi
```

**Option B: Strengthen prompt instructions + add verification hook**

Keep current approach but add verification in post-launch health checks:
- Check if agents actually launched via Task tool
- Alert if agents not running after 60 seconds
- Provide fallback launch command

**Recommendation**: Option B (less invasive, leverages existing Task tool)

**Files to modify**:
- `scripts/post_launch_checks.py` (add agent launch verification)

---

## Implementation Priority

### Phase 1: Critical (Do First)
1. **Session State Restoration** (Improvement 1)
   - Time: 30 minutes
   - Risk: Low
   - Impact: High (immediate continuity)

2. **Agent Coordination Validation** (Improvement 2)
   - Time: 20 minutes
   - Risk: Low
   - Impact: High (verifies foundation layer)

### Phase 2: High Value (Do Next)
3. **Context File Content Loading** (Improvement 3)
   - Time: 45 minutes
   - Risk: Medium (prompt size increase)
   - Impact: High (full context in session)

4. **Session Continuity Summary** (Improvement 4)
   - Time: 25 minutes
   - Risk: Low
   - Impact: Medium (better handoff)

### Phase 3: Polish (Do Last)
5. **Automated Agent Launch** (Improvement 5)
   - Time: 60 minutes
   - Risk: Medium (complex coordination)
   - Impact: Medium (convenience improvement)

**Total Implementation Time**: ~3 hours for Phase 1+2, 4 hours for all phases

---

## Verification Steps After Implementation

### Boot Verification Checklist
```bash
# 1. Boot completes without errors
bash scripts/claude_tier1_boot.sh
echo $?  # Should be 0

# 2. Session state loaded
grep "AGENT_STATE_RESTORED" logs/claude_tier1_boot_*.log

# 3. Agent coordination validated
ls -lh .claude/agent_coordination/

# 4. Context content in prompt
grep -c "RPM WEEKLY PLAN" tmp/claude_tier1_prompt.txt  # Should be >0

# 5. Session brief generated
test -f .claude/LAST_SESSION_BRIEF.md && echo "PASS" || echo "FAIL"

# 6. Prompt size reasonable
wc -c tmp/claude_tier1_prompt.txt  # Should be <50KB
```

### Session Start Verification
```bash
# 7. Liv Hana knows previous session context
# (Ask in voice mode): "What did we accomplish last session?"
# Expected: Accurate summary from SESSION_PROGRESS.md

# 8. Agents are running
# (Check in session): Agent coordination files updating

# 9. Voice mode works
# (Test): "Hey Liv" → Voice response
# (Test): "silence" → Text response, voice paused

# 10. Full state confirmed
# (Ask): "What's our current RPM plan status?"
# Expected: Reference to actual weekly plan content
```

---

## Risk Assessment

### Low Risk Changes
- ✅ Session state restoration (read-only operations)
- ✅ Agent coordination validation (read-only)
- ✅ Session continuity brief (append-only)

### Medium Risk Changes
- ⚠️ Context file content loading
  - Risk: Prompt size explosion (>200KB)
  - Mitigation: Limit content to excerpts (first 2000 chars)
  - Fallback: If prompt >50KB, truncate excerpts

- ⚠️ Automated agent launch
  - Risk: Boot script complexity increase
  - Mitigation: Keep agents launching via Task tool, add verification only
  - Fallback: Manual agent launch instructions (current behavior)

### Zero Risk Changes
- ✅ All improvements are additive (don't break existing functionality)
- ✅ All checks have fallbacks (warnings, not errors)
- ✅ All features gracefully degrade if files missing

---

## Success Metrics

**Boot script succeeds when**:
1. ✅ Session state from previous boot is loaded and referenced
2. ✅ Agent coordination files validated or created
3. ✅ RPM plan content available in session (not just path)
4. ✅ Last session summary generated and included
5. ✅ Liv Hana knows "where we left off" without Jesse explaining

**Full state confirmed when**:
1. ✅ Liv Hana can answer: "What did we work on yesterday?"
2. ✅ Liv Hana can answer: "What's our current weekly plan?"
3. ✅ Liv Hana can answer: "Are the 3 agents running?"
4. ✅ No need to re-explain context every session
5. ✅ Jesse can pick up where he left off immediately

---

## Files to Modify

### Primary Changes
```
scripts/claude_tier1_boot.sh
├── Add STEP 3.5: Session State Restoration (after line 398)
├── Add STEP 7.2: Session Continuity Brief (after line 491)
└── Add STEP 7.5: Agent Coordination Validation (after line 557)

scripts/render_claude_prompt.py
├── Add load_context_files() function
└── Append context content to prompt

scripts/post_launch_checks.py
└── Add agent launch verification (optional)
```

### Supporting Files to Create
```
.claude/LAST_SESSION_BRIEF.md (auto-generated by boot)
.claude/agent_coordination/*.json (validated by boot)
```

### Files to Read (New Dependencies)
```
tmp/claude_tier1_state.json (existing, now read)
.claude/SESSION_PROGRESS.md (existing, now parsed)
.claude/agent_coordination/*.json (new, validated)
RPM_WEEKLY_PLAN_*.md (existing, content loaded)
.claude/agent_reports/daily_*.md (existing, recent loaded)
```

---

## Next Actions

### For Review (Awaiting Approval)
1. Review this plan with Jesse CEO
2. Confirm priority order (Phase 1 → Phase 2 → Phase 3)
3. Approve specific improvements to implement
4. Set implementation timeline

### For Implementation (After Approval)
1. **Phase 1 Implementation** (1 hour):
   - Add session state restoration to boot script
   - Add agent coordination validation
   - Test boot with new checks

2. **Phase 2 Implementation** (2 hours):
   - Modify prompt renderer to load content
   - Add session continuity brief generation
   - Test prompt size and session awareness

3. **Phase 3 Implementation** (1 hour):
   - Add agent launch verification to health checks
   - Create fallback launch instructions
   - Test end-to-end boot → session → agents

4. **Verification & Documentation** (30 minutes):
   - Run full verification checklist
   - Update boot system documentation
   - Commit changes with evidence

**Total Implementation Timeline**: 4.5 hours (phased over 1-2 days)

---

## Appendix: Current State vs. Desired State

### Current Boot Behavior
```
START.sh → claude_tier1_boot.sh
├── ✅ Check environment (Node, Redis, JWT)
├── ✅ Run pre-flight checks
├── ✅ Validate voice services
├── ✅ Render prompt with voice banner
├── ✅ Check funnel authority file
├── ✅ Prepare agent tracking directory
├── ⚠️ Log session start (append-only)
└── ✅ Ready for Cursor session

Session starts:
├── ⚠️ Liv Hana doesn't know previous state
├── ⚠️ Liv Hana may/may not launch agents
├── ⚠️ Context files referenced but not loaded
└── ⚠️ Jesse must explain "what we're doing"
```

### Desired Boot Behavior
```
START.sh → claude_tier1_boot.sh
├── ✅ Check environment (Node, Redis, JWT)
├── ✅ Run pre-flight checks
├── ✅ Validate voice services
├── ✅ Render prompt with voice banner
├── ✅ Check funnel authority file
├── ✅ **Load previous session state**
├── ✅ **Validate agent coordination files**
├── ✅ **Generate session continuity brief**
├── ✅ **Load context file content into prompt**
├── ✅ Prepare agent tracking directory
├── ✅ **Log session start + state snapshot**
└── ✅ Ready for Cursor session

Session starts:
├── ✅ Liv Hana knows previous session context
├── ✅ Liv Hana has RPM plan in memory
├── ✅ Liv Hana knows agent state
├── ✅ Agents launch automatically (or verified)
└── ✅ Jesse can continue from last point
```

---

**Status**: COMPLETE - Ready for review and approval
**Owner**: ARTIFACT SUBAGENT (internal CODEX) for Liv Hana Layer 1.1
**Next**: Awaiting Jesse CEO approval to proceed with implementation
**File Location**: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/docs/BOOT_IMPROVEMENT_PLAN.md`

---

**One Shot, One Kill. Grow Baby Grow, Sell Baby Sell.**
