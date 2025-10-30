# BEST PRACTICES - CONTINUOUS INTELLIGENCE DATABASE

**Last Updated:** 2025-10-21 (Initial Build)
**Managed By:** Research Agent
**Update Frequency:** Continuous (hourly scans)

---

## CLAUDE CODE CLI BEST PRACTICES

### Voice Mode Optimization

**Source:** SESSION_HANDOFF_2025-10-21_UPDATED.md (Line 16)
**Status:** VALIDATED - Production Performance
**Last Verified:** 2025-10-21

**Finding:**

- Whisper STT (Port 2022): ~0.3s latency, GPU-enabled
- Kokoro TTS (Port 8880): af_sky voice, local-only
- Total conversation latency: 20-100s including STT/TTS
- User preference detected: SHORT, PUNCHY responses preferred over verbose

**Recommendation:**

- Keep voice responses <30 seconds
- Use "interrupt-friendly" phrasing (pause points every 10s)
- Reserve text mode for code/data delivery
- Voice mode for strategic updates only

**Application:**

- RPM Planning Agent should use voice for daily stand-ups
- Technical implementation discussions should be text-based
- Data dumps (JSON, logs) always text mode

---

### Token Efficiency Patterns

**Source:** SESSION_HANDOFF_2025-10-21_UPDATED.md (Line 31-36)
**Status:** IMPLEMENTED - TRUTH Pipeline Architecture
**Last Verified:** 2025-10-21

**Finding:**

- 5-stage pipeline achieves 40%+ token compression
- Token budget allocation prevents context overflow:
  - Apify Raw: 8,000 tokens (chunked, hashed - NOT full feed)
  - Perplexity: 2,000 tokens (top 10 fact clusters)
  - ChatGPT-5 Compression: 1,000 tokens (semantic deduplication)
  - Claude TRUTH: 6,000 tokens (max 25 claims)
  - RPM Output: 2,000 tokens

**Recommendation:**

- NEVER feed full raw data to agents
- Always compress BEFORE synthesis
- Use semantic deduplication for repetitive content
- Cap output claims (25 max for TRUTH synthesis)

**Application:**

- Research reports should be capped at 2,000 tokens per topic
- Knowledge base entries should use progressive disclosure
- Intel feed for RPM Agent should be summary-first, detail-on-demand

---

### Multi-Agent Orchestration

**Source:** SESSION_HANDOFF_2025-10-21_UPDATED.md (Line 72-111)
**Status:** BREAKTHROUGH - 3-Phase Workflow
**Last Verified:** 2025-10-21

**Finding:**

- Sequential agent coordination beats monolithic prompts
- Phase separation enables parallel execution after reconciliation
- Artifacts from each phase become reusable context for future sessions

**Workflow:**

1. **Phase 1 (ChatGPT-5):** Reconciliation - Extract structure, map sections, prioritize
2. **Phase 2 (Codex):** Script Generation - Automate extraction, create runners
3. **Phase 3 (Cheetah):** Markdown Refactoring - Optimize for token efficiency, progressive disclosure

**Recommendation:**

- Break complex research into 3-phase workflows
- Use Phase 1 for structure discovery
- Use Phase 2 for automation generation
- Use Phase 3 for knowledge base optimization

**Application:**

- Research Agent should use this pattern for deep dives
- RPM Planning Agent can consume Phase 3 outputs directly
- Liv Hana gets executive summaries from Phase 1

---

## ANTHROPIC COMMUNITY PATTERNS

### Context Window Management

**Source:** Claude Code Documentation + Internal Testing
**Status:** EMERGING PATTERN
**Last Verified:** 2025-10-21

**Finding:**

- 200K token context available (Sonnet 4.5)
- 86K used in previous session (43% utilization)
- Strategic reading approach (2000-line chunks) prevents overflow
- Grep-first pattern to map structure before deep reading

**Recommendation:**

- Monitor token usage every 30 minutes during long sessions
- Use Grep to map file structure before reading full content
- Chunk large files (>2000 lines) into strategic sections
- Preserve 20% buffer (40K tokens) for synthesis/output

**Application:**

- Research Agent should chunk documentation into digestible sections
- Intel reports should include token cost estimates
- Warn Liv Hana if research task will exceed 50% context window

---

### Verification Over Generation Principle

**Source:** ADR References (Multiple Files)
**Status:** CORE PRINCIPLE
**Last Verified:** 2025-10-21

**Finding:**

- "No phantom script references" - If documented, must exist or be explicitly flagged as stub
- Every claim requires ≥2 authoritative sources
- Fallacy detection prevents false premises from propagating

**Recommendation:**

