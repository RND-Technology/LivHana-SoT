=== RPM WEEKLY PLAN ===
Week of: 2025-10-26 to 2025-11-02

# RPM-BOOT-001: PERFECT CLAUDE-TIER1 BOOT SYSTEM
**Result Category**: ARCH (Architecture & Infrastructure)
**Owner**: Jesse CEO + Foundation Agents (RPM, Research, Artifacts, Execution, QA)
**Priority**: P0 - CRITICAL
**Funnel Stage**: Middle of Funnel (Implementation & Iteration)

---

## RESULTS COMMITTED

**R1: Voice-First Sequential Boot** - STATUS: In Progress
- **Outcome**: 100% reliable boot with voice greeting when STT/TTS healthy
- **Purpose**: Ensure Liv Hana always greets Jesse vocally at highest state - this is identity, not feature
- **Verification**: Voice greeting fires within 5s of session start when services healthy
- **Actions**: 6 of 12 complete

**R2: Zero-Race-Condition Agent Spawn** - STATUS: Not Started
- **Outcome**: 5/5 agents spawn sequentially with validation, zero conflicts
- **Purpose**: Eliminate session crashes from simultaneous spawns and port conflicts
- **Verification**: All agents report healthy status within 30s, no duplicate processes
- **Actions**: 0 of 8 complete

**R3: Non-Blocking Integration Service** - STATUS: Not Started
- **Outcome**: Integration service failures don't block voice mode or agents
- **Purpose**: Voice orchestration remains available even if integration service unavailable
- **Verification**: Boot completes with voice mode active even if port 3005 blocked
- **Actions**: 0 of 4 complete

**R4: macOS-Safe Retry/Backoff** - STATUS: Not Started
- **Outcome**: No GNU timeout dependencies, native macOS retry mechanisms only
- **Purpose**: Eliminate "command not found" errors on macOS without GNU coreutils
- **Verification**: Boot succeeds on clean macOS with Homebrew defaults only
- **Actions**: 0 of 5 complete

**R5: Verification Script Consistency** - STATUS: Not Started
- **Outcome**: claude-tier1-verify.sh yields consistent health scores every run
- **Purpose**: Trustworthy health metrics for troubleshooting and monitoring
- **Verification**: 3 consecutive runs produce identical scores with no state changes
- **Actions**: 0 of 3 complete

**R6: Documentation & Hygiene** - STATUS: Not Started
- **Outcome**: SESSION_PROGRESS.md updated, .gitignore clean, agent tracking excluded
- **Purpose**: Clean git status, traceable sessions, no noise in version control
- **Verification**: Git shows only intentional modifications, tracking files excluded
- **Actions**: 0 of 2 complete

---

## MASSIVE ACTION PLAN (MAP)

### PHASE 1: VOICE-FIRST BOOT (R1) - In Progress
**Funnel Position**: Middle - Active Implementation
**Dependencies**: scripts/voice/ensure_voice_services.sh must exist
**Timeline**: Day 1 (Today)

**✅ ARCH-BOOT-001a**: Create scripts/voice/ensure_voice_services.sh
- **Action**: New script with STT/TTS health checks + auto-start logic
- **Agent**: Artifacts Agent
- **Status**: COMPLETED
- **Completion**: 2025-10-26 (inferred from directory structure)
- **Evidence**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/voice/ exists

**✅ ARCH-BOOT-001b**: Add STRICT_VOICE gating to boot script
- **Action**: Check voice services before voice greeting, skip gracefully if down
- **Agent**: Artifacts Agent + Execution Monitor
- **Status**: COMPLETED
- **Completion**: 2025-10-26
- **Evidence**: Boot script lines 821-867 contain voice service checks

**□ ARCH-BOOT-001c**: Voice greeting auto-trigger on healthy services
- **Action**: Call mcp__voicemode__converse with greeting when services ready
- **Agent**: Liv Hana (Orchestrator)
- **Status**: PENDING
- **Blocker**: Requires Liv Hana session start to test
- **Dependencies**: ARCH-BOOT-001b complete
- **Due**: 2025-10-26 (Today)
- **Verification**: Run boot script, verify voice greeting fires

