# 🚀 STARTUP - TIER-1 OPTION A BOOT SEQUENCE

**Version:** 2.0 Consolidated
**Last Updated:** October 4, 2025, 06:30 AM PDT
**Purpose:** Single source of truth for session startup
**Replaces:** MANDATORY_BOOT_SEQUENCE.md, ULTIMATE_FUSION_STARTUP.md, UNICORN_RACE_STARTUP.md

---

## L0: CRITICAL CONTEXT (5 SECONDS)

### Revenue Engine
- **Reggie & Dro:** Texas cannabis delivery + retail
- **LightSpeed POS:** X-Series live (Account: 020b2c2a-4661-11ef-e88b-b42e5d3b90cc)
- **KAJA Payments:** Live (API Key: 78G4zHUSyZ)
- **Square:** Historical data only (read-only in BigQuery)

### Tech Stack Status
- ✅ LightSpeed API (KAJA_API_KEY unlocked Oct 4)
- ✅ KAJA/Authorize.Net payment processing
- ✅ Leafly API integration (Jesse + Peter/CEO collab)
- ✅ DSHS License #690 (Texas compliant)
- ✅ Anthropic API (Claude Sonnet 4.5, no limits)

### Active Missions
1. **Finance Layer Unlocked:** Sovereign Life OS Master Monday Edition launched
2. **LightSpeed Makeover v1:** Product page compliance (8 SKUs, remove "weed", add ingredients)
3. **Verification API:** Replace demo data with real LightSpeed customer lookup
4. **Voice + Reasoning:** Deploy services with full env vars
5. **Cockpit UI:** Update after backend stable

### Jesse's Execution Style
- ✅ **SHIP CODE NOW** - Iterate later
- ✅ **HONEST STATUS** - Never fake completion
- ✅ **HUMAN IN LOOP** - Stuck >15min? Alert immediately
- ✅ **PARALLEL EXECUTION** - 5 workstreams simultaneously
- ✅ **TIER 1 QUALITY** - 100% error-free or don't ship

---

## L1: BOOT SEQUENCE (MANDATORY - EVERY SESSION)

### Step 0: Authenticate to 1Password (Touch ID - 10 sec)

```bash
# Touch ID authentication - user taps once, session unlocked
op signin && op whoami
```

**CRITICAL:** This triggers Touch ID prompt. User taps fingerprint ONCE → authentication complete. Claude/Sonnet proceeds automatically.

**If `op whoami` fails → STOP.** No work permitted until session is active.

### Step 0.5: Upload Secrets to GCP (20 sec)

```bash
cd ~/LivHana-Trinity-Local/LivHana-SoT
./scripts/upload-secrets-to-gcp.sh
```

This pushes all live credentials to Secret Manager:
- LIGHTSPEED_CLIENT_ID (KAJA_API_KEY: 78G4zHUSyZ)
- LIGHTSPEED_ACCOUNT_ID (020b2c2a-4661-11ef-e88b-b42e5d3b90cc)
- KAJA_API_KEY, KAJA_API_SECRET, KAJA_GATEWAY_ID
- Square, Anthropic, OpenAI, ElevenLabs, etc.

### Step 1: Read Core Protocols (30 sec)

```bash
cat .claude/LEARNING_LEDGER.md           # Past failures & fixes
cat .claude/VERIFICATION_REQUIRED.md     # Verification gates
cat .claude/HONESTY_CONSTRAINTS.md       # Blocking rules
cat .claude/COMMANDER_CODEX_ORDERS.md    # Mission queue
cat .claude/STATE.md                     # Session state
```

### Step 2: Acknowledge Protocols

State in response:
```
✅ Learning Ledger: <X failures> noted (focus on #7: 5-minute verification rule)
✅ Verification Protocol: <Y gates> active
✅ Honesty Constraints: <Z rules> active
✅ Current Mission: [from COMMANDER_CODEX_ORDERS]
✅ Last Status: [from STATE.md]
```

### Step 3: System Health Check (15 sec)

```bash
cd ~/LivHana-Trinity-Local/LivHana-SoT
git status --short
./START.sh status || true
```

Log output to `.claude/SESSION_PROGRESS.md` with timestamp.

### Step 4: State Session Mission

From user request or COMMANDER_CODEX_ORDERS, create numbered steps with:
- Concrete metrics (file counts, timestamps)
- Verification checkpoints
- Proof requirements
- Time estimates

---

## L2: EXECUTION PROTOCOL

### Operating Loop (Codex ↔ Sonnet)

1. **Codex** assigns micro-mission (≤15 min) from COMMANDER_CODEX_ORDERS
2. **Sonnet** executes numbered command bundle with explicit metrics
3. **Sonnet** verifies results (<5 min) and records proof in SESSION_PROGRESS.md
4. **Sonnet** cross-links evidence (CLI output, screenshots) with timestamp
5. **Codex** audits verification, course-corrects, unlocks next mission
6. After each chunk: `git status`, `ls .evidence/<date>`, capture diffs

