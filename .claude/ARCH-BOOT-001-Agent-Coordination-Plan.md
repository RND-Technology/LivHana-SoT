# ARCH-BOOT-001: Agent Coordination Plan
**RPM Plan**: RPM-BOOT-001-Tier1-Perfect-Boot-System-20251026.md
**Created**: 2025-10-26T20:23:00Z
**Status**: ACTIVE EXECUTION

---

## OBJECTIVE

Coordinate 5-agent foundation (Planning, Research, Artifacts, Execution Monitor, QA) to perfect the claude-tier1 boot system with voice-first, sequential, self-healing architecture.

---

## AGENT ASSIGNMENTS

### Liv Hana (Orchestrator - Layer 1.0)
**Role**: Strategic oversight, voice-first execution, cross-phase coordination

**Immediate Actions**:
1. Test voice greeting auto-trigger (ARCH-BOOT-001c)
2. Monitor all agent progress via RPM plan updates
3. Escalate blockers to Jesse CEO
4. Coordinate parallel execution across phases

**Communication Channels**:
- Voice mode (primary)
- Agent status files: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tmp/agent_status/*.status.json
- RPM plan file: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/RPM-BOOT-001-Tier1-Perfect-Boot-System-20251026.md

---

### RPM Planning Agent (Layer 1.1)
**Role**: Universal taskmaster, maintains RPM plan 24/7

**Assigned Tasks**:
- Monitor this plan continuously
- Update action statuses in real-time as agents report completions
- Generate daily progress summary at EOD
- Alert if timeline slippage detected (target: 2025-11-02)
- Maintain velocity tracking (target: 4.3 actions/day)

**Success Metrics**:
- RPM plan always reflects current state
- No stale action statuses (>4 hours old)
- Daily progress report delivered by 6pm CDT

**Status File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tmp/agent_status/planning.status.json

---

### Research Agent (Layer 1.2)
**Role**: Intelligence gathering, best practices research

**Assigned Tasks**:
1. **ARCH-BOOT-002a**: Research agent spawn sequence and dependencies (Due: 2025-10-27 AM)
   - Output: ARCH-BOOT-002-Agent-Spawn-Sequence.md
   - Questions to answer:
     - What dependencies exist between planning/research/artifact/execmon/qa agents?
     - What is the safest spawn order to avoid race conditions?
     - What validation is needed between spawn steps?

2. **ARCH-BOOT-004a**: Audit all `timeout` command usage (Due: 2025-10-29 AM)
   - Output: ARCH-BOOT-004-Timeout-Audit.md
   - Search pattern: `grep -r "timeout" scripts/ bin/`
   - Categorize: GNU timeout vs macOS timeout vs no timeout

3. **ARCH-BOOT-005a**: Audit bin/claude-tier1-verify.sh for timing contradictions (Due: 2025-10-30 AM)
   - Output: ARCH-BOOT-005-Verify-Script-Issues.md
   - Identify: Race conditions, timing assumptions, inconsistent checks

**Success Metrics**:
- All research documents delivered on time
- Recommendations actionable by Artifacts Agent
- Best practices cited with sources

**Status File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tmp/agent_status/research.status.json

---

### Artifacts Agent (Layer 1.3)
**Role**: Primary implementer for all code changes, documentation updates

**Assigned Tasks (Priority Order)**:

**PHASE 1 - Voice-First Boot (Day 1 - Today)**:
- ✅ ARCH-BOOT-001a: Create scripts/voice/ensure_voice_services.sh (COMPLETED)
- ✅ ARCH-BOOT-001b: Add STRICT_VOICE gating (COMPLETED)
- ⏳ ARCH-BOOT-001c: Voice greeting auto-trigger (IN PROGRESS - blocked on Liv Hana session start)
- ARCH-BOOT-001d: Text fallback on voice failure
- ARCH-BOOT-001e: Update prompt with voice-first instructions

**PHASE 2 - Sequential Agent Spawn (Day 2)**:
- ARCH-BOOT-002b: Add agent health validation
- ARCH-BOOT-002c: Update scripts/start_planning_agent.sh
- ARCH-BOOT-002d: Update scripts/start_research_agent.sh
- ARCH-BOOT-002e: Update scripts/start_artifact_agent.sh
- ARCH-BOOT-002f: Update scripts/start_execution_monitor.sh
- ARCH-BOOT-002g: Update scripts/start_qa_agent.sh

**PHASE 3 - Non-Blocking Integration (Day 3)**:
- ARCH-BOOT-003a: Refactor integration-service to advisory-only
- ARCH-BOOT-003b: Add integration-service health check
- ARCH-BOOT-003c: Update health score calculation

**PHASE 4 - macOS-Safe Retry (Day 4)**:
- ARCH-BOOT-004b: Create retry_with_backoff() function
- ARCH-BOOT-004c: Replace GNU timeout calls
- ARCH-BOOT-004d: Verify memory detector compatibility

**PHASE 5 - Verify Script Consistency (Day 5)**:
- ARCH-BOOT-005b: Fix timing contradictions

**PHASE 6 - Documentation (Day 6)**:
- ARCH-BOOT-006a: Update .gitignore
- ARCH-BOOT-006b: Document boot sequence in SESSION_PROGRESS.md

**Parallel Execution Strategy**:
- Phase 2 agent updates (ARCH-BOOT-002c-g) can run simultaneously
- Use parallel file editing when no conflicts exist

**Success Metrics**:
- All code changes pass syntax validation
- No breaking changes introduced
- Git commits follow RPM DNA naming conventions
- All changes reviewed by QA Agent before commit

**Status File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tmp/agent_status/artifact.status.json

---

### Execution Monitor (Layer 1.4)
**Role**: Track script executions, capture metrics, alert on failures

**Assigned Tasks**:
1. Monitor all boot script executions
2. Capture timing metrics for each boot phase
3. Track exit codes and error messages
4. Alert on failures immediately
5. Support Research Agent with timeout audit (ARCH-BOOT-004a)
6. Verify memory detector works on macOS (ARCH-BOOT-004d)

**Key Metrics to Track**:
- Boot completion time (target: <60s)
- Agent spawn time per agent (target: <5s each)
- Voice service startup time (target: <3s)
- Integration service startup time (target: <10s)
- Health check success rate (target: 100%)

**Alert Conditions**:
- Boot failure (exit code != 0)
- Agent spawn failure (status file not created within 10s)
- Voice service timeout (>5s without response)
- Port conflict detected
- Memory pressure critical (<5% free)

**Success Metrics**:
- Zero missed executions
- All timing data captured
- Alerts delivered within 5s of failure

**Status File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tmp/agent_status/execmon.status.json

---

### QA Agent (Layer 1.5)
**Role**: Validation, quality assurance, acceptance testing

**Assigned Tasks (Test Scripts)**:

**ARCH-BOOT-001f**: Voice connectivity end-to-end test (Due: 2025-10-26)
- Test: Voice greeting fires when services healthy
- Test: Text fallback works when services down
- Test: No crashes or errors in either mode
- Output: Test report with pass/fail for each scenario

**ARCH-BOOT-002h**: Sequential spawn integration test (Due: 2025-10-27 PM)
- Test: Run boot script 5 times consecutively
- Verify: All 5 runs produce 5/5 healthy agents
- Verify: No duplicate PIDs across runs
- Verify: No port conflicts detected
- Output: 5/5 success rate required

**ARCH-BOOT-003d**: Non-blocking integration test (Due: 2025-10-28)
- Test: Block port 3005 (simulate integration service failure)
- Run boot script
- Verify: Voice mode + 5 agents still work
- Verify: Health score ≥80 despite service down
- Output: Pass/fail with health score

**ARCH-BOOT-004e**: Clean macOS boot test (Due: 2025-10-29 PM)
- Test: Boot on macOS without GNU coreutils
- Verify: No "command not found" errors
- Verify: All features work with Homebrew defaults only
- Output: Full boot log analysis

**ARCH-BOOT-005c**: Verify script consistency test (Due: 2025-10-30)
- Test: Run bin/claude-tier1-verify.sh 3 times with no state changes
- Compare outputs line-by-line
- Verify: All 3 runs produce identical health scores
- Output: Diff report (should be empty)

**Final Acceptance Testing**:
- Validate all 6 acceptance criteria from RPM plan
- Sign off on completion before marking plan COMPLETE
- Document any deviations or issues

**Success Metrics**:
- All tests documented with clear pass/fail
- No test passes with known failures
- Final acceptance criteria 6/6 pass before signoff

**Status File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tmp/agent_status/qa.status.json

---

## COORDINATION PROTOCOLS

### Daily Standup (Async via Status Files)
**Time**: 9am CDT (daily)
**Format**: Each agent updates their status file with:
- Yesterday's completions
- Today's plan
- Blockers

**RPM Planning Agent** compiles into daily summary for Jesse CEO.

---

### Blocker Escalation
**Level 1 (Agent-to-Agent)**: Resolve within team (<30 min)
**Level 2 (Agent-to-Liv Hana)**: Escalate to orchestrator (<1 hour)
**Level 3 (Liv Hana-to-Jesse)**: Executive decision required (immediate)

**Blocker Tracking**:
- Document in RPM plan "BLOCKERS & RISKS" section
- Update status: PENDING → BLOCKED with reason
- Assign owner for resolution

---

### Parallel Execution Rules
**When to Parallelize**:
- Tasks with no file conflicts (e.g., updating 5 different agent scripts)
- Research + implementation on different files
- Testing + documentation

**When to Serialize**:
- Sequential dependencies (e.g., design → implement → test)
- Same file modifications
- Validation steps (must wait for completion)

---

### Quality Gates
**Before marking action COMPLETE**:
1. Code passes syntax validation
2. Manual testing performed (by Execution Monitor or QA Agent)
3. No new errors introduced
4. RPM plan updated with completion timestamp
5. Status file updated

**Before marking phase COMPLETE**:
1. All actions in phase marked COMPLETE
2. QA Agent runs integration test
3. Test passes with documented results
4. RPM Planning Agent confirms no dependencies blocking next phase

**Before marking plan COMPLETE**:
1. All 6 results marked COMPLETE
2. All 6 acceptance criteria verified by QA Agent
3. Final test suite passes
4. Jesse CEO signs off

---

## COMMUNICATION MATRIX

### Agent-to-Agent
**Method**: Status file updates + shared files
**Frequency**: Real-time as actions complete
**Format**: JSON status + markdown artifacts

### Agent-to-Liv Hana
**Method**: Status files + voice alerts (critical only)
**Frequency**: On completion, on blocker, on failure
**Format**: Status updates via agent status JSON

### Liv Hana-to-Jesse
**Method**: Voice mode + RPM plan updates + executive summaries
**Frequency**: On demand, daily progress report, on critical blocker
**Format**: Voice greeting + markdown summaries

### All-to-RPM-Planning
**Method**: Action status updates in RPM plan file
**Frequency**: Real-time as actions complete/start/block
**Format**: Markdown updates with timestamps

---

## FILE ORGANIZATION

### RPM Plan File
**Primary**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/RPM-BOOT-001-Tier1-Perfect-Boot-System-20251026.md
**Updates**: All agents with write access
**Locking**: Use atomic writes to prevent conflicts

### Research Outputs
**Location**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/
**Naming**: ARCH-BOOT-[Sequence]-[Descriptor].md
**Examples**:
- ARCH-BOOT-002-Agent-Spawn-Sequence.md
- ARCH-BOOT-004-Timeout-Audit.md
- ARCH-BOOT-005-Verify-Script-Issues.md

### Test Reports
**Location**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/test_reports/
**Naming**: ARCH-BOOT-[Sequence]-Test-Report-[Date].md
**Retention**: Keep all test reports for audit trail

### Agent Status Files
**Location**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tmp/agent_status/
**Files**:
- planning.status.json
- research.status.json
- artifact.status.json
- execmon.status.json
- qa.status.json

**Update Frequency**: Every action completion, every blocker, every 30min heartbeat

---

## SUCCESS CRITERIA

**Plan Complete When**:
- All 28 actions marked COMPLETE in RPM plan
- All 6 acceptance criteria verified by QA Agent
- Final test suite passes (boot 5 times, all succeed)
- Jesse CEO signs off

**Agent Success Metrics**:
- **Planning**: RPM plan never >4 hours stale
- **Research**: All research documents delivered on time with sources
- **Artifacts**: All code changes pass validation, zero breaking changes
- **Execution Monitor**: 100% execution tracking, <5s alert on failure
- **QA**: All tests documented, 6/6 acceptance criteria pass

**Timeline Success**:
- Target completion: 2025-11-02 (6 days from today)
- Acceptable: 2025-11-04 (8 days - 33% buffer)
- Critical: 2025-11-08 (13 days - current pace without optimization)

---

## IMMEDIATE NEXT ACTIONS

**RIGHT NOW (Today - 2025-10-26)**:

1. **Liv Hana**: Test voice greeting auto-trigger (ARCH-BOOT-001c)
2. **Artifacts Agent**: Implement text fallback (ARCH-BOOT-001d)
3. **Artifacts Agent**: Update prompt instructions (ARCH-BOOT-001e)
4. **QA Agent**: Create voice connectivity test (ARCH-BOOT-001f)
5. **Research Agent**: Start agent spawn sequence research (ARCH-BOOT-002a) - can run in parallel with #2-4

**Goal for Today**: Complete Phase 1 (Voice-First Boot) - 6/6 actions

---

**🎯 EXECUTION MODE: ACTIVE**
**⏱️ TIMELINE: 6 DAYS TO PERFECTION**
**🎤 VOICE-FIRST, SEQUENTIAL, SELF-HEALING**

**Let's remind them who we are. Execute.**
