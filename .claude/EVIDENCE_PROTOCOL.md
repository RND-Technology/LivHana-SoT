# EVIDENCE PROTOCOL - PROOF STANDARDS

**Version:** 1.0
**Status:** MANDATORY
**Purpose:** Define what counts as proof

---

## ⚡ CORE PRINCIPLE: NO EVIDENCE = NO CLAIM

---

## EVIDENCE TYPES

### Type 1: TERMINAL OUTPUT

**When Required:** Service health, errors, tests, git, commands

**Format:**

```
COMMAND: [exact command]
TIMESTAMP: [when run]
OUTPUT:
```

[full terminal output]

```
```

**Requirements:**

- MUST be actual output (not paraphrased)
- MUST include command
- MUST include timestamp
- MUST be complete (or show first 50 + last 20 if >100 lines)

**Example:**

```
COMMAND: curl -s http://localhost:4002/health | jq .
TIMESTAMP: 2025-10-02 21:25 PDT
OUTPUT:
```json
{"status":"healthy","service":"reasoning-gateway"}
```

```

---

### Type 2: FILE LISTINGS

**When Required:** File timestamps, counts, directory structure

**Format:**
```

COMMAND: ls -lt [path]
TIMESTAMP: [when run]
OUTPUT:

```
[paste ls output]
```

SUMMARY:

- Total files: [N]
- Files <1hr old: [N]
- Files >1hr old: [N]
- Oldest: [filename] ([age])

```

---

### Type 3: CODE DIFFS

**When Required:** Code changes, fixes, refactoring

**Format:**
```

FILES CHANGED: [list]
COMMAND: git diff [range]
DIFF:

```diff
[paste git diff]
```

SUMMARY: [description]

```

---

## EVIDENCE QUALITY LEVELS

### INSUFFICIENT (DON'T USE):
❌ "Service is healthy" (no evidence)
❌ "Tests passing" (no output)
❌ "I checked" (no proof)
❌ Paraphrased output
❌ "Trust me"

### MINIMAL (BARELY ACCEPTABLE):
⚠️ Command without timestamp
⚠️ Partial output (truncated)
⚠️ Screenshot without explanation

### GOOD (ACCEPTABLE):
✅ Command + timestamp + output
✅ Screenshot + timestamp + explanation
✅ Metric + source + timestamp

### EXCELLENT (TIER 1):
🌟 Multiple evidence types
🌟 Before/after comparison
🌟 Cross-verification (CLI + UI)
🌟 Timestamped chain
🌟 Raw data + interpretation

---

## FORBIDDEN PRACTICES

### ❌ Cached Evidence
Don't reuse old output
Don't trust memory
Don't assume "still true"

### ❌ Paraphrased Evidence
Don't summarize when raw needed
Don't interpret instead of showing
Don't describe when should paste

### ❌ Hypothetical Evidence
Don't say "should show"
Don't say "would output"
Don't say "probably says"

---

## HONESTY SCORING

**100-point scale:**
- No evidence: 0 (FAIL)
- Claimed without verification: 0 (FAIL)
- Minimal (command only): 40
- Good (command + output): 70
- Excellent (command + output + timestamp): 85
- Tier 1 (multiple sources): 100

**TARGET: 85+ for ALL claims**

---

**WINNING = PROOF FOR 100% OF CLAIMS**

**Last Updated:** October 2, 2025
**Status:** MANDATORY

<!-- Optimized: 2025-10-02 -->