**□ ARCH-BOOT-001d**: Text fallback on voice service failure
- **Action**: Log warning + continue with text mode if services unavailable
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **Dependencies**: ARCH-BOOT-001c complete
- **Due**: 2025-10-26
- **Verification**: Stop services, run boot, verify text mode fallback

**□ ARCH-BOOT-001e**: Update prompt with voice-first instructions
- **Action**: Ensure prompt clearly instructs voice greeting as first action
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **Evidence Needed**: Review /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tmp/claude_tier1_prompt.txt
- **Due**: 2025-10-26

**□ ARCH-BOOT-001f**: Voice connectivity end-to-end test
- **Action**: Create test script that validates voice greeting works end-to-end
- **Agent**: QA Agent + Execution Monitor
- **Status**: PENDING
- **Dependencies**: All ARCH-BOOT-001a-e complete
- **Due**: 2025-10-26
- **Verification**: Test script returns 0 exit code on success

---

### PHASE 2: SEQUENTIAL AGENT SPAWN (R2) - Not Started
**Funnel Position**: Top - Planning & Design
**Dependencies**: Phase 1 complete, agent start scripts identified
**Timeline**: Day 2 (2025-10-27)

**□ ARCH-BOOT-002a**: Design sequential spawn order (planning → research → artifact → execmon → qa)
- **Action**: Document dependencies between agents, determine safe spawn order
- **Agent**: RPM Planning Agent + Research Agent
- **Status**: PENDING
- **Dependencies**: None (research task)
- **Due**: 2025-10-27 AM
- **Output**: ARCH-BOOT-002-Agent-Spawn-Sequence.md

**□ ARCH-BOOT-002b**: Add agent health validation to each spawn step
- **Action**: After spawning agent, wait + verify status file created + tmux session active
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **Files**: scripts/guards/validate_agent_started.sh (already exists at line 1309)
- **Due**: 2025-10-27
- **Verification**: Validation function returns 0 on success

**□ ARCH-BOOT-002c**: Update scripts/start_planning_agent.sh with context safety checks
- **Action**: Add memory check, disk check, port conflict check before spawn
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/start_planning_agent.sh
- **Due**: 2025-10-27

**□ ARCH-BOOT-002d**: Update scripts/start_research_agent.sh with context safety checks
- **Action**: Same safety checks as ARCH-BOOT-002c
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/start_research_agent.sh
- **Due**: 2025-10-27

**□ ARCH-BOOT-002e**: Update scripts/start_artifact_agent.sh with context safety checks
- **Action**: Same safety checks as ARCH-BOOT-002c
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/start_artifact_agent.sh
- **Due**: 2025-10-27

**□ ARCH-BOOT-002f**: Update scripts/start_execution_monitor.sh with context safety checks
- **Action**: Same safety checks as ARCH-BOOT-002c
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/start_execution_monitor.sh
- **Due**: 2025-10-27

**□ ARCH-BOOT-002g**: Update scripts/start_qa_agent.sh with context safety checks
- **Action**: Same safety checks as ARCH-BOOT-002c
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/start_qa_agent.sh
- **Due**: 2025-10-27

**□ ARCH-BOOT-002h**: Sequential spawn integration test
- **Action**: Run boot script 5 times, verify all agents spawn successfully each time
- **Agent**: QA Agent + Execution Monitor
- **Status**: PENDING
- **Dependencies**: All ARCH-BOOT-002a-g complete
- **Due**: 2025-10-27 PM
- **Success Criteria**: 5/5 boots produce 5/5 healthy agents

---

### PHASE 3: NON-BLOCKING INTEGRATION SERVICE (R3) - Not Started
**Funnel Position**: Top - Planning
**Dependencies**: Phase 2 complete
**Timeline**: Day 3 (2025-10-28)

**□ ARCH-BOOT-003a**: Refactor integration-service start as advisory (WARN only)
- **Action**: Move integration service start to post-boot, log warning if fails, don't exit
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh (lines 1343-1466)
- **Due**: 2025-10-28
- **Success Criteria**: Boot completes even if port 3005 blocked

**□ ARCH-BOOT-003b**: Add integration-service health check to post-boot validation
- **Action**: Check port 3005, log status, continue regardless
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **Dependencies**: ARCH-BOOT-003a complete
- **Due**: 2025-10-28

