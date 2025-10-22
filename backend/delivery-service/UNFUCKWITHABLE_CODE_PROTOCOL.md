# UNFUCKWITHABLE CODE PROTOCOL

**Status**: ACTIVE - Zero-waste, zero-regret code
**Version**: 1.0.0
**Implementation**: LivHana Multi-Carrier Delivery Service
**Date**: 2025-10-08

---

## Mission

Minimal surface, maximal reliability. Every line of code is:

- Spec-locked before written
- Property-tested with random data
- Attack-tested by adversarial model
- Policy-gated before merge

**Result**: New code is easier than legacy—because we never allow entropy to enter.

---

## Architecture Principles

### A. Guardrails-First

✅ **Mono-repo + typed core**

- TypeScript with `strict: true`
- No `any`, no escape hatches
- Warnings = errors

✅ **Spec → code**

- OpenAPI/JSON Schema first
- Generate clients/servers from spec
- Lock with contract tests

✅ **Determinism**

- Containerize builds (Dockerfile + pinned toolchain)
- Reproducible via as-if-clean builds
- No global state

### B. Generate → Verify → Mutate

✅ **Dual-model codegen**

- Model A writes (Prompt 2: Codegen)
- Model B attacks (Prompt 3: Red Team)
- Threat-model + mutation diffs

✅ **Property-based tests**

- fast-check generates random inputs
- Tests run on each PR
- Invariants must hold for all inputs

✅ **Golden tests**

- Lock user-visible IO/API transcripts
- Any drift = fail
- No silent regressions

✅ **Mutation testing**

- Score must rise over time
- < threshold blocks merge

### C. CI/CD That Refuses BS

✅ **Pipeline stages**

1. Format check (Prettier)
2. Lint (ESLint strict)
3. Typecheck (tsc --noEmit)
4. Unit tests
5. Property tests
6. Fuzz tests (budgeted)
7. E2E tests (ephemeral env)
8. SLSA provenance + SBOM
9. OPA policy gate

✅ **Secrets**

- 1Password/Vault only
- Runtime via OIDC
- Never in env files

✅ **Policy-as-code**

- Open Policy Agent (OPA) gates
- PR labels checked
- Codeowners enforced
- Diff risk tiers

### D. Reliability Math Baked-In

✅ **SLIs/SLOs per service**

- Budget alerts feed back to tests
- Auto-create regress cases

✅ **Chaos lite on staging**

- Latency/jitter/fault injection
- Before prod cut

✅ **Backpressure & timeouts**

- Standardized across services
- Retries are idempotent or banned

### E. Thin Surface, Thick Tests

✅ **Public API only**

- Internal modules `@internal/*`
- Ban cross-boundary imports

✅ **No cleverness**

- Prefer 3 small functions over 1 "smart" one
- Cyclomatic threshold enforced (max 10)

✅ **Docs = assertions**

- Executable examples in Markdown
- Doctest/runme style

### F. Human Loop That Scales

✅ **PR template**

- Threat model
- Invariants
- Failure modes
- Rollback plan
- Blast radius

✅ **Red-team bot**

- Greps for footguns (regex & AST)
- Prompts Model B to craft exploits

✅ **Post-merge audit**

- Auto-generate "why safe" report
- Deviations create chores

---

## File Structure

```
/backend/delivery-service
  /specs (openapi.yaml, jsonschemas/)
    openapi.yaml ← Contract-first API spec
  /src
    /types
      carrier.ts ← Core interfaces + invariants
    /adapters
      skipcart.adapter.ts ← Provider implementations
      roadie.adapter.ts
      favor.adapter.ts
      dispatch.adapter.ts
      senpex.adapter.ts
      index.ts ← Adapter registry
    /lib
      orchestrator.ts ← Multi-carrier failover logic
  /tests
    /unit ← Fast, isolated tests
    /properties ← Property-based tests (fast-check)
    /fuzz ← Fuzz test seeds
  /ops
    /policies
      pr-approval.rego ← OPA policy gates
      codeowners.yaml ← Required reviewers
  tsconfig.json ← Strict TypeScript config
  jest.config.js ← Test runner config
  .eslintrc.json ← Linting rules (strict)
  .prettierrc.json ← Code formatting
  package.json ← Dependencies + scripts
```

---

## The 3-Prompt System

### Prompt 1: Spec Lock (Spec Arbiter)

**Use before ANY code**

File: `.claude/PROMPT_1_SPEC_LOCK.md`

- Write OpenAPI/JSON Schema
- List invariants & properties
- Create threat model
- Define test matrix
- **REFUSE TO GENERATE CODE**

### Prompt 2: Codegen (Code Builder)

**Use ONLY after Spec Lock complete**

File: `.claude/PROMPT_2_CODEGEN.md`

- Minimal implementation at public seams
- No globals, typed errors only
- Follow spec exactly
- Emit unit + property tests

### Prompt 3: Red Team (Breaker)

**Auto-runs on every PR**

File: `.claude/PROMPT_3_RED_TEAM.md`

- Attack the diff
- Test race conditions
- Test boundary overflows
- Test timeouts/backpressure
- Test authz bypass
- Propose exploits + fixes

---

