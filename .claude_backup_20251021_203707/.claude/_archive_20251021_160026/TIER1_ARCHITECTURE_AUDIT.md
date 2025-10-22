# TIER-1 ARCHITECTURE AUDIT & OPTIMIZATION PLAN

**Created:** October 4, 2025, 06:15 AM PDT
**Purpose:** Strategic analysis of current repo structure + optimization roadmap
**Status:** DRAFT - Collaboration with Jesse

---

## 🔍 CURRENT STATE ANALYSIS

### .claude/ Context Files (5,042 lines total)

**CRITICAL ISSUE:** Redundant startup procedures consuming excessive context

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| PERSISTENT_MEMORY.md | 922 | Historical context | ⚠️ BLOAT |
| RPM_DNA_MASTER_SYSTEM.md | 735 | Versioning system | ✅ KEEP |
| COMMANDER_CODEX_ORDERS.md | 592 | Mission tracker | ✅ ACTIVE |
| **UNICORN_RACE_STARTUP.md** | 503 | Startup v5.0 | 🔴 **REDUNDANT** |
| STRATEGIC_MULTI_SESSION_PROCESSING.md | 479 | Session strategy | ⚠️ REVIEW |
| CURRENT_SESSION_STATE.md | 458 | State tracker | ✅ ACTIVE |
| VERIFICATION_REQUIRED.md | 305 | Verification gates | ✅ KEEP |
| LEARNING_LEDGER.md | 304 | Past failures | ✅ KEEP |
| SESSION_PROGRESS.md | 271 | Live progress | ✅ ACTIVE |
| HONESTY_CONSTRAINTS.md | 254 | Blocking rules | ✅ KEEP |
| EVIDENCE_PROTOCOL.md | 166 | Evidence rules | ✅ KEEP |
| **ULTIMATE_FUSION_STARTUP.md** | 156 | Startup v1.1 | 🔴 **REDUNDANT** |
| RPM_DNA_QUICK_REFERENCE.md | 150 | Quick ref | ⚠️ CONSOLIDATE |
| **MANDATORY_BOOT_SEQUENCE.md** | 141 | Boot sequence | 🔴 **REDUNDANT** |
| ULTIMATE_STATE.md | 106 | State tracking | 🔴 **REDUNDANT** |

**Problems Identified:**

1. **3 competing startup files** (UNICORN_RACE, ULTIMATE_FUSION, MANDATORY_BOOT_SEQUENCE)
2. **2 state trackers** (CURRENT_SESSION_STATE, ULTIMATE_STATE)
3. **Historical bloat** in PERSISTENT_MEMORY (922 lines)
4. **No clear hierarchy** - flat structure makes prioritization hard
5. **Token waste** - 5,000+ lines parsed every session

### Repository Structure (3.0GB total)

| Directory | Size | Files | Status |
|-----------|------|-------|--------|
| backend/ | 878M | ~80 JS/TS | ⚠️ Node_modules bloat |
| frontend/ | 616M | ~90 JS/TS | ⚠️ Node_modules bloat |
| automation/ | 182M | ~40 scripts | ✅ Clean |
| docs/ | 25M | 5,531 MD | 🔴 **EXCESSIVE** |
| .claude/ | 696K | 15 MD | ⚠️ Needs consolidation |
| scripts/ | 60K | ~15 shells | ✅ Clean |

**Problems Identified:**

1. **5,531 markdown docs** - massive documentation overhead
2. **1.5GB node_modules** - unnecessary in git (should be in .gitignore)
3. **RPM-named directories at root** - clutters top level
4. **No clear service boundaries** - backend is monolithic
5. **Evidence storage undefined** - .evidence/ not standardized

---

## 🎯 TIER-1 OPTIMIZATION STRATEGY

### Phase 1: Context Consolidation (IMMEDIATE - 30 minutes)

**Goal:** Reduce .claude/ files from 15 → 7, cut context from 5,042 → 2,500 lines

**Action Plan:**

1. **Create STARTUP.md (single source of truth)**
   - Merge: MANDATORY_BOOT_SEQUENCE + ULTIMATE_FUSION + UNICORN_RACE
   - Format: Hierarchical checklist (L0 → L1 → L2)
   - Size target: 200 lines max

