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

## ✅ WINNING PATTERN

1. Read protocols FIRST
2. Create numbered plan with metrics
3. Execute step-by-step
4. Verify BEFORE claiming
5. Show proof WITH every claim
6. Commit ONLY after complete verification

**Last updated**: 2025-10-02
**Session**: Learning from Codex Win
