<!-- 1d5288f3-0adc-418d-adc3-403b7666ce82 35d36ac6-bb20-46c9-bcbb-08366268d714 -->
# Recon Plan: Principle of One Triaging + Hardening

## Scope & Constraints
- In-scope: Tier‑1 only (`backend/voice-service`, `backend/reasoning-gateway`, `backend/integration-service`, `backend/product-service`, `backend/common`, `frontend/vibe-cockpit`, `scripts/`, `config/`, `.claude/*`, `docker-compose.yml`).
- Out-of-scope for this pass: `legacy/**`, `**/venv/**`, `**/node_modules/**`, `backups/**`, `.claude_backup/**`, `out/**`, `out_mirror/**`, marketing/content trees.
- Constraint: Planning only. No file edits or network calls; enumerate sources for later fetch by network-enabled agents.

## 1) Gather Evidence (Catalog Only)
Catalog current truth with paths, mtimes, and hashes for CODEX:
- Voice fix docs: `.claude/CHEETAH_EXECUTION_COMPLETE_VOICE_FIX.md`, `.claude/CHEETAH_HANDOFF_VOICE_MODE_FIX.md`, `.claude/decisions/VOICE_MODE_SILENCE_BEHAVIOR.md`
- Session/boot state: `.claude/SESSION_PROGRESS.md`, `tmp/claude_tier1_prompt.txt`, `logs/claude_tier1_boot_*.log`
- Config/runtime: `config/voice_mode.json`, `scripts/claude_tier1_boot.sh`, `TIER1_BOOT_LOCK_3_AGENTS_24_7.sh`, `START.sh`
- Service code (splits): `backend/voice-purchase-service/src/{voice-purchase.ts,audio-service.ts,nlp-service.ts,payment-service.ts}`
- Transcripts: `~/.voicemode/logs/conversations/` (for Q/A ledger indices)

For CODEX to run (later), per file:
```bash
ls -la <file> && shasum -a 256 <file>
```
For directories:
```bash
find <dir> -type f -maxdepth 1 -print0 | xargs -0 shasum -a 256 | sort
```

Deliverable: evidence index with path, mtime, sha256, and short note (purpose/use).

## 2) Fallacy Scan Blueprint (Authority Map)
For each directive/assumption, map to external references to fetch later and tests to run:
- Voice assistants: continuous listening, VAD thresholds, pause-vs-terminate semantics
  - Sources to pull: LiveKit Voice/RTC docs; Apple/Siri and Alexa behavior overviews; industry guides on VAD and turn-taking.
- Slack slash-command security & UX
  - Sources to pull: [Slack: Verifying requests from Slack](https://api.slack.com/authentication/verifying-requests-from-slack), [Slack: Slash Commands](https://api.slack.com/interactivity/slash-commands), [Slack: Rate limits](https://api.slack.com/docs/rate-limits), [response_url docs](https://api.slack.com/interactivity/handling#delayed_responses).
- CLI hygiene & Ink/TTY
  - Sources to pull: Anthropic Claude Code CLI release notes and docs; Ink TTY/raw-mode guidance; Homebrew vs npm global install best practices.
- Secure exposure
  - Sources to pull: [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/), [Tailscale Funnel](https://tailscale.com/kb/1223/funnel/), JWT best practices.
- Compliance
  - Sources to pull: Veriff API docs, minimal PII handling guidelines.

Output: comparison matrix with columns: "Claim/Directive" → "Authority Sources" → "Validation Test" → "Risk" → "Proposed PO1 change".

## 3) Risk Stratification (Blast Radius)
- P0: Voice-mode continuity (silence must never end session); Slack request verification + JWT; secure exposure
- P1: CLI stability (brew-only; Node 20; TTY-only doctor); Docker healthchecks
- P2: Lint/test gating and repo hygiene; large-file refactors (voice-purchase split follow-through)
- For each: document observed failure modes (from logs/notes) and attach acceptance tests.

## 4) PO1 Upgrade Strategy Drafts (one plan per area)
- Voice Persistence (verify-only): Keep current fix; add explicit tests and a boot gate checklist for CODEX.
  - Acceptance: Prompt contains banner; config has `terminate_session:false`; 3 grep validations pass; manual "say 'silence'" test: voice pauses, text continues.
- CLI Stability: Brew-only; remove npm global; Node 20 via nvm; interactive-only doctor; preflight guard in `START.sh` and `TIER1` script.
  - Acceptance: `which claude` → `/opt/homebrew/bin/claude`; `claude --version` OK; `claude doctor` OK from TTY; preflight fails fast when drift occurs.
- Mobile Orchestration: Slack bridge MVP + Tailscale tmux (backup).
  - Acceptance: `/agent status` returns PATH/Node/Redis/voice; ack < 3s with delayed response pattern; Tailscale `tmux ls` shows `voice`.
- Lint/Test Gate: Root ESLint ignore + recommended presets; per‑service configs extend root; jest unified; one trivial test per service.
  - Acceptance: `npm run lint --workspaces` passes; `npm test --workspaces` loads configs; touched services green.

## 5) Fused Planning Artifacts (to produce)
- `docs/mobile-control.md` (flows, security, verification, rollback)
- `docs/lint-test-hygiene.md` (ESLint/Jest standards, ignores, commands)
- `docs/fallacy-scan.md` (matrix + citations to fetch; open questions)
- Refresh `.claude/decisions/*` if any new permanent decisions are made
- Update `CHANGELOG.md` after each PO1 track ships

## Handoff & Verification Gates
- CODEX executes catalog + fallacy-scan fetch; attaches citations and test diffs
- Cheetah implements per‑track plan in order: CLI → Lint/Test → Voice tests → Slack/Tailscale
- QA verifies gates per acceptance criteria; Problems panel ≤ 5, no config errors

## Non-Goals
- No full cloud instance automation in this pass; no advanced Slack workflows beyond `/agent` MVP


### To-dos

- [ ] Catalog Tier‑1 evidence with path, mtime, sha256, brief purpose
- [ ] Draft fallacy-scan matrix with authority sources and validation tests
- [ ] Stratify risks (P0/P1/P2) with observed failure modes
- [ ] Draft verify-only plan and tests for voice persistence
- [ ] Draft CLI Stability plan (brew-only, Node 20, TTY doctor, preflight)
- [ ] Draft Slack bridge + Tailscale backup design with guardrails
- [ ] Draft Lint/Test gating plan (ESLint/Jest unified)
- [ ] Author docs/mobile-control.md with flows and rollback
- [ ] Author docs/lint-test-hygiene.md and CHANGELOG entries
- [ ] Author docs/fallacy-scan.md with citations to fetch later