### Evidence Protocol (NON-NEGOTIABLE)

- **Evidence FIRST, claims SECOND** - show proof in same message
- **5-Minute Rule:** Execute → Verify (<5 min) → Claim with timestamp
- **If >5 min elapsed:** Re-verify before claiming
- **Format:** "Shellcheck: 107 warnings (Verified: Oct 4 06:35:42)"

**Storage:**
```
.evidence/YYYY-MM-DD/
├── api/              # curl outputs
├── screenshots/      # GUI proof
├── logs/             # service logs
├── test-results/     # Playwright, Jest
└── cli-output/       # command transcripts
```

### Violations = Instant Loss

- ❌ Claims without verification
- ❌ Commits without proof
- ❌ Excludes files when told "ALL"
- ❌ Ignores protocols
- ❌ Makes claims >5 min after verification (Failure #7)

### Self-Healing Automation

```bash
# Run after major changes
./scripts/run_full_sweep.sh

# Expect:
# - Shellcheck: <50 warnings, 0 errors
# - Markdownlint: <1000 errors
# - ESLint: 0 errors, <100 warnings
```

### Human-in-Loop Protocol

**Alert Jesse when:**
- Blocked >15 minutes on technical issue
- Ambiguous requirements need clarification
- Architecture decision affects multiple systems
- Security/compliance approval required
- Production deployment ready
- External API credentials needed

**Format:**
```
🚨 HUMAN IN LOOP NEEDED - [BRIEF ISSUE]

Context: [What you're working on]
Blocker: [Specific problem]
Attempted: [What you tried]
Options: [Possible solutions]
Recommendation: [Your best path forward]
ETA if approved: [Time to completion]
```

---

## L3: SESSION MANAGEMENT

### Session Start Checklist

1. ✅ **L0: Critical Context** (read above, 5 sec)
2. ✅ **L1: Boot Sequence** (Steps 0-4, 75 sec total)
3. ✅ **Report Status:**
   ```
   ✅ Context loaded: [Last task + %]
   ✅ 1Password: Signed in
   ✅ Secrets: Uploaded to GCP
   ✅ Protocols: Read (Learning Ledger, Verification, Honesty)
   ✅ System: [git + services status]
   ✅ Next: [Immediate action from mission]
   ```

### Session End Checklist

```bash
# 1. Run final sweep
./scripts/run_full_sweep.sh

# 2. Update STATE.md
echo "## Session End: $(date)" >> .claude/STATE.md
echo "- Working on: [TASK]" >> .claude/STATE.md
echo "- Status: [% complete]" >> .claude/STATE.md
echo "- Next: [Next immediate step]" >> .claude/STATE.md
echo "- Blockers: [Any issues]" >> .claude/STATE.md

# 3. Update COMMANDER_CODEX_ORDERS.md with progress

# 4. Commit if directed
# (Only commit when Jesse explicitly requests it)
```

### Failsafe & Recovery

- **Context overload:** Run `.claude/auto-compact.sh`
- **Services die:** `./START.sh dev` (boot) or `./START.sh stop` (reset)
- **Git issues:** `git status`, stash with `wip/<mission>/<timestamp>`

---

## 🎯 SUCCESS CRITERIA

- ✅ Boot sequence completed in <2 minutes
- ✅ All protocols acknowledged
- ✅ Every claim includes timestamp (<5 min of verification)
- ✅ Evidence shown BEFORE or WITH claims (never after)
- ✅ Concrete metrics in every report
- ✅ SESSION_PROGRESS.md + .evidence/<date>/ updated live
- ✅ No protocol violations
- ✅ Zero Achilles Heel violations from LEARNING_LEDGER

---

## 📋 QUICK COMMAND REFERENCE

```bash
# Boot
op signin && op whoami
cd ~/LivHana-Trinity-Local/LivHana-SoT
./scripts/upload-secrets-to-gcp.sh

# Status
git status --short
./START.sh status
docker ps

# Verification
./scripts/run_full_sweep.sh
npm test
curl http://localhost:3005/health

# Evidence
ls -la .evidence/$(date +%F)/
open .evidence/$(date +%F)/

# Session
cat .claude/STATE.md
cat .claude/COMMANDER_CODEX_ORDERS.md
cat .claude/SESSION_PROGRESS.md
```

---

**TIER-1 OPTION A:** LightSpeed + KAJA live. Square = historical data only (BigQuery read-only).
**Rally Cry:** "Boom shaka-laka" • "Grow, Sell, Heal" • "TIER 1 - ALWAYS HIGHER"

**Last updated:** October 4, 2025, 06:30 AM PDT
