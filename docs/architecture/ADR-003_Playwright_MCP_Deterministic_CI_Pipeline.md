# ADR-003 — Deterministic Voice / Multi‑Agent Test Pipeline (Playwright MCP)

Status: Accepted (after revision)  
Version: 1.0  
Date: 2025-09-28  
Owner: Liv Hana (AI EA)  
Approver: Jesse (CEO)  
Related: ADR-002 (Dashboard – router health), END_TO_END_MISSION_TIER1.md

## 1. Context

Voice / Video / Chat “Every Screen Presence” + multi-agent DoBrowser/Comet+ browsing requires:

- Deterministic end‑to‑end (E2E) flows (enqueue → orchestrate → stream → playback).
- Fast feedback loops (flake < 2%).
- Secret-safe integration (multiple model vendors + TTS / audio).
- Contract stability between frontend React components, backend FastAPI endpoints, and the orchestration router.

Current gaps:

- No unified pipeline validating voice session lifecycle.
- No Playwright layer orchestrating browser + synthetic backend responses.
- Ad hoc mocking → brittle & environment-coupled tests.
- Secrets management not standardized (needs 1Password Service Account).
- No artifact retention (traces/videos) → slow diagnosis.

## 2. Problem Statement

Without deterministic, isolated E2E tests:

- Regressions in voice streaming & agent overlay risk production reliability.
- Router optimizations can silently degrade UI expectation.
- Multi-model parity & fallback behaviors remain unverified pre-merge.

## 3. Decision

Adopt a hardened CI pipeline integrating Playwright “MCP” (Model / Capability / Protocol) test suites with:

1. Layered test taxonomy (unit → contract → integration → deterministic E2E).
2. Deterministic mocks for external dependencies (LLM responses, audio synthesis, Redis/queue, SSE events).
3. Secret injection via 1Password CLI (`op run`) isolated to integration/E2E layers only when necessary.
4. Playwright trace & video artifacts uploaded on failure or optionally always for main branch.
5. Routing health assertions baked into E2E (baseline p95 guard).
6. Parallelizable test shards while maintaining reproducible seeds.

## 4. Test Taxonomy

| Layer | Folder | Purpose | Isolation Strategy |
|-------|--------|---------|--------------------|
| Unit | `backend/**/__tests__` & `frontend/**/__tests__` | Pure logic | No network |
| Contract (API schema) | `automation/tests/contracts/` | OpenAPI & JSON schema conformance | Generate & validate spec |
| Integration | `automation/tests/integration/` | FastAPI endpoints + mock adapters | In‑memory server, mocked LLM |
| E2E (Playwright MCP) | `automation/tests/playwright/` | Browser → voice session → streaming UI | Deterministic route mocks & SSE |
| Performance Smoke (optional Phase 2) | `automation/tests/perf/` | Basic latency budgets | Synthetic 10x parallel sessions |

## 5. Architecture Overview

```
[Playwright Runner] ──> [Mock Layer]
     |                     |-- LLM mock (deterministic JSON)
     |                     |-- TTS mock (static waveform)
     |                     |-- Router stub (scripted fallback)
     |                 [FastAPI App (in-memory)]
     |----> Browser context (Cockpit UI) → loads voice/agent overlay
```

Seeded randomization via `MCP_SEED` ensures reproducibility.

## 6. Mocking Strategy

| Dependency | Mock Type | Rationale |
|------------|-----------|-----------|
| LLM APIs (GPT/Claude/Gemini/DeepSeek) | Static JSON fixtures rotated by seed | Avoid network + cost |
| TTS (ElevenLabs) | Pre-generated waveform blob | Deterministic playback verification |
| Redis / Queue | In-memory ring buffer | Eliminate infra dependency |
| Browser Automation Agents | Stubbed navigation logs | Deterministic multi-agent overlay state |
| SSE Stream | Scripted token emission timeline | Validate incremental rendering |

Fixtures live under: `automation/tests/playwright/mocks/`.

## 7. Secrets & Environment

| Secret | Usage | Injection |
|--------|-------|-----------|
| DEEPSEEK_API_KEY | (Integration path only) | `op run -- ...` |
| ELEVENLABS_API_KEY | Real audio tests (phase 2) | `op run` |
| MODEL_ROUTER_CONFIG | Weighted model definition | Base64 config file |
| SESSION_JWT_SECRET | Sign ephemeral test tokens | Local ephemeral override |

**Principle:** E2E deterministic tests DO NOT require real vendor secrets (use mocks). Full integration job (optional nightly) can run with real keys behind protected environment.

## 8. GitHub Actions Workflow (Outline)

File: `.github/workflows/voice-mode-ci.yaml`

Steps:

1. Checkout  
2. Setup Node & Python  
3. Install deps (cache)  
4. Lint (`npm run lint` / `ruff` for Python optional)  
5. Unit + contract tests  
6. Start FastAPI test server (in memory or ephemeral)  
7. Run Playwright with seeded config (`MCP_SEED=42 npx playwright test --reporter=line`)  
8. Upload artifacts (`playwright-report`, `videos/`, `traces/`)  
9. (Optional) Coverage upload

