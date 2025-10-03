<!-- Optimized: 2025-10-02 -->
<!-- RPM: 3.6.0.6.ops_technology_ship_status_documentation -->
<!-- Session: Elephant Strategy Batch 1 -->

# MANDATORY BOOT SEQUENCE - HARD REQUIREMENT

**Purpose**: Force protocol compliance session-to-session

## 🚨 FIRST ACTION EVERY SESSION

Before ANY work, Claude MUST:

### 1. READ LEARNING LEDGER
```bash
cat .claude/LEARNING_LEDGER.md
```
**Purpose**: See past failures and fixes

### 2. READ VERIFICATION PROTOCOL
```bash
cat .claude/VERIFICATION_REQUIRED.md
```
**Purpose**: Remember verification gates

### 3. READ HONESTY CONSTRAINTS
```bash
cat .claude/HONESTY_CONSTRAINTS.md
```
**Purpose**: Remember hard blocking rules

### 4. ACKNOWLEDGE PROTOCOLS
State in response:
- "Learning Ledger read: [X] past failures noted"
- "Verification Protocol read: [Y] gates active"
- "Honesty Constraints read: [Z] blocking rules active"

### 5. STATE SESSION MISSION
From user request, create numbered steps with:
- Concrete metrics (file counts, timestamps)
- Verification checkpoints
- Proof requirements

## 🚫 VIOLATIONS = INSTANT LOSS

- If Claude claims without verification → LOSS
- If Claude commits without proof → LOSS
- If Claude excludes files when told "ALL" → LOSS
- If Claude ignores protocols → LOSS

## ✅ WINNING PATTERN (8-STEP PROTOCOL)

### 1. Enforce Startup Discipline (EVERY SESSION)
Read these files FIRST before touching anything:
- `.claude/LEARNING_LEDGER.md` (past failures)
- `.claude/VERIFICATION_REQUIRED.md` (verification gates)
- `.claude/HONESTY_CONSTRAINTS.md` (blocking rules)
- `.claude/NEXT_SESSION_BOOTSTRAP.md` (context)
- `.claude/NEXT_SESSION_CRITICAL_MISSION.md` (orders)
- `.claude/CURRENT_SESSION_STATE.md` (last state)

### 2. Centralize Orders in Live Tracker
Check `.claude/COMMANDER_CODEX_ORDERS.md` for numbered missions
Update `.claude/SESSION_PROGRESS.md` every 5 minutes with command + output

### 3. Turn Every Claim into Evidence
For each sweep:
- Run command
- Paste output to SESSION_PROGRESS.md with timestamp
- Save Finder screenshots to `.evidence/<date>/`
- Flag open items

### 4. Divide Repo Logically
Standing rotation: docs → automation → backend → frontend → infra
5-minute update cadence keeps sync

### 5. Codex Orchestrates, Sonnet Executes
Codex assigns sweeps, monitors logs, calls out missing proof
Sonnet moves to next chunk only after evidence logged

### 6. Self-Healing Routines
Run `scripts/run_full_sweep.sh` for:
- shellcheck + markdownlint + ESLint sweeps
- RPM metadata audits
- Finder timestamp snapshots

### 7. High-Trust Environment
Auto-approve on (`settings.json: claudeCode.defaultApprovalMode: trusted`)
Humans verify by checking logs

### 8. Rinse and Escalate
After session: update `.claude/CURRENT_SESSION_STATE.md` with:
- What finished
- What's open
- Which evidence to check

**Last updated**: 2025-10-03
**Session**: Liv Hana Absolute Standard Implementation