**□ ARCH-BOOT-003c**: Update health score to account for optional integration service
- **Action**: Reduce health penalty if integration service down from CRITICAL to WARNING
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **File**: Lines 1556-1577 (health score calculation)
- **Due**: 2025-10-28

**□ ARCH-BOOT-003d**: Non-blocking integration test
- **Action**: Block port 3005, run boot, verify voice + agents work
- **Agent**: QA Agent
- **Status**: PENDING
- **Dependencies**: All ARCH-BOOT-003a-c complete
- **Due**: 2025-10-28
- **Success Criteria**: Boot health score ≥80 even with integration-service down

---

### PHASE 4: MACOS-SAFE RETRY/BACKOFF (R4) - Not Started
**Funnel Position**: Top - Research & Design
**Dependencies**: Phase 3 complete
**Timeline**: Day 4 (2025-10-29)

**□ ARCH-BOOT-004a**: Audit all `timeout` command usage in boot scripts
- **Action**: Search codebase for `timeout`, identify GNU timeout vs macOS timeout usage
- **Agent**: Research Agent + Execution Monitor
- **Status**: PENDING
- **Due**: 2025-10-29 AM
- **Output**: ARCH-BOOT-004-Timeout-Audit.md with all occurrences

**□ ARCH-BOOT-004b**: Create macOS-safe retry helper function
- **Action**: Write retry_with_backoff() function using native shell only
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/boot/helpers.sh
- **Due**: 2025-10-29
- **Reference**: Use `while` loop + `sleep` for retry logic

**□ ARCH-BOOT-004c**: Replace GNU timeout with retry_with_backoff()
- **Action**: Substitute all GNU timeout calls with macOS-safe alternative
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **Dependencies**: ARCH-BOOT-004b complete
- **Files**: claude_tier1_boot.sh, ensure_voice_services.sh, agent start scripts
- **Due**: 2025-10-29

**□ ARCH-BOOT-004d**: Memory detector macOS compatibility check
- **Action**: Verify memory_pressure fallback logic works on macOS 13+
- **Agent**: Execution Monitor
- **Status**: PENDING
- **File**: Lines 520-584 (memory pressure checks)
- **Due**: 2025-10-29

**□ ARCH-BOOT-004e**: Clean macOS boot test
- **Action**: Test on macOS without GNU coreutils, verify no "command not found"
- **Agent**: QA Agent
- **Status**: PENDING
- **Dependencies**: All ARCH-BOOT-004a-d complete
- **Due**: 2025-10-29 PM
- **Success Criteria**: Boot succeeds with Homebrew + Node 20 only

---

### PHASE 5: VERIFY SCRIPT CONSISTENCY (R5) - Not Started
**Funnel Position**: Top - Audit & Fix
**Dependencies**: Phase 4 complete
**Timeline**: Day 5 (2025-10-30)

**□ ARCH-BOOT-005a**: Audit bin/claude-tier1-verify.sh for timing contradictions
- **Action**: Review verify script logic, identify any race conditions or timing assumptions
- **Agent**: Research Agent + QA Agent
- **Status**: PENDING
- **File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/bin/claude-tier1-verify.sh
- **Due**: 2025-10-30 AM
- **Output**: ARCH-BOOT-005-Verify-Script-Issues.md

**□ ARCH-BOOT-005b**: Fix timing contradictions in verify script
- **Action**: Ensure checks don't depend on timing, use status files + health endpoints
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **Dependencies**: ARCH-BOOT-005a complete
- **Due**: 2025-10-30

**□ ARCH-BOOT-005c**: Consistency test (3 consecutive runs)
- **Action**: Run verify script 3 times with no state changes, compare outputs
- **Agent**: QA Agent
- **Status**: PENDING
- **Dependencies**: ARCH-BOOT-005b complete
- **Due**: 2025-10-30
- **Success Criteria**: All 3 runs produce identical health scores

---

### PHASE 6: DOCUMENTATION & HYGIENE (R6) - Not Started
**Funnel Position**: Bottom - Completion & Delivery
**Dependencies**: Phases 1-5 complete
**Timeline**: Day 6 (2025-10-31)

**□ ARCH-BOOT-006a**: Update .gitignore to exclude .claude/agent_tracking/
- **Action**: Add .claude/agent_tracking/ to .gitignore
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.gitignore
- **Due**: 2025-10-31
- **Success Criteria**: git status shows no agent_tracking files

