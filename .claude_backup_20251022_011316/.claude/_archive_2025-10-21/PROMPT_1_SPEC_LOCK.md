---
title: "P1: Spec Lock - Before Any Code"
purpose: Force spec-first, test-first development
status: MANDATORY - Pre-coding phase
enforcement: Pre-commit hook + CI gate
---

# PROMPT 1: SPEC LOCK (Spec Arbiter)

**Use this before writing ANY code for a new feature.**

## Prompt Template

```
You are the Spec Arbiter. Given {feature}, produce:

1) OpenAPI/JSON Schema (strict, examples)
   - All endpoints with request/response schemas
   - All error cases documented
   - Examples for every schema
   - Constraints on all fields

2) Invariants & properties (PBT-ready)
   - List all invariants that must hold
   - Express as testable properties
   - Include boundary conditions
   - Specify what should never happen

3) Threat model + misuse cases
   - Authentication/authorization bypass attempts
   - Input validation exploits (injection, overflow, etc.)
   - Race conditions and concurrency issues
   - Resource exhaustion attacks
   - Data leakage scenarios

4) Test matrix (unit, property, fuzz seeds)
   - Unit test cases (happy path + edge cases)
   - Property-based test generators
   - Fuzz test seed inputs
   - Integration test scenarios

REFUSE TO GENERATE CODE. Output only spec + tests.
```

## Enforcement

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check if new feature files lack corresponding spec
NEW_FILES=$(git diff --cached --name-only --diff-filter=A | grep 'src/.*\.ts$')

for file in $NEW_FILES; do
  SPEC_FILE="${file/src/specs}"
  SPEC_FILE="${SPEC_FILE/.ts/.spec.yaml}"

  if [ ! -f "$SPEC_FILE" ]; then
    echo "❌ SPEC LOCK VIOLATION: $file has no spec at $SPEC_FILE"
    echo "   Run: claude prompt P1 for feature $(basename $file)"
    exit 1
  fi
done
```

### CI Gate

```yaml
# .github/workflows/spec-lock.yml
name: Spec Lock
on: [pull_request]
jobs:
  verify-specs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check specs exist
        run: |
          npm run check:specs || exit 1
```

## Example Usage

### Input

```
Feature: Multi-carrier quote comparison
```

### Expected Output

```yaml
# specs/features/quote-comparison.spec.yaml

openapi: 3.1.0
paths:
  /quotes:
    post:
      summary: Get quotes from all carriers
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/QuoteRequest'
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/QuoteResponse'

# Invariants:
# 1. All quotes must have positive price
# 2. All quotes must have valid ETA (5-1440 mins)
# 3. Quotes must be sorted by price ascending
# 4. At least one carrier must succeed (or fail with clear error)

# Threat Model:
# - ZIP code injection (non-numeric input)
# - Weight overflow (negative, zero, > max)
# - ETA manipulation (zero, negative, unrealistic)
# - Rate limiting bypass
# - Concurrent request race conditions

# Test Matrix:
# Unit:
# - Valid request → successful quotes
# - Invalid ZIP → validation error
# - No carriers available → error
# Property:
# - fc.property: all prices positive
# - fc.property: quotes sorted by price
# Fuzz:
# - Seed: {"fromZip": "AAAAA", "toZip": "99999", "weightGrams": -1}
# - Seed: {"fromZip": "00000", "toZip": "00000", "weightGrams": 999999999}
```

## Checklist

Before moving to Prompt 2 (Codegen), verify:

- [ ] OpenAPI spec is complete and valid
- [ ] All invariants are listed
- [ ] Threat model covers common attack vectors
- [ ] Test matrix includes unit, property, and fuzz cases
- [ ] Examples are provided for all schemas
- [ ] No code has been generated yet

## Violations

If code is written without spec:

1. PR is blocked
2. Violation logged in TEAM_ACCOUNTABILITY_SYSTEM.md
3. Code must be reverted
4. Spec must be written first
5. Only then can code be re-submitted

---

**Status**: MANDATORY - No exceptions
**Enforcement**: Pre-commit hook + CI gate + PR reviews
**Owner**: Jesse Niesen (CEO)
**Last Updated**: 2025-10-08
