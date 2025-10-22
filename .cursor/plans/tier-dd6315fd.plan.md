<!-- dd6315fd-e9db-4281-bc27-6509e33c3a8d 476bb331-3fc9-4a86-8372-ebff317ec0c5 -->
# Tier‑1 Recon + Fallacy Scan → Hardening (PO1)

## Purpose
Planning‑only blueprint to ingest evidence, scan for fallacies against current best practices, stratify risk, and refine the Tier‑1 hardening tracks for a clean, shippable PO1 outcome. No execution; outputs are artifacts and numbered tasks for CODEX → Cheetah → QA.

## Scope (Principle of One)
- In scope (Tier‑1): `backend/voice-service`, `backend/reasoning-gateway`, `backend/integration-service`, `backend/product-service`, `frontend/vibe-cockpit`, `docker-compose.yml`, `scripts/`, `config/`, `.claude/decisions/` (docs only).
- Frozen (gated for later): `1.rnd/**`, `empire/**`, `deployment/**` (incl. replit-pwa), `backups/**`, `legacy/**`, `logs/**`, any `venv/**`.

## 1) Evidence Catalog (no execution)
Collect references (paths, timestamps, hashes where available) into an Evidence Ledger for QA:
- Session and directives
  - `.claude/SESSION_PROGRESS.md`
  - `.claude/CHEETAH_HANDOFF_VOICE_MODE_FIX.md`
  - `.claude/decisions/VOICE_MODE_SILENCE_BEHAVIOR.md`
  - Optional local transcripts (for later agent): `~/.voicemode/logs/conversations/**`
- Runtime/boot
  - `scripts/claude_tier1_boot.sh`
  - `START.sh`, `TIER1_BOOT_LOCK_3_AGENTS_24_7.sh`
  - `config/voice_mode.json`
- Services + tests/build
  - `jest.config.unified.js`, `tests/**`, `frontend/vibe-cockpit/tests/setup.js`
  - Tier‑1 entrypoints: `backend/voice-service/src/index.js`, `backend/reasoning-gateway/src/index.js`, `backend/integration-service/src/index.js` (or service app files)
  - `docker-compose.yml`

Deliverable: `docs/evidence-ledger.md` summarizing file → purpose → last modified → checksum (filled by CODEX).

## 2) Fallacy Scan Blueprint (authorities to pull later)
Map each directive/assumption to authoritative sources to validate once network agents run. Specify exact targets (queries/URLs) for later retrieval:
- Voice mode continuity (silence = pause, not end)
  - OpenAI Realtime/Voice assistant UX notes (2024–2025), LiveKit Voice best practices, Google/Alexa voice interaction guidelines.
  - Queries: “voice assistant silence pause not end session best practices”, “LiveKit continuous listening UX”, “OpenAI realtime voice interrupt guidelines”.
- CLI hygiene (Claude Code)
  - Anthropic `claude-code` brew formula + release notes (2.x), Homebrew PATH precedence guidance, Node 20 LTS.
  - Queries: “anthropic claude-code homebrew formula”, “claude-code release notes 2.0.24”, “homebrew path order macOS m1 m4”.
- Slack automation (slash command security)
  - Slack signing secret verification docs, rate limiting, response_url patterns, 3‑second response rule, retries.
  - Queries: “Slack slash commands verify signature example node”, “Slack 3 second response best practices”, “response_url delayed responses”.
- Queue + Web security
  - Redis/BullMQ best practices (idempotency, backoff, DLQ), OWASP API Security Top 10 (webhooks/JWT), secrets management with 1Password CLI (`op run`).
  - Queries: “BullMQ retry backoff DLQ pattern”, “OWASP API security webhook JWT”, “1Password op run best practices”.
- Compliance (Age verification)
  - Veriff API integration guidelines (biometric ID), avoid cookie‑only gates.
  - Queries: “Veriff API integration age verification web guidelines”.

Deliverable: `docs/fallacy-scan.md` with a matrix: Claim/Directive → Source(s) to cite → Evidence status (TBD/Found/Refuted) → Action.