2. **Create STATE.md (single state tracker)**
   - Merge: CURRENT_SESSION_STATE + ULTIMATE_STATE
   - Format: Current + Previous session (rolling window)
   - Size target: 300 lines max

3. **Compress PERSISTENT_MEMORY.md → CONTEXT.md**
   - Keep: Last 6 months of critical context
   - Archive: Everything older to .claude/archive/
   - Size target: 400 lines max

4. **Keep as-is (core files):**
   - COMMANDER_CODEX_ORDERS.md (mission tracker)
   - LEARNING_LEDGER.md (failure patterns)
   - VERIFICATION_REQUIRED.md (quality gates)
   - HONESTY_CONSTRAINTS.md (blocking rules)
   - EVIDENCE_PROTOCOL.md (proof standards)
   - SESSION_PROGRESS.md (live log)
   - RPM_DNA_MASTER_SYSTEM.md (versioning)

**Result:** 7 files, ~2,500 lines (50% reduction)

---

### Phase 2: Repo Structure Optimization (1-2 hours)

**Goal:** Clean root directory, improve service isolation, optimize for agent workflows

**Action Plan:**

1. **Root Directory Cleanup**

   ```
   BEFORE (cluttered):
   ├── 1.2.1.8.local-delivery-api.20251002/
   ├── 1.3.2.3.leafly-seo-profile.20251002/
   ├── 2.3.1.1.episode-001-texas-intro.20251002/
   ├── 3.6.3.2.coa-validator-texas.20250930/
   ├── 4.2.2.1.b2b-automation-workflow.20251001/
   ├── ... (7+ RPM directories)

   AFTER (clean):
   ├── services/           (microservices)
   ├── automation/         (scripts)
   ├── docs/               (documentation)
   ├── infra/              (infrastructure)
   ├── .claude/            (agent context)
   ├── .evidence/          (proof artifacts)
   ├── scripts/            (utilities)
   ```

