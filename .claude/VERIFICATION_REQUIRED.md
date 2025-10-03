# VERIFICATION REQUIRED - MANDATORY BEFORE CLAIMS

**Version:** 1.0
**Status:** ACTIVE - Read before EVERY claim
**Purpose:** CANNOT claim without verification

---

## ⚡ CORE RULE: VERIFY FIRST, CLAIM SECOND

**NEVER CLAIM WITHOUT CURRENT VERIFICATION.**

---

## VERIFICATION GATES BY CLAIM TYPE

### Gate 1: File Timestamp Claims
**Examples:** "All files updated", "Timestamps fresh", "Files show minutes ago"

**MANDATORY Commands:**
```bash
ls -lt | head -30
ls -lt docs/ | head -20
ls -lt backend/ | head -20
git status
git log --oneline -1 --format="%h %s (%cr)"
```

**PROOF FORMAT:**
```
CLAIM: [Your claim]
COMMAND: ls -lt | head -30
TIMESTAMP: $(date)
OUTPUT:
[paste actual ls output]
INTERPRETATION: 32/45 files <1hr old, 13 files stale
```

**FORBIDDEN:** ❌ "All files updated" ❌ "Everything fresh" ❌ "Timestamps current"
**REQUIRED:** ✅ "32/45 files updated (13 stale: [list])"

---

### Gate 2: Service Health Claims
**Examples:** "Services running", "All healthy", "System operational"

**MANDATORY Commands:**
```bash
curl -s http://localhost:4002/health | jq .
curl -s http://localhost:3005/health | jq .
curl -s http://localhost:4001/health | jq .
redis-cli ping
ps aux | grep "npm.*start"
```

**PROOF FORMAT:**
```
CLAIM: Service status
COMMAND: curl -s localhost:4002/health | jq .
TIMESTAMP: $(date)
OUTPUT:
{"status":"healthy","service":"reasoning-gateway"}
INTERPRETATION: reasoning-gateway healthy (200 OK)
```

**FORBIDDEN:** ❌ "All services healthy" ❌ "Running" ❌ "Operational"
**REQUIRED:** ✅ "4/5 services healthy (vibe-cockpit down): [paste curl outputs]"

---

### Gate 3: Code Quality Claims
**Examples:** "0 errors", "ESLint clean", "No warnings"

**MANDATORY Commands:**
```bash
npx eslint . --ext .js,.jsx,.ts,.tsx 2>&1 | tee /tmp/eslint.txt
npx eslint . --format json | jq '.[] | .errorCount, .warningCount'
npx tsc --noEmit 2>&1 | head -50
```

**PROOF FORMAT:**
```
CLAIM: ESLint status
COMMAND: npx eslint . --ext .js,.jsx
TIMESTAMP: $(date)
OUTPUT:
4 errors, 0 warnings
[file paths with errors]
INTERPRETATION: 4 errors in CLI scripts (acceptable), 0 app errors
```

**FORBIDDEN:** ❌ "0 errors" ❌ "Clean" ❌ "No problems"
**REQUIRED:** ✅ "4 errors (CLI only), 0 app errors: [paste scan]"

---

### Gate 4: Test Status Claims
**Examples:** "All tests passing", "100% pass", "Tests green"

**MANDATORY Commands:**
```bash
cd backend/reasoning-gateway && npm test 2>&1 | tee /tmp/test.txt
cd backend/integration-service && npm test 2>&1 | tee /tmp/test2.txt
grep -E "Tests.*passed|failed" /tmp/*.txt
```

**PROOF FORMAT:**
```
CLAIM: Test status
COMMAND: npm test
TIMESTAMP: $(date)
OUTPUT:
Tests: 323 passed, 1 failed
Failing: integration-service test #142
INTERPRETATION: 323/324 passing (99.7%), 1 env-dependent failure
```

**FORBIDDEN:** ❌ "All passing" ❌ "100%" ❌ "Tests green"
**REQUIRED:** ✅ "323/324 passing (99.7%): [paste test output]"

---

### Gate 5: Git/GitHub Claims
**Examples:** "Pushed", "Synced", "Backed up"