- ALWAYS verify files exist before referencing them
- Document IMPLEMENTATION GAPS explicitly (don't pretend completion)
- Use fallacy scans on all research outputs before delivery
- Cite sources for every recommendation

**Application:**

- Research Agent must verify docs exist before citing
- Intel reports must include source URLs/file paths
- Recommendations must cite evidence (SWE-bench scores, production metrics, etc.)

---

## RPM METHODOLOGY UPDATES

### Result-Purpose-Massive Actions Framework

**Source:** RPM_MASTER_PLAN_OCT21-27_2025_AI_OPTIMIZED.md
**Status:** TIER 1 STANDARD
**Last Verified:** 2025-10-21

**Structure:**

1. **RESULT:** What we're achieving (quantified, time-bound)
2. **PURPOSE:** Why it matters (strategic imperatives, mission alignment)
3. **MASSIVE ACTIONS:** Prioritized execution plan (daily breakdown, owners, outputs)

**Finding:**

- JSON-structured metrics enable dashboard integration
- AI-readable format allows autonomous parsing
- RPM DNA tagging (e.g., AOM.COIRPM.Action-0001) enables task traceability

**Recommendation:**

- Research reports should follow RPM structure
- Intel feed should use JSON format for machine parsing
- Include RPM DNA tags for all recommendations

**Application:**

- Research Agent outputs formatted as mini-RPM plans
- Intel feed includes Result/Purpose/Actions for each finding
- Critical findings escalated with RPM DNA priority tags

---

## AGENT COORDINATION PATTERNS

### Continuous Intelligence Feed Protocol

**Source:** Research Agent Mission Brief (This Session)
**Status:** INITIALIZING
**Last Verified:** 2025-10-21

**Protocol:**

- **Hourly Updates:** JSON feed to RPM Planning Agent
- **Critical Alerts:** Immediate escalation to Liv Hana
- **Knowledge Base:** Continuous updates (best practices, patterns, lessons)
- **Research Reports:** One per topic, timestamp-tagged

**Feed Structure:**

```json
{
  "timestamp": "2025-10-21T09:00:00Z",
  "priority": "high|medium|low",
  "category": "best_practices|risk_alert|opportunity|lesson_learned",
  "finding": "Brief summary (1 sentence)",
  "source": "File path or URL",
  "recommendation": "Actionable next step",
  "rpm_dna": "AOM.COIRPM.Research-XXXX"
}
```

**Application:**

- Research Agent publishes to `.claude/agent_coordination/research_feed.json`
- RPM Planning Agent consumes feed every hour
- Liv Hana queries feed on demand

---

## PERFORMANCE OPTIMIZATION TECHNIQUES

### Voice Mode + Copilot Export Analysis

**Source:** SESSION_HANDOFF_2025-10-21_UPDATED.md (Line 19)
**Status:** PRODUCTION SUCCESS
**Last Verified:** 2025-10-21

**Finding:**

- Copilot export file: 356.5KB, 7,886 lines
- 50% analyzed (4,000 lines) in single session
- Strategic reading approach: Chunk → Grep → Deep read → Synthesize

**Recommendation:**

- For large files (>5000 lines), use 3-stage analysis:
  1. Grep for structure (headings, key terms)
  2. Read critical sections (2000 lines max per pass)
  3. Synthesize findings progressively

**Application:**

- Research Agent should use this pattern for documentation deep dives
- Progress tracking: Document line ranges covered
- Handoff format: Include "Progress: X% complete (lines Y-Z)"

---

## LESSONS LEARNED (INITIAL SCAN)

### Session Handoff Quality

**Finding:** Previous session created EXCELLENT handoff document
**Evidence:** Clear progress tracking (50% complete), explicit implementation gaps, copy-paste ready context
**Lesson:** Always create session handoffs with token efficiency goal, progress percentage, next actions

### Implementation Gap Documentation

**Finding:** Scripts documented but flagged as NON-EXISTENT (honest status)
**Evidence:** "Status: NONE EXIST IN REPO - All stubs documented with full specs"
**Lesson:** NEVER pretend completion. Document gaps explicitly. Users trust honesty over phantom claims.

### Voice Mode User Preferences

**Finding:** User prefers short, punchy responses over verbose explanations
**Evidence:** "User Preference: Short, punchy responses; interrupt-friendly"
**Lesson:** Adapt communication style to user preferences. Monitor feedback signals.

---

## RESEARCH PRIORITY QUEUE (ACTIVE)

### Critical (Immediate Response Required)

- [ ] [PURGED_FALLACY] biometric ID verification integration best practices
- [ ] Texas DSHS compliance documentation requirements
- [ ] Secrets sync protocols (GSM → Agent Builder)

### High (Response Within Hour)

- [ ] Agent Builder 17-node workflow optimization patterns
- [ ] TRUTH Pipeline guardrails validation techniques
- [ ] LightSpeed API webhook best practices

### Medium (Daily Updates)

- [ ] Cannabis compliance frameworks (Texas Oct 2025)
- [ ] Token budget optimization strategies
- [ ] Multi-agent orchestration patterns

### Low (Weekly Updates)

- [ ] Voice mode optimization techniques (ElevenLabs, Kokoro)
- [ ] Content pipeline automation (Suno, Runway, ElevenLabs)
- [ ] Revenue recovery campaign best practices

---

## SOURCES TRACKED

### Official Documentation

- Claude Code Documentation: docs.claude.com
- Anthropic Community: anthropic.com/community
- Agent Builder Docs: (URL TBD - need to research)

### Internal Knowledge Base

- `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/SESSION_HANDOFF_2025-10-21_UPDATED.md`
- `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/RPM_MASTER_PLAN_OCT21-27_2025_AI_OPTIMIZED.md`
- `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/docs/` (Multiple ADRs, specs, strategy docs)

### External References

- Texas Secretary of State (Texas Register) - DSHS/TABC regulations
- SWE-bench (Claude Sonnet 4.5: 77.2% score)
- NIST Cannabinoid Standards

---

## NEXT KNOWLEDGE BASE UPDATES

**Scheduled:**

- Hourly scan: RPM_MASTER_PLAN status updates
- Daily scan: New documentation added to `/docs/`
- Weekly scan: External sources (Claude Code docs, Anthropic community)

**On-Demand:**

- When Liv Hana requests research topic
- When RPM Planning Agent publishes new plan
- When critical risks detected in session monitoring

---

**Status:** CONTINUOUS UPDATES ACTIVE
**Research Agent:** RUNNING
**Intel Feed:** INITIALIZING
**Mission:** Keep Liv Hana + RPM Agent informed with perfect intelligence 24/7