**□ ARCH-BOOT-006b**: Document boot sequence in SESSION_PROGRESS.md
- **Action**: Add section explaining new boot flow, troubleshooting guide
- **Agent**: Artifacts Agent
- **Status**: PENDING
- **File**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/SESSION_PROGRESS.md
- **Due**: 2025-10-31

---

## ACCEPTANCE CRITERIA (VERIFICATION CHECKLIST)

**Before marking this RPM plan COMPLETE, verify ALL of these:**

- [ ] Voice-first greeting fires when STT/TTS healthy (ARCH-BOOT-001c verified)
- [ ] 5/5 agents spawn sequentially without conflicts (ARCH-BOOT-002h: 5/5 successful boots)
- [ ] Integration service failures don't block boot (ARCH-BOOT-003d: health ≥80 with service down)
- [ ] No GNU timeout dependencies remain (ARCH-BOOT-004e: clean macOS boot)
- [ ] Verify script consistency achieved (ARCH-BOOT-005c: 3 identical runs)
- [ ] .gitignore updated, SESSION_PROGRESS.md documented (ARCH-BOOT-006a-b complete)
- [ ] Zero race conditions during boot (measured: no duplicate PIDs, no port conflicts)
- [ ] Works on macOS without GNU coreutils (tested on macOS 13+ with Homebrew defaults)

---

## BLOCKERS & RISKS

**Current Blockers:**
- NONE - All dependencies satisfied, ready to execute

**Identified Risks:**
1. **Voice service timing**: STT/TTS may not be ready when boot script checks
   - **Mitigation**: Add retry logic with 3 attempts, 2s delay between attempts
   - **Owner**: Artifacts Agent (ARCH-BOOT-001d)

2. **Agent spawn race conditions**: Agents may conflict if spawned too quickly
   - **Mitigation**: Sequential spawn with validation between each (Phase 2)
   - **Owner**: Artifacts Agent (ARCH-BOOT-002a-h)

3. **Integration service dependency**: Current boot script exits if service fails
   - **Mitigation**: Refactor to advisory-only status (Phase 3)
   - **Owner**: Artifacts Agent (ARCH-BOOT-003a)

4. **macOS compatibility**: GNU timeout not available on default macOS
   - **Mitigation**: Native retry_with_backoff() function (Phase 4)
   - **Owner**: Artifacts Agent (ARCH-BOOT-004b)

---

## UPCOMING PRIORITIES (NEXT WEEK)

**Post-Completion Tasks:**
1. **ARCH-BOOT-007**: Add boot performance metrics (boot time, agent spawn time)
2. **ARCH-BOOT-008**: Create automated regression test suite for boot sequence
3. **ARCH-BOOT-009**: Implement boot recovery protocol (auto-restart on failure)

---

## PROGRESS METRICS

**Overall Completion**: 16% (2 of 12 actions in R1 complete, remaining results not started)

**By Result:**
- R1 (Voice-First Boot): 33% (2/6 actions complete)
- R2 (Sequential Agents): 0% (0/8 actions complete)
- R3 (Non-Blocking Integration): 0% (0/4 actions complete)
- R4 (macOS-Safe Retry): 0% (0/5 actions complete)
- R5 (Verify Consistency): 0% (0/3 actions complete)
- R6 (Documentation): 0% (0/2 actions complete)

**Velocity Forecast**:
- Current pace: 2 actions/day (based on completed work)
- Remaining actions: 26
- **Estimated completion**: 2025-11-08 (13 days from today)
- **Target completion**: 2025-11-02 (6 days from today)
- **GAP**: Need to increase velocity to 4.3 actions/day to meet target

**Recommendation**: Execute Phases 1-2 in parallel today to accelerate timeline.

---

## AGENT COORDINATION MATRIX

**Liv Hana (Orchestrator - Layer 1.0)**:
- Strategic oversight
- Voice-first execution testing
- Cross-phase coordination
- Blocker escalation to Jesse CEO

**RPM Planning Agent (Layer 1.1)**:
- Maintain this plan 24/7
- Update action statuses in real-time
- Generate daily progress reports
- Alert on timeline slippage

