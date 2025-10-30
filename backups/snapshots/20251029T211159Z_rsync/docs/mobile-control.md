# Stable Claude CLI + Mobile Control (Slack Bridge + Tailscale)

## Goals
- Preserve the corrected voice-first behavior (banner + silence checks) without mixing unrelated changes.
- Standardize the Claude CLI installation across Mac and cloud (Node 20/nvm).
- Deliver reliable mobile control: Slack bridge (primary), Tailscale SSH/tmux (backup), optional Replit Doc-only fallback.

## A. Standardize CLI Installs
- macOS: keep only the Homebrew `claude` binary in PATH; remove npm globals; pin interactive shells to Node 20 via nvm.
- Cloud Linux: prefer Homebrew-on-Linux; otherwise NodeSource 20 + npm global—with PATH instructions and secrets via `op run`.
- Preflight (already wired in `START.sh` + `scripts/claude_tier1_boot.sh`): assert PATH, Node, `claude --version`; fail with remediation text.

## B. Mobile Control — Selected Options
### 1. Slack Orchestrator Bridge (primary)
- Slack app (`/agent` slash cmd + Interactivity) → tunnel via Cloudflare (JWT + Slack signature).
- `backend/integration-service/src/slack/bridge.ts`: verify signature, enforce JWT, rate limit, publish to Redis queue `reasoning.jobs`.
- `backend/reasoning-gateway/src/jobs/slack-commands.ts`: consume queue, call allowlisted scripts (`scripts/claude_voice_session.sh` for start/silence/resume/logs/status).

### 2. Tailscale + SSH + tmux (backup)
- Install Tailscale on Mac; use Blink/Termius for iPhone SSH.
- Maintain tmux session `voice` with helpers `scripts/mobile/{vmute,vresume,vstatus}.sh` and bootstrap `scripts/mobile/start-voice-session.sh`.

### 3. Replit Doc Fallback (optional)
- Private Replit mirror branch with text-only CLI mocks; PR back to SoT; never store secrets.

## C. MAX_AUTO: Automatic Voice + 5-Agent Startup
- **Default**: `MAX_AUTO=1` in `START.sh` and `scripts/claude_tier1_boot.sh`
- **What it does**: Auto-launches voice orchestrator + 5 subagents (Planning, Research, Artifact, Execution Monitor, QA) in tmux sessions at boot
- **Toggle**: Set `MAX_AUTO=0` to disable autostart (manual launch required)
- **Health check**: Run `bash scripts/agents/health_probe.sh` to verify all agents + watcher status
- **Tmux sessions**: `liv-voice`, `planning`, `research`, `artifact`, `execmon`, `qa`
- **Status files**: `tmp/agent_status/{voice,planning,research,artifact,exec,qa}.status.json`

## D. Immediate Next Steps (Voice-aware)
- Run `scripts/claude_tier1_boot.sh`; ensure banner/silence checks pass, watchdog/compliance services active.
- Keep Slack/Tailscale work on a dedicated branch.

## D. Verification
- CLI: `which claude && claude --version`, `claude doctor` from TTY.
- Slack: `/agent status` returns PATH/Node/Redis/voice checks.
- Tailscale: `ssh <tailscale-ip> 'tmux ls'` shows `voice`; helper scripts work.
- Voice mode: `tmp/claude_tier1_prompt.txt` starts with banner; logs show no voice errors.

## Deliverables
- Slack bridge (Redis wiring + secure exposure).
- Tailscale SSH/tmux helpers.
- This document as canonical reference.

## Out of Scope
- Full cloud automation; advanced Slack workflows beyond `/agent` MVP.

## To-dos
- Uninstall npm global `@anthropic-ai/claude-code`; reinstall via Homebrew.
- Ensure nvm/Node 20 setup for CLI.
- Implement Slack bridge (signature/JWT + Redis) and consumer.
- Wire Cloudflare tunnel (or Tailscale Funnel).
- Create Tailscale tmux helpers.
- Start watchdog + compliance services.
- Author Slack + Tailscale sections in this doc; include rollback instructions.
- Optional: Replit fallback docs.
