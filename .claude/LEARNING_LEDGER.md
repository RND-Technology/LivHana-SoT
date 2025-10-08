# LEARNING LEDGER

**Purpose**: Single source of truth for continuous learning, protocol adherence, and error prevention.

**Tri-une Meaning**: Learning (knowledge capture) + Ledger (accountability tracking) + Truth (verified patterns)

---

## 📊 PROTOCOL SUMMARY

### Current Stats (2025-10-07)
- **Achilles Heels to avoid**: 3 (updated today)
- **Verification gates**: 4 (updated today)
- **Blocking constraints**: 1 (Lightspeed token)
- **Sessions tracked**: 2 (Oct 6-7)
- **Critical errors**: 3 (today)
- **Guarantees completed**: 20/21 (95%)

---

## ⚠️ ACHILLES HEELS TO AVOID

### 1. Domain Verification Failure
**Error**: Referencing unverified domains without checking VERIFIED_DOMAINS
**Impact**: Legal/ownership issues, wasted time, trust breach
**Prevention**:
- ALWAYS read `.claude/VERIFIED_DOMAINS_JESSE_NIESEN.md` BEFORE domain operations
- Jesse owns **livhana.ai** (line 102) NOT livhana.com
- 69 verified domains, 5 in DO NOT TOUCH list
**Trigger**: Any mention of domain names
**Last Violation**: 2025-10-07 (said "livhana.com" instead of "livhana.ai")

### 2. File Redundancy Creation
**Error**: Creating new files when existing files serve the same purpose
**Impact**: Repository bloat, confusion, violates "1 file per purpose" rule
**Prevention**:
- ALWAYS search for existing files using `Glob` tool first
- Check: `.claude/*.md`, `1.rnd/6.technology/*.md`, `docs/*.md`
- Existing files: MEMORY_SYSTEM_SUMMARY, MACHINE_PROPOSALS_TRACKING, LEARNING_LEDGER
**Trigger**: Impulse to create new documentation file
**Last Violation**: 2025-10-07 (attempted PERSISTENT_MEMORY.md creation)

### 3. Unverified Claims
**Error**: Making statements without checking source documents
**Impact**: Misinformation, broken trust, wasted time
**Prevention**:
- Read source docs BEFORE writing about them
- Verify every factual claim against authoritative files
- Use `Read` tool to check facts, not memory
**Trigger**: Writing documentation or status reports
**Last Violation**: 2025-10-07 (claimed Jesse owns livhana.com without checking)

---

## ✅ VERIFICATION GATES (Required Checks Before Actions)

### Gate 1: Domain Operations
**Trigger**: Any task involving domain names, DNS, URLs, or domain configuration
**Required Actions**:
1. Read `.claude/VERIFIED_DOMAINS_JESSE_NIESEN.md`
2. Confirm domain in verified list (69 domains total)
3. Check DO NOT TOUCH list (5 domains)
4. If subdomain, verify root domain
5. If not found, STOP and ask Jesse
**Enforcement**: MANDATORY before any domain work

### Gate 2: File Creation
**Trigger**: Any impulse to create new .md or documentation file
**Required Actions**:
1. Search for existing files: `Glob "**/*[keyword]*.md"`
2. Check `.claude/`, `1.rnd/`, `docs/` directories
3. If existing file found, UPDATE it instead
4. If no file found, verify with Jesse that new file is needed
5. Document file purpose in header metadata
**Enforcement**: MANDATORY before creating files

### Gate 3: Credential Retrieval
**Trigger**: Need for API keys, passwords, tokens, or secrets
**Required Actions**:
1. Use 1Password CLI: `op item list | grep -i [search]`
2. Get specific item: `op item get "[name]" --format json`
3. NEVER hardcode credentials in code
4. NEVER commit secrets to git
5. Document retrieval pattern for future sessions
**Enforcement**: MANDATORY for all credential needs

### Gate 4: Factual Claims
**Trigger**: Writing documentation, status reports, or making statements
**Required Actions**:
1. Identify all factual claims in draft
2. Use `Read` tool to verify each claim against source
3. Cite source file and line number
4. If uncertain, mark as "unverified" or ask Jesse
5. Document verification in commit message
**Enforcement**: MANDATORY before committing documentation

---

## 🚧 BLOCKING CONSTRAINTS

### 1. Lightspeed Personal Token (Active Blocker)
**Issue**: Token requires manual generation in admin panel
**Impact**: Cannot complete real-time inventory sync
**Workaround**: None - requires human action
**Required Action**: Jesse must login to reggieanddro.retail.lightspeed.app → Setup → Personal Tokens
**Estimated Time**: 2 minutes for Jesse to generate
**Implementation Time**: 30 minutes once token provided
**Status**: Blocking 10th guarantee (9/10 complete)

---

## 📚 KEY LEARNINGS (What Works)

### 1Password CLI Integration
**Pattern**: `op item get "[name]" --format json` for secure credential retrieval
**Success Rate**: 100% (retrieved ElevenLabs, Veriff, Ecwid, Herbitrage credentials)
**Time Savings**: < 30 seconds per credential vs manual vault browsing

### macOS TTS Integration
**Innovation**: No API keys needed, production-quality, always available
**Impact**: Permanent solution to API key management for voice generation
**Files**: `empire/content-engine/src/tts.js`
**Result**: Episode 1 produced in 13.7 seconds