Matrix (later): `{ browser: [chromium], shard: [1,2] }` with stable test grouping.

## 9. Verification & Metrics

| Metric | Goal | Collection |
|--------|------|-----------|
| Flake Rate (re-runs required) | < 2% | Track failing tests over last 20 runs |
| Median Pipeline Duration | < 10m | GitHub Actions timing |
| Deterministic Replay | 100% | Rerun with same seed identical outcome |
| Coverage (E2E Critical Paths) | ≥ 80% of voice workflows | VCWC cross-link |
| Router Regression Detection | p95 < 700ms (mock baseline) | Assert inside test suite |

Add `automation/scripts/check_playwright_assets.sh` (future) to ensure traces present on any failed test count > 0.

## 10. Alternatives Considered

| Alternative | Reason Rejected |
|-------------|-----------------|
| Cypress for E2E | Less native multi-browser + trace granularity for streaming SSE verification |
| Live vendor calls in CI | Slow, flaky, cost; violates deterministic principle |
| Single “all tests” monolith script | Harder isolation, poor root cause clarity |
| Docker-in-Docker staged environment early | Unnecessary complexity Phase 1 |

## 11. Implementation Plan

| Phase | Scope | Exit |
|-------|-------|------|
| 0 Skeleton | Create workflow + Playwright base config | CI green on trivial test |
| 1 Deterministic Core | Route mocks, SSE mock, TTS stub, router stub | Voice session test passes |
| 2 Contract Validation | OpenAPI schema generation & diff check | Contract job gate added |
| 3 Parallelization | Sharding + caching improvements | Duration reduction < 10m |
| 4 Nightly Real Integration (optional) | Real vendor smoke run (separate workflow) | Nightly artifact set |
| 5 Performance Smoke | Latency budget test | Perf thresholds enforced |

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Mock drift (fixtures diverge from real APIs) | False confidence | Monthy “real API” contract comparison job |
| Secrets exposure via logs | Compliance incident | Mask patterns + `--silent` for `op` commands |
| Increased CI time | Slower feedback | Incremental caching + optional parallel shards |
| Flaky SSE tests (timing) | Noise | Use event-driven waits (DOM markers) not fixed sleeps |
| Over-fitting tests to mock | Miss real-world edge | Nightly true integration + anomaly scoring |

## 13. Rollback Strategy

1. Disable `.github/workflows/voice-mode-ci.yaml` (comment trigger block).
2. Revert Playwright config & fixture directory.
3. Remove failing gating step from required branch protections temporarily.
4. Preserve artifacts for post-mortem.

## 14. Acceptance Criteria (Tier 1)

| Criterion | Measure |
|----------|---------|
| Deterministic E2E voice test | Passes ≥ 10 consecutive runs identical artifact hash |
| Traces & videos on failure | Present for every failing spec |
| Secretless default path | Playwright run passes with mocks only |
| Contract test diff gating | PR fails if OpenAPI schema drift unapproved |
| VCWC mapping | Each E2E test references workflow ID in `NSM_matrix.md` |
| Flake Rate | Observed < 2% after 50 pipeline executions |

## 15. Open Questions / Clarifications Needed

| Question | Priority | Notes |
|----------|----------|-------|
| MCP precise definition (internal standard?) | High | Define acronym expansion for doc clarity |
| Voice streaming protocol final form (SSE vs WebRTC hybrid?) | High | Affects test harness design |
| Real vs mock audio acceptance threshold | Medium | Decide if waveform hash or duration check |
| Browser automation agent overlay triggers | Medium | DOM contract spec required |
| Coverage mapping for multi-agent browsing flows | Medium | Need enumerated scenarios |

## 16. Follow-Up Tasks

- [ ] Commit `voice-mode-ci.yaml`
- [ ] Add Playwright config + seeds: `playwright.config.ts`
- [ ] Create mocks directory with README describing contract sync
- [ ] Implement contract spec export `scripts/export_openapi.py`
- [ ] Add nightly real integration workflow (Phase 4)
- [ ] Introduce `check_playwright_assets.sh` (optional gating later)

## 17. Appendix A — Sample Playwright Config (Excerpt)

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'automation/tests/playwright',
  retries: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]]
});
```

## 18. Appendix B — Sample Mock (SSE Transcript)

```json
[
  {"delay_ms": 0, "token": "Hello"},
  {"delay_ms": 80, "token": ","},
  {"delay_ms": 120, "token": " world"},
  {"delay_ms": 200, "token": "..."},
  {"delay_ms": 350, "token": "[END]"}
]
```

## 19. Appendix C — Voice Session E2E Assertions

| Assertion | Description |
|-----------|-------------|
| UI enters “Streaming” state within 400ms of first token | Startup threshold |
| Final token `[END]` closes stream & triggers playback component | Completion event |
| Router fallback scenario (forced mock) marks UI with `data-fallback=true` | Fallback detection |
| Telemetry beacon count = expected number of tokens | Token integrity |
| Snapshot diff (optional) includes session metrics | Observability integration |

---

<!-- Last verified: 2025-10-02 -->