2. **Move RPM directories → docs/projects/**

   ```bash
   mkdir -p docs/projects
   mv 1.*.* 2.*.* 3.*.* 4.*.* 5.*.* docs/projects/
   ```

3. **Refactor backend/ → services/**

   ```
   services/
   ├── integration-service/    (LightSpeed, Leafly, Square)
   ├── payment-service/        (KAJA, Authorize.Net)
   ├── voice-service/          (ElevenLabs, OpenAI)
   ├── reasoning-gateway/      (Claude API)
   ├── cannabis-service/       (Compliance, COAs)
   └── common/                 (shared libraries)
   ```

4. **Standardize .evidence/ structure**

   ```
   .evidence/
   ├── YYYY-MM-DD/
   │   ├── api/                (curl outputs)
   │   ├── screenshots/        (GUI proof)
   │   ├── logs/               (service logs)
   │   ├── test-results/       (Playwright, Jest)
   │   └── README.md           (session summary)
   ```

5. **Optimize .gitignore**

   ```gitignore
   node_modules/
   .next/
   dist/
   build/
   *.log
   .env.local
   .DS_Store
   .venv/
   ```

---

### Phase 3: Code Quality Hardening (2-3 hours)

**Goal:** Eliminate technical debt, enforce Tier-1 standards

**Action Plan:**

1. **Run full quality sweep**

   ```bash
   ./scripts/run_full_sweep.sh
   ```

   - Target: 0 ESLint errors
   - Target: <50 shellcheck warnings
   - Target: <1000 markdownlint errors

2. **Add pre-commit hooks**

   ```bash
   # .husky/pre-commit
   npm run lint
   npm run test:unit
   shellcheck scripts/*.sh
   ```

3. **Implement service health checks**
   - Every service MUST have `/health` endpoint
   - Every service MUST have Dockerfile
   - Every service MUST have README.md

4. **Document API contracts**
   - OpenAPI/Swagger specs for all APIs
   - Store in `services/<name>/api-spec.yaml`

---

### Phase 4: Agent Workflow Optimization (1-2 hours)

**Goal:** Make the repo agent-friendly for autonomous execution

**Action Plan:**

1. **Create AGENT_README.md (agent-first documentation)**

   ```markdown
   # Quick Agent Onboarding

   ## What This Repo Does
   - Cannabis e-commerce platform
   - LightSpeed POS + KAJA payments
   - Voice AI + compliance automation

   ## How to Verify It Works
   1. Run: ./scripts/health-check-all.sh
   2. Expect: All services return 200 OK

   ## How to Deploy Changes
   1. Make changes
   2. Run: npm test
   3. Run: ./scripts/deploy.sh
   4. Verify: ./scripts/smoke-test.sh
   ```

2. **Create executable mission templates**

   ```markdown
   # missions/TEMPLATE.md

   ## Mission: [Clear Title]
   **Objective:** [One sentence]
   **Success Criteria:** [Measurable outcome]
   **Time Estimate:** [X hours]

   ## Execution Steps
   1. [ ] Step 1 (command: `...`, expected: `...`)
   2. [ ] Step 2 (command: `...`, expected: `...`)

   ## Verification
   - [ ] Test passed: `npm test`
   - [ ] Health check: `curl .../health`
   - [ ] Evidence saved: `.evidence/YYYY-MM-DD/`
   ```

3. **Add context hints for Claude**

   ```javascript
   // services/integration-service/src/lightspeed-api.js

   /**
    * LightSpeed API Client
    *
    * AGENT CONTEXT:
    * - This replaces demo data with real LightSpeed Retail API
    * - Credentials: LIGHTSPEED_CLIENT_ID, LIGHTSPEED_ACCOUNT_ID
    * - Auth: Basic Auth or OAuth2 (see lib/lightspeed-client.js)
    * - Dependencies: axios, dotenv
    * - Tests: ../tests/integration/lightspeed.test.js
    */
   ```

---

## 🚀 EXECUTION PRIORITY

### IMMEDIATE (Today - 1 hour)

1. ✅ Complete Mission 15 (LightSpeed API) - DONE
2. 🔄 Phase 1: Consolidate .claude files (30 min)
3. ⏳ Update product pages (remove "weed", add ingredients) (30 min)

### SHORT-TERM (This Week - 4 hours)

4. Phase 2: Repo structure cleanup (2 hours)
5. Phase 3: Code quality sweep (2 hours)

### MEDIUM-TERM (Next Week - 6 hours)

6. Phase 4: Agent workflow optimization (2 hours)
7. Service deployment (voice + reasoning) (4 hours)

---

## 💎 HOW HIGH IS HIGH?

**Current State:** Tier 2 (functional but cluttered)

- ✅ Code works
- ⚠️ Structure messy
- ⚠️ Documentation heavy
- ⚠️ Agent-hostile

**Target State:** Tier 0 (world-class agent-first architecture)

- ✅ Self-documenting code
- ✅ Flat service hierarchy
- ✅ 90%+ test coverage
- ✅ Zero-config deployment
- ✅ Agent can ship features autonomously
- ✅ Every claim backed by proof
- ✅ <2,000 lines of context needed

**What "Highest" Looks Like:**

1. **One Command to Rule Them All**

   ```bash
   ./deploy.sh --feature=texas-takeover --verify
   ```

   Agent reads mission, executes, verifies, deploys, proves—no human intervention.

2. **Context = Executable**
   Every .claude file is a runnable script, not just documentation.

3. **Self-Healing**
   Pre-commit hooks + CI/CD catch 99% of issues before they land.

4. **Agent Memory = Git History**
   No need for 922-line PERSISTENT_MEMORY.md when `git log` tells the story.

5. **Evidence = Automatic**
   Every action auto-generates proof artifacts in standardized format.

---

## 🎯 DECISION POINT

**Jesse, choose your path:**

**Option A: Quick Win (30 min)**

- Consolidate .claude files NOW
- Fix product pages NOW
- Ship improved structure immediately

**Option B: Full Reorg (4 hours)**

- Execute all 4 phases today
- Emerge with Tier-0 architecture
- Never deal with this mess again

**Option C: Hybrid (1 hour)**

- Phase 1 + Phase 4 (agent-first files)
- Clean .claude + add agent helpers
- Leave repo structure for later

**Recommendation:** Option C (hybrid) - Clean context now, optimize structure incrementally.

---

**Ready to execute. Awaiting your call.**