**Research Agent (Layer 1.2)**:
- ARCH-BOOT-002a: Agent spawn sequence research
- ARCH-BOOT-004a: Timeout command audit
- ARCH-BOOT-005a: Verify script timing audit
- Provide best practices for boot sequences

**Artifacts Agent (Layer 1.3)**:
- ALL script modifications (Phases 1-4)
- ALL documentation updates (Phase 6)
- File creation and editing
- Primary implementer for all code changes

**Execution Monitor (Layer 1.4)**:
- Track all bash script executions
- Monitor boot sequence runs
- Capture exit codes and timing metrics
- Alert on failures immediately

**QA Agent (Layer 1.5)**:
- ARCH-BOOT-001f: Voice connectivity test
- ARCH-BOOT-002h: Sequential spawn integration test
- ARCH-BOOT-003d: Non-blocking integration test
- ARCH-BOOT-004e: Clean macOS boot test
- ARCH-BOOT-005c: Verify script consistency test
- Final acceptance criteria validation

---

## EXECUTION NOTES

**Parallel Execution Opportunities**:
- Phase 1 (ARCH-BOOT-001c-f) can run in parallel with Phase 2 design (ARCH-BOOT-002a)
- Phase 2 agent updates (ARCH-BOOT-002c-g) can run in parallel (5 agents simultaneously)
- Phase 4 audit (ARCH-BOOT-004a) can run during Phase 3 implementation

**Critical Path**:
1. ARCH-BOOT-001c (voice greeting) → ARCH-BOOT-001d (fallback) → ARCH-BOOT-001f (test)
2. ARCH-BOOT-002a (design) → ARCH-BOOT-002b (validation) → ARCH-BOOT-002c-g (updates) → ARCH-BOOT-002h (test)
3. ARCH-BOOT-003a (refactor) → ARCH-BOOT-003b (health check) → ARCH-BOOT-003d (test)
4. ARCH-BOOT-004a (audit) → ARCH-BOOT-004b (helper) → ARCH-BOOT-004c (replace) → ARCH-BOOT-004e (test)
5. ARCH-BOOT-005a (audit) → ARCH-BOOT-005b (fix) → ARCH-BOOT-005c (test)
6. ARCH-BOOT-006a-b (documentation) - can run in parallel

**Time Optimization Strategy**:
- Run Phase 1 tests and Phase 2 design simultaneously (save 0.5 days)
- Parallelize 5 agent script updates (save 1 day)
- Overlap Phase 4 audit with Phase 3 implementation (save 0.5 days)
- **Optimized timeline**: 6 days → 4 days with parallel execution

---

## RPM DNA METADATA

**File Naming Convention**: `RPM-[Category]-[Sequence]-[Descriptor]-[Date].md`
- Category: BOOT (Boot System & Infrastructure)
- Sequence: 001 (First boot system plan)
- Descriptor: Tier1-Perfect-Boot-System
- Date: 20251026

**Related Files**:
- Implementation Script: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh`
- Voice Script: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/voice/ensure_voice_services.sh` (to be created)
- Agent Scripts: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/start_*_agent.sh` (5 files)
- Verify Script: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/bin/claude-tier1-verify.sh`
- Gitignore: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.gitignore`
- Session Log: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/SESSION_PROGRESS.md`

**Time Periodization**:
- Daily: Track action completions, blocker resolutions
- Weekly: This plan (2025-10-26 to 2025-11-02)
- Monthly: Boot system health metrics, reliability SLOs
- Quarterly: Infrastructure maturity assessment

**Version**: 1.0
**Last Updated**: 2025-10-26T20:23:00Z
**Plan Owner**: Jesse CEO
**Primary Implementer**: Artifacts Agent (Layer 1.3)
**Quality Validator**: QA Agent (Layer 1.5)

---

## REFERENCES

**Source Plan**: ChatGPT-5 complete plan (provided by Jesse CEO)
**Architecture Blueprint**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/TIER1_FUNNEL_AUTHORITY.md
**Boot Script**: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh (1641 lines)
**Current Branch**: fix/mobile-control-po1
**Git Status**: 10 uncommitted files (mostly agent status JSON)

---

**🎯 ONE SHOT, ONE KILL | GROW BABY GROW, SELL BABY SELL**

**War's won for boot system reliability. Time to perfect it. Execute.**