## 3) Risk Stratification (blast radius × likelihood)
- R1 Voice‑mode continuity guarantees (Critical/High): session loss on “silence”.
- R2 CLI stability (High): PATH collisions, non‑TTY doctor/update flakiness.
- R3 Mobile control security (High): Slack bridge signature/JWT/queue guardrails.
- R4 Lint/Test gating (Medium): repo‑wide noise blocking signal.
- R5 Docker secrets hygiene (High): `secrets:` externalization, env scoping.
- R6 Test coverage gaps (Medium): lack of smoke tests/health checks.

Deliverable: `docs/risk-register.md` with ratings, symptoms observed, and PO1 remediation owner/ETA placeholders.

## 4) PO1 Upgrade Strategy Drafts (tracks)
A. Voice Persistence (already partially fixed)
- Design: Banner + explicit config (`terminate_session:false`, text‑only on silence) + boot validation.
- Guardrails: HEREDOC instructions + grep checks; no termination on silence.
- Verification: boot script validation 3/3; manual “silence” scenario; unit test stub of config read.
- Rollback: disable banner via env flag; retain text mode.

B. CLI Stability (Homebrew‑only)
- Design: brew‑only install; Node 20 LTS via nvm; PATH/TTY guards; no auto‑update in non‑TTY.
- Guardrails: START/BOOT preflight (PATH, `which claude`, Node v20, `redis-cli`).
- Verification: interactive `claude --version` & `claude doctor` pass; preflight green.
- Rollback: guidance printed when failing; no changes applied automatically.

C. Mobile Orchestration (Slack bridge primary; Tailscale backup)
- Design: `/agent` slash → signature verify → JWT → Redis publish (`reasoning.jobs`); minimal local agent for allowed scripts (voice start/silence/resume/status/logs). Exposure via Cloudflare Tunnel/Tailscale Funnel.
- Guardrails: per‑route rate limit, input allowlist, job schema guard, DLQ.
- Verification: `/agent status` shows PATH/Node/Redis/voice health; e2e dry‑run.
- Rollback: disable route via env feature flag.

D. Lint/Test Gate (Tier‑1)
- Design: narrow lint surface via `.eslintignore`; root TS/Jest overrides; smoke tests per service; trim Jest projects to real Tier‑1.
- Guardrails: prevent config errors; keep violations actionable; document temporary overrides.
- Verification: `npm run lint/test/build` complete; health endpoints green under `docker-compose`.
- Rollback: revert ignore entries; re‑enable stricter rules gradually.

Deliverables per track are already listed in `tier.plan.md`; this recon adds research references, risks, and acceptance criteria alignment.

## 5) Planning Artifacts to Update/Fuse
- `docs/evidence-ledger.md` (new)
- `docs/fallacy-scan.md` (new)
- `docs/risk-register.md` (new)
- `docs/mobile-control.md` (flows, commands, rollback)
- `docs/lint-test-hygiene.md` (lint/test scoping & philosophy)
- `docs/secrets.md` (compose `secrets:` externalization; 1Password `op run`)
- Refresh `.claude/decisions/*` if scan refines directives.
- Keep `tier.plan.md` as the single execution plan; cross‑link new docs.

## Acceptance Criteria (Recon phase)
- Evidence Ledger populated for all in‑scope files with path + timestamp (+checksum where feasible).
- Fallacy‑scan matrix lists concrete docs/threads to pull; each Tier‑1 directive mapped to ≥2 authoritative sources.
- Risk Register finalized with owner + remediation track mapping.
- Each PO1 track has design, guardrails, verification, rollback written and aligned with Tier‑1 QA shippability.
- Planning artifacts added/updated and linked from `tier.plan.md`.

## Handoff
- CODEX implements the artifact files and plan edits (no runtime changes yet) under PR `tier1-recon/plan-0`.
- Cheetah executes Tier‑1 hardening per `tier.plan.md` after CODEX merges, then QA validates against AC.


### To-dos

- [ ] Create docs/evidence-ledger.md and catalog Tier‑1 files
- [ ] Create docs/fallacy-scan.md with sources to pull later
- [ ] Create docs/risk-register.md with ratings and owners
- [ ] List exact external docs/threads to fetch per topic
- [ ] Write Voice Persistence track spec (design/guardrails/AC)
- [ ] Write CLI Stability track spec (design/guardrails/AC)
- [ ] Write Mobile Orchestration track spec (design/guardrails/AC)
- [ ] Write Lint/Test Gate track spec (design/guardrails/AC)
- [ ] Update tier.plan.md to link new docs; prep PR tier1-recon/plan-0