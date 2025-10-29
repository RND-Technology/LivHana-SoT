# Lint & Test Hygiene for Liv Hana

## Overview

This document describes the linting and testing standards for Liv Hana Tier-1 services.

### Goals
- Ship Tier-1 changes with predictable quality gates.
- Detect regressions in voice-first flows before they reach production.
- Provide a shared playbook for engineers, QA, and SRE to debug failures quickly.

### Success Metrics
- 100% of Tier-1 pull requests run through the full gating pipeline.
- Mean time to detect (MTTD) < 10 minutes for broken builds on `main`.
- Mean time to resolution (MTTR) < 2 hours for red pipelines, with RCA captured in `docs/qa/`.

## Test Scope Matrix

| Layer | What we validate | Primary tools | Trigger | Owner |
| --- | --- | --- | --- | --- |
| Lint | Static analysis, style, import hygiene | ESLint, TypeScript | Pre-commit & CI | All engineers |
| Unit | Pure functions, adapters, guards | Jest (ts-jest), vitest (frontend) | On save (watch) & CI | Service squads |
| Integration | Redis queues, TTS adapters, REST bridges | Jest projects + Docker services | Nightly & PRs touching service | Service squads + QA |
| Contract | BullMQ job payloads, API schemas | Pact, zod schema validation | Weekly + release cut | QA lead |
| E2E | Voice UX, cockpit flows, compliance gating | Playwright cloud grid | Nightly + release candidate | QA + SRE |
| Smoke (Prod parity) | `/health`, critical endpoints | Curl + Playwright smoke | Post-deploy | SRE |

> **Note:** Frozen directories are excluded from automation by design to protect historical artifacts. Any exceptions require sign-off from the QA lead and SRE captain.

## ESLint Configuration

### Tier-1 Scope
Only lint Tier-1 services:
- `backend/voice-service`
- `backend/reasoning-gateway`
- `backend/integration-service`
- `backend/product-service`
- `frontend/vibe-cockpit`

### Excluded Paths
Frozen directories (not linted):
- `1.rnd/**`
- `empire/**`
- `deployment/**`
- `backups/**`
- `legacy/**`
- `logs/**`
- `**/venv/**`
- `**/node_modules/**`

### Rules
- TypeScript: `plugin:@typescript-eslint/recommended`
- Test files: Relaxed rules (no max-lines-per-function)
- Coverage: 50% minimum threshold

## Jest Configuration

### Projects
Only test Tier-1 services:
- `integration-service`
- `voice-service`
- `reasoning-gateway`
- `product-service`
- `vibe-cockpit`

### Setup Files
- `tests/globalSetup.js`: Global test setup
- `tests/globalTeardown.js`: Global test teardown
- `frontend/vibe-cockpit/tests/setup.js`: Frontend test setup

### Smoke Tests
Each Tier-1 service must have a smoke test:
```
backend/<service>/tests/smoke/health.test.js
```

Smoke test checks:
- Service health endpoint returns 200
- Response includes expected fields
- Service is operational

## Environment & Tooling

| Dependency | Purpose | Local Start | CI/Automation |
| --- | --- | --- | --- |
| Redis 7 (BullMQ) | Queue-backed workflows | `docker-compose up redis` | GitHub Actions service container |
| ElevenLabs mock server | Deterministic TTS responses | `npm run voice:mock` | Recorded fixtures replayed via VCR harness |
| External APIs (Leafly, compliance) | Integration coverage | Stub servers in `tests/stubs/` | Smoke tests only (flagged via secrets) |
| Secrets | API keys, JWT seeds | `.env.local` (never committed) | GitHub Actions secrets + `op run` |
| Playwright grid | Cross-browser E2E | `npm run test:e2e -- --project=chromium` | Managed cloud grid via `PLAYWRIGHT_SERVICE_URL` |

Ensure these services are healthy before running integration or E2E suites. Use `./automation/scripts/check_housekeeping_queue.sh` to confirm Redis queue depth prior to starting long-running suites.

## Execution Pipeline

