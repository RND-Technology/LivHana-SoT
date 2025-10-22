# PATTERN LIBRARY - WHAT WORKS, WHAT DOESN'T

**Last Updated:** 2025-10-21 (Initial Build)
**Managed By:** Research Agent
**Purpose:** Capture proven patterns and anti-patterns from real execution

---

## PROVEN PATTERNS (VALIDATED IN PRODUCTION)

### Pattern: Strategic Reading Approach

**Context:** Analyzing large files (>5000 lines)
**Problem:** Context window overflow, token waste
**Solution:**

1. Grep-first to map structure (headings, key terms)
2. Chunk into strategic sections (2000 lines max)
3. Read critical sections first (prioritized by grep results)
4. Synthesize progressively (don't wait for 100% completion)

**Evidence:**

- Session 2025-10-21: 356KB file, 7886 lines → 50% analyzed without overflow
- Token usage: 86K/200K (43%) despite massive file

**When to Use:**

- Files >5000 lines
- Documentation deep dives
- Legacy code analysis
- Multi-thousand line exports

**When NOT to Use:**

- Small files (<1000 lines) - just read directly
- Critical sections already identified
- Time-sensitive quick lookups

---

### Pattern: 3-Phase Multi-Agent Orchestration

**Context:** Complex information extraction and refactoring
**Problem:** Monolithic prompts fail on large, unstructured data
**Solution:**

- **Phase 1 (Reconciliation):** Structure discovery, section mapping, prioritization
- **Phase 2 (Automation):** Script generation, extraction runners, validation harness
- **Phase 3 (Optimization):** Markdown refactoring, token compression, progressive disclosure

**Evidence:**

- Breakthrough design for copilot export analysis (7886 lines → 10 optimized markdown files)
- Enables parallel execution after Phase 1 (Codex + Cheetah simultaneous work)
- Artifacts reusable for future sessions (no re-work)

**When to Use:**

- Unstructured data >5000 lines
- Multi-format outputs required (scripts + docs)
- Need for parallel agent execution
- Reusable artifacts desired

**When NOT to Use:**

- Simple, single-output tasks
- Already-structured data
- Time-critical quick tasks

---

### Pattern: Verification Over Generation

**Context:** Code generation, documentation, planning
**Problem:** Phantom references, false claims, trust erosion
**Solution:**

- ALWAYS verify files exist before referencing
- Document implementation gaps explicitly ("NONE EXIST IN REPO")
- Require ≥2 sources for every claim
- Run fallacy scans before delivery

**Evidence:**

- Session 2025-10-21: Scripts documented as "NOT IMPLEMENTED" (honest status)
- User trust maintained via transparency
- No wasted time chasing phantom files

**When to Use:**

- ALL code generation tasks
- ALL documentation references
- ALL strategic recommendations
- ALL technical claims

**When NOT to Use:**

- NEVER skip verification (no exceptions)

---

### Pattern: Voice Mode for Strategic Updates, Text for Code/Data

**Context:** Claude Code CLI with local voice mode
**Problem:** Voice mode inefficient for code delivery, text mode low engagement
**Solution:**

- Voice: Strategic updates, stand-ups, course corrections (<30s responses)
- Text: Code snippets, data dumps, JSON outputs, logs

**Evidence:**

- Session 2025-10-21: User preference detected ("short, punchy responses")
- Total conversation latency: 20-100s (acceptable for voice)
- Whisper STT: ~0.3s latency (fast enough for real-time)

**When to Use:**

- Daily stand-ups (15 min voice format)
- Strategic decisions (voice for engagement)
- Code delivery (text for copy-paste)
- Data analysis (text for tables/JSON)

**When NOT to Use:**

- Never use voice for >30s responses
- Never use text-only for strategic discussions (low engagement)

---

### Pattern: Token Budget Allocation (5-Stage Pipeline)

**Context:** TRUTH Pipeline for knowledge synthesis
**Problem:** Raw data overwhelming, context overflow, poor compression
**Solution:**

- Stage 1 (Scrape): 8,000 tokens - chunked + hashed (NOT full feed)
- Stage 2 (Verify): 2,000 tokens - top 10 fact clusters only
- Stage 3 (Compress): 1,000 tokens - semantic deduplication
- Stage 4 (Synthesize): 6,000 tokens - max 25 claims
- Stage 5 (Emit): 2,000 tokens - RPM-formatted output

**Evidence:**

- Target: 40%+ compression achieved
- Prevents context overflow
- Maintains claim quality (max 25 = focused synthesis)

**When to Use:**

- Large dataset processing (>10K tokens raw)
- Multi-source verification workflows
- Knowledge base building
- Research report generation

**When NOT to Use:**

- Small datasets (<2K tokens)
- Single-source simple lookups
- Already-compressed content

---

## ANTI-PATTERNS (WHAT FAILS)

### Anti-Pattern: Monolithic Prompts for Complex Tasks

**Problem:** Single massive prompt for multi-stage complex work
**Why It Fails:**

- Context overflow (single agent can't hold all details)
- No parallelization (sequential bottleneck)
- No intermediate artifacts (must re-work if failure)
- Poor error recovery (lose all progress on failure)

**Evidence:**

- Copilot export analysis: Would fail with single prompt approach
- 7886 lines → Single agent would hit token limits
- No artifacts for future sessions (wasted work)

**Replacement Pattern:** 3-Phase Multi-Agent Orchestration

---

### Anti-Pattern: Verbose Voice Responses

**Problem:** Long, detailed explanations in voice mode
**Why It Fails:**

- User disengagement (>30s = attention loss)
- Latency accumulation (STT + TTS delay compounds)
- Interruption difficulty (can't stop mid-explanation)
- Poor information retention (audio not skimmable)

**Evidence:**

- Session 2025-10-21: User preference for "short, punchy" responses
- Voice mode latency: 20-100s total (must be concise)

**Replacement Pattern:** Voice for strategic updates (<30s), text for details

---

### Anti-Pattern: Full Raw Data Feed to Synthesis Agents

**Problem:** Passing unprocessed data directly to synthesis stage
**Why It Fails:**

- Context overflow (raw data too large)
- Poor signal-to-noise (redundant information)
- Slow processing (synthesis agent must compress + synthesize)
- Low quality output (overwhelmed by volume)

**Evidence:**

- TRUTH Pipeline design: Explicit compression stages BEFORE synthesis
- Token budget: 8K raw → 1K compressed → 6K synthesis

**Replacement Pattern:** Token Budget Allocation (multi-stage compression)

---

### Anti-Pattern: Phantom References (Claiming Files Exist When They Don't)

**Problem:** Documenting scripts/files as "complete" when they're stubs or non-existent
**Why It Fails:**

- User trust erosion (false claims discovered)
- Wasted time (users try to execute non-existent code)
- Compounding errors (downstream work based on phantom dependencies)

**Evidence:**

- Session 2025-10-21: Explicit documentation "NONE EXIST IN REPO"
- User trust maintained via honesty

**Replacement Pattern:** Verification Over Generation (always check file existence)

---

### Anti-Pattern: Simultaneous Multi-Task Execution Without Prioritization

**Problem:** Trying to do everything at once without priority order
**Why It Fails:**

- Resource contention (agents competing for tokens/attention)
- Unclear progress (which task is actually advancing?)
- Dependency deadlocks (Task B needs Task A, both running simultaneously)
- No rollback strategy (failure cascades)

**Evidence:**

- RPM Master Plan: Explicit priority tags (P1, P2, P3, P4)
- Critical path identified (revenue recovery first, then compliance, then tech)

**Replacement Pattern:** Priority Queue with Sequential Execution (Critical → High → Medium → Low)

---

## EMERGING PATTERNS (UNDER OBSERVATION)

### Pattern: Continuous Intelligence Feed (Research Agent → RPM Agent)

**Status:** INITIALIZING (This Session)
**Hypothesis:** Hourly JSON feed keeps RPM Agent informed without manual research
**Expected Benefits:**

- Liv Hana NEVER has to research manually
- Decisions always informed by latest intel
- Knowledge base grows continuously

**Validation Criteria:**

- 95%+ of decisions made with supporting intel
- <5 min research response time for critical queries
- Zero manual research sessions required by Liv Hana

**Next Steps:**

- Implement hourly feed publication
- Monitor RPM Agent consumption patterns
- Measure Liv Hana research time reduction

---

### Pattern: 15-Minute Voice Stand-Ups (Team Coordination)

**Status:** PLANNED (RPM Master Plan)
**Hypothesis:** Daily 15-min voice stand-ups replace 2-4 hour RPM planning sessions
**Expected Benefits:**

- 80%+ time savings (15 min vs 2-4 hours)
- Higher engagement (voice vs text-only)
- Real-time blocker escalation

**Validation Criteria:**

- 4/4 team members complete daily stand-ups
- <15 min average duration
- 100% blocker resolution within 24 hours

**Next Steps:**

- Train team on voice mode activation
- Monitor stand-up duration
- Measure blocker resolution time

---

### Pattern: Agent Builder 17-Node Workflow (Visual Orchestration)

**Status:** DESIGNED BUT NOT BUILT
**Hypothesis:** Node-based canvas enables non-technical team workflow modification
**Expected Benefits:**

- No code changes for workflow updates
- Visual debugging (see execution path)
- Modular composition (swap nodes easily)

**Validation Criteria:**

- Non-technical team members modify workflows successfully
- <30 min to test workflow changes
- Zero code commits required for workflow updates

**Next Steps:**

- Deploy 17-node architecture
- Train team on canvas UI
- Monitor workflow modification success rate

---

## PATTERN DISCOVERY METHODOLOGY

### How Patterns Are Identified

1. **Observation:** Monitor session execution, track what works
2. **Evidence Collection:** Document file paths, metrics, user feedback
3. **Validation:** Test pattern repeatability across sessions
4. **Documentation:** Capture in pattern library with clear context
5. **Refinement:** Update based on continued observations

### Pattern Promotion Criteria

- **Proven:** Used successfully in ≥2 sessions
- **Validated:** Evidence-backed (metrics, user feedback, technical proof)
- **Documented:** Clear context, problem, solution, when to use
- **Reusable:** Applicable to future similar contexts

### Anti-Pattern Detection Signals

- User frustration expressed
- Repeated failures on same task type
- Token waste (>50% context used for low-value output)
- Time overruns (task takes >2x estimated time)
- Trust erosion (user questions accuracy)

---

## INTEGRATION WITH RESEARCH AGENT WORKFLOW

### Pattern Application

- **Before Research:** Check pattern library for proven approaches
- **During Research:** Monitor for new pattern candidates
- **After Research:** Document patterns discovered, update library

### Intel Feed Integration

- New patterns discovered → Immediate intel feed update (priority: high)
- Anti-patterns detected → Critical alert to Liv Hana + RPM Agent
- Pattern validation milestones → Medium priority intel feed

### Knowledge Base Coordination

- Patterns feed best practices (proven approaches)
- Best practices reference patterns (bidirectional links)
- Lessons learned inform pattern refinement

---

**Status:** CONTINUOUS PATTERN DISCOVERY ACTIVE
**Library Growth Target:** +5 patterns per week (validated)
**Anti-Pattern Detection:** Real-time monitoring
**Integration:** Research Agent → RPM Agent → Liv Hana