**MANDATORY Commands:**
```bash
git status
git log origin/main..HEAD --oneline | wc -l
git ls-remote origin HEAD
git log --oneline -1
```

**PROOF FORMAT:**
```
CLAIM: Git push status
COMMAND: git status && git log --oneline -1
TIMESTAMP: $(date)
OUTPUT:
On branch main
Your branch is up to date with 'origin/main'
4be3726 Bootstrap V2.0
INTERPRETATION: Pushed (verified commit on remote)
```

**FORBIDDEN:** ❌ "Pushed" ❌ "Synced" ❌ "Backed up"
**REQUIRED:** ✅ "Pushed (verified remote SHA matches local): [paste git status]"

---

### Gate 6: Completion Claims
**Examples:** "Complete", "100% done", "All requirements met"

**MANDATORY Checklist:**
```
TASK: [Original request]
REQUIREMENTS:
1. [Req A] → [Evidence + command]
2. [Req B] → [Evidence + command]
3. [Req C] → [Evidence + command]

STATUS: X/Y complete
REMAINING: [What's not done]
```

**PROOF FORMAT:**
```
CLAIM: Task complete
VERIFIED: Each requirement below
REQUIREMENT 1: Files updated
  COMMAND: ls -lt | head -30
  OUTPUT: [paste]
  STATUS: ✅ Complete
REQUIREMENT 2: Tests passing
  COMMAND: npm test
  OUTPUT: [paste]
  STATUS: ✅ Complete
INTERPRETATION: 2/2 requirements met
```

**FORBIDDEN:** ❌ "Complete" ❌ "Done" ❌ "100%"
**REQUIRED:** ✅ "7/8 complete (deploy pending): [checklist with proof]"

---

## 🚨 UNCERTAINTY PROTOCOL: "I DON'T KNOW"

**When to Admit Uncertainty:**
1. Cannot verify (service down, file inaccessible)
2. Ambiguous requirement (unclear what "done" means)
3. Need human judgment (design decision)
4. Incomplete information (missing context)
5. Non-deterministic outcome (race condition)

**REQUIRED FORMAT:**
```
⚠️ UNCERTAIN: [What I cannot verify]

REASON: [Why verification impossible]

KNOWN: [What I CAN confirm]
UNKNOWN: [What I CANNOT confirm]

OPTIONS:
A) [Option 1 - assumptions + pros/cons]
B) [Option 2 - assumptions + pros/cons]
C) Wait for human verification

RECOMMENDATION: [Best judgment with caveats]
```

**EXAMPLE:**
```
⚠️ UNCERTAIN: Whether vibe-cockpit is running

REASON: Connection refused on localhost:5173

KNOWN:
- Process not in ps aux
- No logs in last hour
- Other services responding

UNKNOWN:
- When it stopped
- Why it stopped
- If it was ever started

OPTIONS:
A) Start service → verify with curl
B) Check different port
C) Ask Jesse

RECOMMENDATION: Start service (safe operation)
```

---

## 🛡️ CACHED STATE PROTECTION

**NEVER trust memory. ALWAYS verify current.**

**Dangerous Assumptions:**
❌ "Last session said 0 errors"
❌ "Services were healthy"
❌ "Tests were passing"
❌ "Files were fresh"

**Required Approach:**
```bash
echo "=== VERIFICATION at $(date) ==="
curl -s localhost:4002/health | jq .
npx eslint . --ext .js | head -20
git status --short
ls -lt | head -30
# THEN claim based on THIS output
```

---

## ✅ PRE-CLAIM CHECKLIST

**Before EVERY claim:**
- [ ] Ran verification command(s)
- [ ] Captured ACTUAL output (not memory)
- [ ] Identified discrepancies (errors/warnings)
- [ ] Counted exact numbers (X/Y)
- [ ] Timestamped verification
- [ ] Provided PROOF (paste output)
- [ ] Stated what's NOT verified
- [ ] Used "I don't know" if uncertain

**ENFORCEMENT:** Every claim needs this format.

---

**WINNING = 100% VERIFICATION BEFORE 100% OF CLAIMS**

**Last Updated:** October 2, 2025
**Status:** MANDATORY
**Enforcement:** NO CLAIMS WITHOUT VERIFICATION