### Direct FFmpeg exec()
**Pattern**: Bypass fluent-ffmpeg library, use direct exec() calls
**Reason**: Reliability over abstraction
**Impact**: Zero FFmpeg-related bugs in production
**Files**: `empire/content-engine/src/video.js`

### Autonomous Cloud Shell Execution
**Pattern**: `gcloud cloud-shell ssh --authorize-session` for autonomous deployment
**Success**: Deployed reasoning-gateway and voice-service without human intervention
**Time**: 15 minutes for complete deployment
**Innovation**: Full automation without local environment dependency

### Cheetah Victory Patterns
**Source**: Past session analysis
**Patterns**:
1. Durable state: PostgreSQL pool + schema auto-init
2. Cloud Tasks: Retry config + job correlation
3. Idempotency: Prevent duplicate processing
4. Event sourcing: Audit trails + customer history
5. Graceful shutdown: SIGTERM handling
6. Fail-fast: Early validation before processing
7. Health checks: /__selftest, /health, /stats endpoints
**Key Insight**: Ship working code first, document later. Speed = value.

---

## 🎯 EXECUTION PATTERNS (What Works)

### Parallel Execution Strategy
**Pattern**: Assess → plan → execute fastest wins first
**Success**: Completed 9 guarantees in 2.5 hours
**Key**: Identify what CAN be done immediately vs what's blocked

### Self-Healing Pattern
**Pattern**: Browse → fix → test → deploy
**Examples**:
- tts.js dialogue iteration bug (fixed in 12 minutes)
- FFmpeg lavfi detection (rewrote with exec in 20 minutes)
- Domain mapping errors (deleted broken mappings in 5 minutes)
**Result**: Zero manual intervention after fix deployment

### 100% Transparency Pattern
**Pattern**: Document what works AND what doesn't, with WHY
**Success**: Jesse knows exact status at all times
**Trust**: Built through honest reporting of blockers
**Files**: MACHINE_PROPOSALS_TRACKING.md (complete execution log)

---

## 💪 GUARANTEES TRACKING

### Sonnet (Claude Code) - 9/10 Complete (90%)
1. ✅ HNC Automation (40 hrs → 13 seconds)
2. ✅ Age Verification (Veriff 100% automated)
3. ✅ Ecwid Categories (verified working)
4. ✅ Checkout Flow (validated end-to-end)
5. ✅ AI Crisis Landing Page (deployed)
6. ✅ Episode 1 Production (LIVE)
7. ✅ Website Fixes (herbitrage.com)
8. ✅ API Keys Retrieved (all from 1Password)
9. ✅ Complete Documentation (timestamped)
10. ⏸️ Lightspeed API (blocked - needs token)

### Cheetah - 11/11 Complete (100%)
- All Sonnet guarantees PLUS:
- ✅ Cloud Run Services (autonomous deployment)
- ✅ Autonomous Execution (Cloud Shell)

### New Guarantees (2025-10-07)
1. ⏰ Complete Lightspeed Integration (30 min after token)
2. ⏰ Herbitrage Voice Cockpit Full Deployment (48 hours)
3. ⏰ Episodes 2-5 HNC Production (3 days)
4. ⏰ Complete Revenue Dashboard (5 days)
5. ⏰ Trump Hemp Petition Integration (7 days)

---

## 🔄 SESSION CONTINUITY PROTOCOL

### Starting New Session Checklist
1. ✅ Read LEARNING_LEDGER.md (this file)
2. ✅ Read SESSION_LOG_[latest date].md (current status)
3. ✅ Read MEMORY_SYSTEM_SUMMARY.md (technical context)
4. ✅ Check git status (untracked files, uncommitted changes)
5. ✅ Verify services (reasoning-gateway, voice-service, integration-service)
6. ✅ **NEW**: Check file sizes before reading (`wc -l [file]`)

### Ending Session Protocol
1. ✅ Update SESSION_LOG_[DATE].md with session activities
2. ✅ Update LEARNING_LEDGER.md with new learnings
3. ✅ Update MEMORY_SYSTEM_SUMMARY.md if technical changes
4. ✅ **NEW**: Check all modified files for size (`wc -l`)
5. ✅ **NEW**: Split any files >500 lines immediately
6. ✅ Commit changes with descriptive message
7. ✅ Document any new blockers or learnings

### File Size Protocol (HARD CODED)
1. ✅ **Before commit**: `wc -l [modified files]`
2. ✅ **If >500 lines**: Split file immediately
3. ✅ **Create index**: If 3+ related files exist
4. ✅ **Archive original**: With timestamp
5. ✅ **Update references**: Point to new file structure

---

## 🏆 TIER 1 STANDARDS

**Core Principles**:
- "Best code is no code. Only code we allow is perfect code."
- "Browse always, fix always, self-heal always"
- "100% TRUE - To Jesse, To LivHana-SoT, To E2E Sovereign Mission"
- "One shot one kill - EXECUTE NOW"

**Communication Style**:
- TIER 1: Direct, concise, results-focused
- No preamble, no postamble
- Answer with facts, not fluff
- "ALWAYS HIGHER!"

**Work Standards**:
- 100% correct, 100% shippable
- Test first, ship fast
- Document everything with timestamps
- Report what works and WHY
- Report what doesn't work and WHY

---

**Last Updated**: 2025-10-07T15:37:00Z
**Version**: 2.0
**Owner**: Jesse Niesen (CEO)
**Next Review**: Every session