1. **Lint Fast Pass** – `npm run lint:fix` locally, `npm run lint` in CI.
2. **TypeCheck** – `tsc --build` across workspaces with incremental caching.
3. **Unit Tests** – `npm test -- --runInBand --selectProjects <service>` for touched services (parallelized in CI).
4. **Contract Tests** – Pact/zod validation with generated reports stored in `artifacts/contracts/`.
5. **Integration Tests** – Spin up Redis + service containers; execute `npm run test:integration` (skipped if only docs/config changes).
6. **E2E Regression** – Playwright suite seeded with synthetic voice jobs; artifacts uploaded to S3 + GitHub Actions summary.
7. **Smoke & Observability** – Trigger `tests/e2e/smoke` plus health probes using deployment-ready container images.

Pipelines fail fast; later stages only run if earlier gates pass. Configure branch protections to require lint, unit, and integration checks before merge.

## Running Tests

### All Tests
```bash
npm test
```

### Specific Service
```bash
npm test -- integration-service
```

### Coverage
```bash
npm test -- --coverage
```

### Linting
```bash
npm run lint
```

## Test Data Management

- **Fixtures** live under `tests/fixtures/<service>/` and must be version-controlled.
- **Redis seeds** are serialized via `tests/fixtures/redis/*.json` and loaded with `scripts/testing/load_redis_fixtures.ts`.
- **Voice assets** are faked with deterministic MP3 clips stored in `tests/fixtures/audio/` to avoid ElevenLabs rate limits.
- **Database state** resets via `npm run db:reset:test` to guarantee idempotent runs.
- **Sensitive data** (PII, HIPAA) is never stored in fixtures; use synthesized equivalents flagged with `/* synthetic */` comments.
- After every integration/E2E run, invoke `npm run test:cleanup` to purge queues and temporary blobs.

## Acceptance Criteria

### Lint
- Zero config errors
- Tier-1 violations < 300
- All violations are high-signal
- No references to frozen paths

### Tests
- Jest runs without config errors
- Tier-1 smoke tests pass
- No missing setup errors
- Coverage > 50%

### Build
- `tsc --build` completes
- No TypeScript errors
- All imports resolve

### Docker
- Services start successfully
- Health endpoints return healthy
- No container errors

## Monitoring

### Lint Violations
Track via `.eslintcache` and lint reports

### Test Failures
Monitor via Jest output and coverage reports

### Service Health
Check via `/health` endpoints

## Troubleshooting

### ESLint Config Errors
1. Check `.eslintrc.json` syntax
2. Verify parser plugins installed
3. Check file extensions match

### Jest Config Errors
1. Verify project paths exist
2. Check `globalSetup`/`globalTeardown` exist
3. Review test match patterns

### Test Failures
1. Check service dependencies
2. Verify test data exists
3. Review error messages

### Build Errors
1. Check TypeScript config
2. Verify imports are correct
3. Review compilation errors

## Failure Handling & Escalation

1. **Capture Context** – Archive Jest/Playwright artifacts, logs, and screenshots to `artifacts/<date>/`.
2. **Triage** – Within 15 minutes, identify owning squad and label the GitHub issue with `qa:red`.
3. **Stabilize** – Revert or hotfix if the `main` branch is blocked; auto-save watchdog continues to snapshot progress.
4. **Communicate** – Post updates in `#qa-signal` Slack channel every 30 minutes until green.
5. **Retrospective** – File RCA in `docs/qa/rca/<date>-<issue>.md` within 24 hours of resolution.

## Best Practices

1. **Write Tests First**: TDD approach
2. **Keep Tests Simple**: One assertion per test
3. **Mock External Services**: Don't call real APIs
4. **Clean Up**: Remove test data after tests
5. **Document**: Comment complex test logic

## Continuous Integration

### Pre-commit Hook
```bash
npm run lint && npm test
```

### Pull Request Checks
- Lint must pass
- Tests must pass
- Coverage must meet threshold
- Build must succeed

## Resources

- ESLint: https://eslint.org/docs/latest/
- Jest: https://jestjs.io/docs/getting-started
- TypeScript: https://www.typescriptlang.org/docs/