## CI/CD Gates

### Pre-commit Hooks

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Format check
npm run format:check || exit 1

# Lint
npm run lint || exit 1

# Typecheck
npm run typecheck || exit 1

# Spec lock check
./scripts/check-specs.sh || exit 1
```

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install
        run: npm ci
      - name: CI Pipeline
        run: npm run ci

  red-team:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Red Team Attack
        run: npm run test:red-team

  policy-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: OPA Policy Check
        run: |
          opa eval -d ops/policies/ -i pr-data.json "data.livhana.pr_approval.allow"
```

---

## Carrier Adapters

### Supported Carriers

1. **Skipcart** (TX-heavy white-label)
   - API: <https://skipcartapi.readme.io/>
   - Signup: <https://express.skipcart.com/auth-signup>

2. **Roadie** (Coast-to-coast same-day)
   - API: <https://docs.roadie.com/>
   - Catalog: <https://apitracker.io/a/roadie-io>

3. **Favor** (Texas-only, H-E-B owned)
   - Merchant: <https://www.favordelivery.com/for-merchants>
   - Integration: <https://central.toasttab.com/s/article/Get-Started-with-the-Favor-Integration>

4. **Dispatch** (B2B courier network)
   - API: <https://info.dispatchit.com/the-dispatch-api>

5. **Senpex** (API-first last-mile)
   - Dev Portal: <https://dev.senpex.com/>

### Adapter Interface

All adapters implement:

```typescript
interface CarrierAdapter {
  readonly name: Carrier;
  getQuote(req: QuoteReq): Promise<QuoteResp>;
  createOrder(req: OrderReq): Promise<OrderResp>;
  parseWebhook(payload: unknown): StatusEvt;
}
```

### Orchestrator Features

- **Parallel quote fetching**: All carriers queried simultaneously
- **Price sorting**: Cheapest first
- **Automatic failover**: If primary fails, cascade to next
- **Timeout protection**: 60s max per carrier
- **Invariant validation**: All responses checked

---

## Test Coverage Requirements

### Unit Tests

- ✅ All public functions tested
- ✅ Happy path + edge cases
- ✅ Error handling

### Property Tests

- ✅ Invariants hold for random inputs
- ✅ 1000+ test cases per property
- ✅ Shrinking on failure

### Fuzz Tests

- ✅ Adversarial seed inputs
- ✅ Boundary values (max int, empty, null)
- ✅ Unicode edge cases

### Coverage Thresholds

```
Branches:   ≥80%
Functions:  ≥80%
Lines:      ≥80%
Statements: ≥80%
```

**Merge blocked if below threshold.**

---

## Deployment

### Local Development

```bash
npm install
npm run dev
```

### Test Suite

```bash
npm run test:all
# Runs: unit + properties + fuzz
```

### Production Build

```bash
npm run build
# Output: dist/index.js
```

### Cloud Run Deployment

```bash
gcloud run deploy delivery-service \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

---

## Key Learnings from "Blitzy"

1. **Context over cleverness**: Specs + fixtures = source of truth
2. **Adversarial automation**: Every gen step has breaker step
3. **Entropy tax is real**: Ban it at the gate with formatting/typing/policy
4. **Determinism wins**: Same inputs → same outputs → easier ops

---

## Success Metrics

### Code Quality

- ✅ Zero `any` types
- ✅ Zero ESLint warnings
- ✅ 100% spec coverage
- ✅ ≥80% test coverage
- ✅ Complexity ≤10 per function

### Security

- ✅ Zero critical vulnerabilities
- ✅ Zero high-severity findings
- ✅ All red team tests passing

### Reliability

- ✅ Failover works (tested)
- ✅ Timeouts enforced
- ✅ Retries are idempotent
- ✅ SLOs met in production

---

## Violations & Enforcement

### If code written without spec

1. PR blocked
2. Violation logged in `TEAM_ACCOUNTABILITY_SYSTEM.md`
3. Code reverted
4. Spec written first
5. Then re-submit

### If tests below threshold

1. Merge blocked
2. Coverage report attached
3. Add tests before retry

### If red team finds critical

1. Immediate merge block
2. Fix exploits
3. Add regression tests
4. Re-run red team

### If OPA policy fails

1. PR cannot merge
2. Fix policy violation
3. Request re-review

---

## Team Accountability

All agents (Claude Code, Replit, Cheetah, Codex) follow this protocol.

Violations logged in:

- `.claude/TEAM_ACCOUNTABILITY_SYSTEM.md`
- `.claude/TRUTH_RANKING_LOG_[DATE].md`

**No exceptions. No bypass.**

---

## Status

**Implementation**: Complete ✅
**Services**: 5 carrier adapters (Skipcart, Roadie, Favor, Dispatch, Senpex)
**Tests**: Property-based + unit + fuzz
**CI/CD**: OPA gates + 3-prompt system
**Deployment**: Ready for Cloud Run

**Next**: Wire to Lightspeed webhook → production deploy

---

**Document Owner**: Jesse Niesen (CEO)
**Last Updated**: 2025-10-08T00:30:00Z
**Version**: 1.0.0
**Classification**: Internal Use Only - Engineering Standards
