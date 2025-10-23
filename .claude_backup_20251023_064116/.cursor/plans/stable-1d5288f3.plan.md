<!-- 1d5288f3-0adc-418d-adc3-403b7666ce82 457d6463-dbf2-4787-9aa2-fdf5872cce99 -->
# Tier‑1 CODEX Plan — Stable CLI + Mobile Control (Slack Bridge + Tailscale)

### Decisions (Tier‑1 defaults)
- Slack webhook exposure: Cloudflare Tunnel (cloudflared) with JWT + Slack signature verification.
- CLI Node: pin Node 20 via nvm for interactive shells; keep relaxed ≥20 guard in boot.
- Voice model: Sonnet 4.5 OCT 2025 enforced; voice remains voice‑only; CODEX/Execution delegated.

### A) CLI Stabilization (Mac primary)
- Remove npm global @anthropic-ai/claude-code to avoid PATH conflicts.
- Reinstall via Homebrew only; ensure `/opt/homebrew/bin/claude` is resolved.
- Add nvm use 20 in interactive shells for CLI; verify from an attached TTY.
- Keep existing boot preflights; add a short “remediation” hint when guards fail.

### B.1) Slack Orchestrator Bridge (primary)
- Create Slack app (slash: /agent, Interactivity on) via manifest.
- Implement `backend/integration-service/src/slack/bridge.ts`:
  - Verify Slack signatures; enhance JWT middleware; rate‑limit.
  - Publish jobs to Redis queue `reasoning.jobs`.
- Implement consumer `backend/reasoning-gateway/src/jobs/slack-commands.ts`.
- Map commands: start-voice, silence, resume, status, logs → either queue or allowlisted local script `scripts/claude_voice_session.sh`.
- Expose webhook via Cloudflare Tunnel; document tunnel config + service mapping.

### B.2) Tailscale Mobile (backup/low‑latency)
- Install Tailscale on Mac; enable SSH.
- Add tmux helpers `scripts/mobile/{vmute,vresume,vstatus}.sh` and bootstrap `scripts/mobile/start-voice-session.sh`.

### C) Watchdog + Compliance
- Create `scripts/watch-session-progress.sh` wrapper that delegates to `scripts/agents/voice_orchestrator_watch.sh` and logs health.
- Start/verify compliance service (service stub or start script) to reach a green boot.

### D) Documentation
- `docs/mobile-control.md`: flows (Slack and Tailscale), security, verification, rollback.
- Include Slack commands table, Tailscale setup steps, cloudflared instructions.

### Verification / Acceptance
- CLI: `which claude` → /opt/homebrew/bin/claude; `claude --version` OK; `node -v` shows v20 in interactive shells; guards pass.
- Slack: `/agent status` returns green checks (PATH, Node, Redis, voice session). Signatures verified; JWT enforced.
- Redis: command jobs observed in `reasoning.jobs`; consumer processes and updates status JSON.
- Cloudflared: public URL returns 401 without JWT; 200 with valid signature + JWT.
- Tailscale: `ssh <tailscale-ip> 'tmux ls'` shows `voice`; helpers vmute/vresume/vstatus work.
- Boot: watchdog/compliance running; no blocking warnings; voice banner + silence checks pass.

### Out of scope (now)
- Replit fallback automation; advanced Slack workflows beyond /agent MVP.


### To-dos

- [ ] Remove npm global @anthropic-ai/claude-code from Mac shells
- [ ] Reinstall claude via Homebrew; ensure /opt/homebrew/bin/claude in PATH top‑3
- [ ] Add nvm use 20 for interactive shells and verify from attached TTY
- [ ] Add short remediation messages to boot preflights (PATH/Node/claude)
- [ ] Create Slack app manifest for /agent + Interactivity; document scopes
- [ ] Add src/slack/signature-verify.ts (Slack signature v2 HMAC)
- [ ] Implement backend/integration-service/src/slack/bridge.ts (JWT, rate limit, Redis publish)
- [ ] Harden JWT middleware in bridge.ts with clock skew and issuer/audience checks
- [ ] Add backend/reasoning-gateway/src/jobs/slack-commands.ts to consume reasoning.jobs
- [ ] Configure Cloudflare Tunnel to expose Slack webhook endpoint securely
- [ ] Document cloudflared service mapping, auth, and zero‑trust policies
- [ ] Install and auth Tailscale on Mac; enable SSH and device name
- [ ] Create scripts/mobile/{vmute,vresume,vstatus}.sh and make executable
- [ ] Create scripts/mobile/start-voice-session.sh to start/attach tmux 'voice'
- [ ] Create scripts/watch-session-progress.sh wrapper delegating to voice_orchestrator_watch.sh
- [ ] Start or stub compliance service to green boot; add health check logging
- [ ] Write docs/mobile-control.md (flows, commands table, Tailscale setup, rollback)
- [ ] Run boot and confirm green state: guards, banner, silence, watchdog, compliance