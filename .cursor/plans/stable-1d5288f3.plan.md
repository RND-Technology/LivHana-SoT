<!-- 1d5288f3-0adc-418d-adc3-403b7666ce82 f47d3a30-ef03-4cbf-bba1-4ad79bb54efa -->
# Stable Claude CLI + Mobile Control (Selected: Slack Bridge + Tailscale)

## Goals
- Keep the now-fixed Voice Mode behavior intact (banner + silence checks) and avoid mixing with unrelated changes.
- Stabilize Claude CLI on M4 Mac; standardize installs across Mac and cloud.
- Enable reliable mobile control while away from the desk: Slack bridge first, Tailscale as ultra-stable backup; optional Replit read-only fallback.

## A. Standardize CLI Installs
- Mac (primary): Brew-only install for `claude` CLI, Node LTS 20 via nvm in interactive shells. Remove npm global to avoid path conflicts. Validate from attached TTY only.
- Cloud Linux (fallback when Mac is offline): Prefer Homebrew on Linux for parity; if unavailable, use NodeSource Node 20 + npm global (document PATH clearly). Do not store secrets; use `op run`.
- Add preflight in `START.sh` and `TIER1_BOOT_LOCK_3_AGENTS_24_7.sh` to assert PATH, Node, and `claude --version`, failing with actionable guidance.

## B. Mobile Control — Selected Options

### 1) Slack Orchestrator Bridge (primary)
- Create Slack App with `/agent` slash command and Interactivity.
- Implement minimal webhook in `backend/integration-service` (`src/slack/bridge.ts`) that:
  - Verifies Slack signature; enforces JWT; rate limits.
  - Publishes jobs to Redis queue `reasoning.jobs` for `backend/reasoning-gateway`.
  - For Mac-local actions (start/stop voice session), hands off to an allowlisted local script (`scripts/claude_voice_session.sh`) via a small local agent.
- Expose webhook via Cloudflare Tunnel or Tailscale Funnel; no inbound ports.
- Map commands: `start-voice`, `silence`, `resume`, `status`, `logs`, matching `.claude/VOICE_MODE_SILENCE_PROTOCOL.md`.

### 2) Tailscale + SSH + tmux (backup/low-latency)
- Install Tailscale on Mac; from iPhone use Blink/Termius to SSH.
- Maintain a persistent tmux session `voice` running CLI; helper commands `vmute`/`vresume` for silent/resume.
- Works anywhere without extra infra; very reliable while traveling.

### 3) Replit Read-Only Fallback (optional)
- Private Replit on a mirror branch with text-only CLI usage and synthetic mocks.
- PRs flow back to SoT; never push secrets.

## C. Immediate Next Steps (Voice Mode aware)
- Run `scripts/claude_tier1_boot.sh` and confirm the banner/silence gates pass; ensure only non-fatal warnings.
- Start watchdog and compliance services to achieve a fully green boot before mobile handoff.
- Keep feature work (Slack/Tailscale) isolated on a new branch; do not mix with existing unrelated changes.

## D. Verification
- Local CLI: `which claude && claude --version` shows brew path; `claude doctor` passes from interactive terminal.
- Slack: `/agent status` shows green checks (PATH, Node, Redis, voice session).
- Tailscale: `ssh <tailscale-ip> 'tmux ls'` lists `voice`.
- Voice Mode: `tmp/claude_tier1_prompt.txt` begins with voice banner; logs show no voice errors.

## Deliverables
- Working Slack bridge with Redis wiring and secure exposure.
- Tailscale SSH + tmux helpers for immediate control from iPhone.
- Preflight checks integrated; short `docs/mobile-control.md` with flows and rollback.

## Out of Scope (for now)
- Full cloud instance automation; advanced Slack workflows beyond `/agent` MVP.

## To-dos
- [Selected] Uninstall npm global and reinstall Claude CLI via Homebrew (brew-only)
- [Selected] Add CLI preflight checks to START.sh and TIER1 boot script
- [Selected] Create Slack app and minimal webhook in integration-service with Redis publish
- [Selected] Add guarded scripts to start/stop persistent claude voice session via tmux
- [Selected] Expose webhook securely via Cloudflare Tunnel or Tailscale Funnel
- [Selected] Set up Tailscale, SSH, and tmux session for text-first mobile control
- [Selected] Start watchdog and compliance services for green boot
- [Optional] Create Replit fallback read-only mirror and docs for safe use
- [Selected] Write docs/mobile-control.md covering flows and verification

### To-dos

- [ ] Uninstall npm global and reinstall Claude CLI via Homebrew (brew-only)
- [ ] Add CLI preflight checks to START.sh and TIER1 boot script
- [ ] Create Slack app and minimal webhook in integration-service with Redis publish
- [ ] Add guarded scripts to start/stop persistent claude voice session via tmux
- [ ] Expose webhook securely via Cloudflare Tunnel or Tailscale Funnel
- [ ] Set up Tailscale, SSH, and tmux session for text-first mobile control
- [ ] Start watchdog and compliance services for fully green boot
- [ ] Create Replit fallback read-only mirror and docs for safe use
- [ ] Write docs/mobile-control.md covering flows and verification