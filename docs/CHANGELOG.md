# CHANGELOG

## 2025-09-29 — Tier-1 Runtime Health & Square Ingest

- Injected 1Password secrets into `.env.runtime` files and updated Docker Compose to use them; voice/reasoning health checks now green.
- Ran `npm run square:pull` (39 transactions) and `npm run square:full` (33,317 transactions, 11,348 customers, 7 bank accounts); documented metrics in `docs/CURRENT_STATUS.md`.
- Lightspeed ingest returns 401 pending OAuth activation; recorded blocker status.

## 2025-09-28 — Tier‑1 Voice Mode Backbone

- Added shared memory store (`backend/common/memory`) with Redis fallback and feedback logging (`backend/common/feedback`).
- Enhanced DeepSeek worker to persist histories, guardrail outcomes, and feedback entries.
- Updated voice-service to proxy reasoning result/stream endpoints with request-context logging.
- Authored ADR-002 (Queue Architecture) and ADR-003 (Playwright MCP CI).
- Refreshed `docs/CURRENT_STATUS.md` to reflect working/pending Tier‑1 milestones.

## 2025-09-28 — Markdown & Test Pass

- Installed `markdownlint-cli2` and auto-fixed repository Markdown violations.
- Added `npm run test` scripts for `backend/common` and `backend/reasoning-gateway`; fixed logger mocks and dependency gaps.
- Updated Playwright SSE mock to use deterministic Redis queue helper.
- Documented current stack status, ADR index, and pipeline state in `docs/CURRENT_STATUS.md` and `docs/ADR_INDEX.md`.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->
