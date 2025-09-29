# ADR-003 — Playwright MCP + Deterministic CI Pipeline

**Status:** Proposed • **Date:** 2025-09-28 • **Owner:** Liv Hana (Codex Tier‑1)

## 1. Context

- Voice Mode requires deterministic end-to-end tests (Playwright) covering queue flow (enqueue → stream → playback).
- CI currently lacks Playwright MCP integration, deterministic mocks, and secure secret handling (via 1Password `op run`).

## 2. Decision

Adopt a CI pipeline with the following characteristics:

1. **Playwright MCP Job** — GitHub Actions workflow runs `npm run lint`, unit/integration tests, and Playwright (`automation/tests/playwright`).
2. **Deterministic Mocks** — Use Playwright route mocks to simulate Redis queue (enqueue/result/stream) so tests are independent of live services.
3. **Secrets via 1Password** — Workflow loads required secrets with `1Password Service Account` + `op run` for `DEEPSEEK_API_KEY`, `ELEVENLABS_API_KEY`.
4. **Artifacts & Trace** — Upload Playwright traces/videos for debugging on failure.
5. **Cache & Parallelism** — Use actions/cache for node_modules, run lint/tests/Playwright in matrix (or sequential with gating).

## 3. Consequences

- Deterministic tests reduce flake and allow fast iteration without full stack.
- Additional setup time for `op` CLI in CI but maintains guardrail compliance.
- Requires maintenance of mocks when API contracts change.

## 4. Implementation Snapshot

- Workflow file `/.github/workflows/voice-mode-ci.yaml` with steps:
  1. Checkout + setup Node
  2. `op run --config /path` to inject secrets
  3. `npm ci`
  4. `npm run lint`
  5. `npm run test` (unit/integration)
  6. `npm run test --prefix automation/tests/playwright`
  7. Upload Playwright report
- Playwright config uses deterministic SSE payloads for reasoning stream.

## 5. Risks & Mitigations

- **Secret leakage** → `op run` with env mapping; ensure no secrets logged.
- **Mock drift** → maintain shared mock definitions in `automation/tests/playwright/mocks/`.
- **CI duration** → enable caching and fail-fast strategy.

## 6. Acceptance Criteria

- Workflow passes on main with deterministic Playwright run.
- Playwright report artifact accessible via GitHub UI.
- Tests run without hitting live Redis/DeepSeek/ElevenLabs.
- Documented in `docs/testing/playwright_mcp.md` with command references.
