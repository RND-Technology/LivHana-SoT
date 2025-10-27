<!-- 964b7ca4-84f9-46d4-902c-492a196e447f a15c130b-7faf-4d07-b2a9-65ab0d2f6e0a -->
# Tier‑1 Fusion Blueprint (Voice‑First + OAuth + Unblockable Boot)

### Goal
- Voice mode always starts first (STT/TTS healthy) with zero blocking warnings
- 5/5 agents up; ExecMon aligned and present
- Lightspeed uses OAuth (R-Series and X-Series) with auto refresh
- Integrations never block core; background retries + watchdogs
- CI gate to prevent regressions; logs scrubbed; docs updated

### What already works (baseline)
```23:28:/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_voice_session.sh
  tmux new-session -d -s "liv-voice" -n voice "bash -c '
    echo "[...Z] Liv Hana voice session initialized" | tee -a \"$LOG_FILE\"
    tail -F \"$LOG_FILE\"
  '"
```
```244:281:/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh
check_voice_connectivity() { ... # checks STT:2022 and TTS:8880 }
```
```1141:1149:/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh
banner "MAX_AUTO: VOICE + SUBAGENTS AUTOSTART"
info "Starting voice orchestrator session..."
if bash "$ROOT/scripts/claude_voice_session.sh" >> "$LOG" 2>&1; then
  success "Voice session started"
fi
```
```1196:1206:/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh
if ! check_agent_health "execmon"; then
  bash "$ROOT/scripts/start_execution_monitor.sh" >> "$LOG" 2>&1 &
  info "Starting execution monitor (PID: $!)"
  printf '{ "agent": "execmon", ... }' | bash "$ROOT/scripts/guards/atomic_write.sh" "$ROOT/tmp/agent_status/execmon.status.json"
fi
```

### Changes to implement
1) Voice-first guaranteed start (LaunchAgents + STRICT_VOICE + watchdog)
- Add LaunchAgents plists to auto-start and keep alive:
  - ~/Library/LaunchAgents/com.livhana.whisper.plist → port 2022
  - ~/Library/LaunchAgents/com.livhana.kokoro.plist → port 8880
  - KeepAlive true; ProgramArguments to your local start commands; StandardOutPath/Err; ThrottleInterval
- In `scripts/claude_tier1_boot.sh`: add `STRICT_VOICE=1` support:
  - Before "STEP 2: VOICE MODE PREPARATION", if STT/TTS not healthy, run `launchctl bootstrap gui/$UID ...` for both plists then `wait_for_service 2022/8880` and hard-fail only if STRICT_VOICE=1 and still down
  - Else continue in text-only with `ALLOW_TEXT_ONLY=1` (non-fatal) when STRICT_VOICE=0
- Add `scripts/watchdogs/voice_watchdog.sh` to restart STT/TTS via launchctl when health check fails; start it non-blocking from boot

2) Decouple integrations from core boot
- In `claude_tier1_boot.sh` MAX_AUTO block, ensure integration-service start is strictly non-blocking:
  - If port busy or health not up in 30s, log WARN and proceed; never block voice or subagents
  - Gate with `INTEGRATION_BLOCKING=0` default; `1` only in CI smoke
- Keep secret scrubbing enabled for logs (current sed-based patterns)

3) Lightspeed OAuth (R-Series and X-Series support)
- Add `backend/integration-service/src/auth/lightspeedOAuth.ts`:
  - Config flag `LIGHTSPEED_SERIES` ∈ {R, X}; select endpoints: R=`api.lightspeedapp.com/api/v3`, X=`api.vendhq.com` (X‑Series)
  - Implement Authorization Code + Refresh; persist refresh_token; auto-refresh access_token; 401 triggers refresh
- Add routes in `server.ts`:
  - `GET /oauth/lightspeed/start` → redirect
  - `GET /oauth/lightspeed/callback` → exchange, store refresh, rotate access
  - `POST /oauth/lightspeed/refresh` → manual refresh (admin)
- Secrets
  - Store `LIGHTSPEED_CLIENT_ID`, `LIGHTSPEED_CLIENT_SECRET`, `LIGHTSPEED_REDIRECT_URI` in 1Password (use item IDs in `.env.op`)
  - Store `LIGHTSPEED_REFRESH_TOKEN` in GSM for Cloud Run; local via 1Password
- Update `package.json` start to point to built file (e.g., `dist/src/server.js`) and bind to `0.0.0.0:${PORT:-3005}`

4) ExecMon current state and hardening
- Verify ExecMon is present and aligned (tmux session `execmon`, status `tmp/agent_status/execmon.status.json`, start script `scripts/start_execution_monitor.sh`); only create if missing
- Add heartbeat: write `updated_at` every 60s to status via `atomic_write.sh`
- Ensure log rotation and secret scrub on `logs/agents/execmon.log`
- Decouple from integration-service; start regardless of 3005 health
- Watchdog: if tmux session absent, auto-respawn and re-seed status

5) BigQuery credentials hardening
- Validate JSON before boot starts; fail with actionable hint if invalid
- Cloud Run: mount GSM service account via secret; local: `backend/integration-service/.bigquery-key.json` path already honored

6) CI gate: Zero‑warning voice boot + OAuth smoke
- Add `.github/workflows/tier1-boot.yml`:
  - Checkout; Node 20; install; start mock STT/TTS (or skip with ALLOW_TEXT_ONLY); run `bin/claude-tier1-verify.sh`
  - Verify 5 agents, voice health (or mocked), and non-blocking integration-service
  - Secret scan (no plaintext tokens) and redact log artifact on failure

7) Documentation & guardrails
- Update ADR/PRD: voice-first precedence, OAuth selection matrix (R vs X), fallback modes, watchdog behavior
- Update `.env.op` examples to use 1Password item IDs to avoid ambiguous names
- Add CHANGELOG entry and runbook for LaunchAgents install/uninstall

8) Claude CLI raw‑mode safe launch (fix Ink error from logs)
- The auto-launch at boot end throws "Raw mode is not supported" in non‑TTY shells.
- Guard auto-launch behind interactivity checks (test -t 0 && test -t 1) and/or an env flag (e.g., `CLAUDE_AUTO_LAUNCH=0`).
- If non‑interactive, print the pbcopy instructions only; skip launch. See Ink isRawModeSupported guidance.

9) timeout portability on macOS
- Replace GNU `timeout` with a bash retry loop or detect `gtimeout` from coreutils.
- Add a helper `retry_with_backoff` and use it wherever `timeout` was used in boot.

10) Memory detector consistency
- Unify on `memory_pressure` for macOS; vm_stat fallback only when unavailable.
- Remove conflicting “~0GB free” warning when memory_pressure reports healthy.

### Fallacy‑purged Do‑Now Runbook

1) Voice services always-on (LaunchAgents, absolute paths)
- Create logs dir: `mkdir -p /Users/jesseniesen/Library/Logs`
- Install plists with absolute paths and full ProgramArguments, no `$(whoami)`; ensure PATH or full binary paths.
- Reload safely:
```bash
launchctl bootout "gui/$(id -u)" com.livhana.whisper 2>/dev/null || true
launchctl bootout "gui/$(id -u)" com.livhana.kokoro 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.livhana.whisper.plist
launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.livhana.kokoro.plist
sleep 2 && curl -sf http://localhost:2022/health && curl -sf http://localhost:8880/health
```

2) Strict voice gate and raw‑mode guard
- Use inline env (not persistent): `STRICT_VOICE=1 claude-tier1`
- Prevent Ink error in non‑TTY: `export CLAUDE_AUTO_LAUNCH=0` before running boot (until code gate is added).

3) Timeout portability
- Prefer `scripts/guards/wait_for_service.sh`; if needed, `brew install coreutils` and use `gtimeout` (never `timeout`).

4) ExecMon verification and hardening (no stubs)
- Verify: tmux session `execmon`; status `tmp/agent_status/execmon.status.json`; script `scripts/start_execution_monitor.sh` exists and starts the real monitor before tailing logs.
- Heartbeat: cron/loop writes `updated_at` via `atomic_write.sh` every 60s.
- Watchdog: if tmux session missing, auto‑respawn and re‑seed status.

5) Integration non‑blocking
- Ensure `INTEGRATION_BLOCKING=0` (default) so port 3005 or health failures don’t block voice/agents.

6) Lightspeed OAuth (R vs X)
- Decide series (R: api.lightspeedapp.com/API/v3; X: api.vendhq.com).
- Create OAuth app; store `CLIENT_ID/SECRET/REDIRECT_URI` in 1Password by item ID in `.env.op`; store `REFRESH_TOKEN` in GSM.
- Implement/confirm refresh on 401; no bearer tokens by hand.

7) BigQuery key sanity
- Minimal: `jq -e 'type=="object"' backend/integration-service/.bigquery-key.json >/dev/null`
- Stronger: validate required fields via jsonschema or perform an ADC access-token check.

8) CI guardrails
- In workflow, set `ALLOW_TEXT_ONLY=1` and skip auto‑launch; verify 5/5 agents via tmux + fresh status JSONs; redact logs and enforce secret scan.

### Acceptance criteria
- `claude-tier1` yields 0 blocking errors; voice-first greeting plays (when STT/TTS healthy)
- 5/5 agents healthy; `tmux ls` ≥ 5; `tmp/agent_status/*.json` valid and recent
- OAuth flow completes; access tokens refreshed transparently; no repeated 401s
- Integration failures never block voice or agents; watchdogs self-heal STT/TTS
- No Ink raw‑mode error on non‑interactive shells (auto‑launch skipped gracefully)
- No reliance on GNU `timeout`; scripts work on macOS without coreutils
- CI workflow passes on PR/merge; logs scrub sensitive values

### Minimal run sequence (unchanged behavior, for manual test)
```bash
curl -sf http://localhost:2022/health && curl -sf http://localhost:8880/health \
  && bash /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_voice_session.sh start \
  && ALLOW_TEXT_ONLY=1 SUPPRESS_OPTIONAL_WARNINGS=1 claude-tier1 \
  && /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/bin/liv-attach
```

### Implementation todos
- launchagents-voice: Create Whisper/Kokoro LaunchAgents and load on login
- voice-watchdog: Add watchdog to monitor 2022/8880 and restart via launchctl
- strict-voice-gate: Add STRICT_VOICE logic + wait_for_service to boot
- execmon-script: Create `scripts/start_execution_monitor.sh` with atomic status
- oauth-lightspeed: Implement dual R/X OAuth + routes and auto-refresh
- pkg-start-fix: Fix `backend/integration-service` start target and bind 0.0.0.0:PORT
- bq-cred-validate: Validate BigQuery JSON and wire GSM for Cloud Run
- ci-voice-boot: Add GitHub Action to verify boot and scrub logs
- docs-adr: Update ADR/PRD + runbook + .env.op examples (IDs, not names)
- ink-rawmode-guard: Guard Claude auto-launch; skip when non‑interactive
- timeout-guard: Remove/guard `timeout` usage; add retry helper
- mem-detector-fix: Make memory warnings consistent with memory_pressure readings


### To-dos

- [ ] Create Whisper/Kokoro LaunchAgents and load on login
- [ ] Add watchdog to monitor 2022/8880 and restart via launchctl
- [ ] Add STRICT_VOICE logic + wait_for_service to boot script
- [ ] Verify ExecMon script/session/status naming alignment (create only if missing)
- [ ] Add periodic heartbeat updated_at write (60s) for ExecMon status
- [ ] Rotate and scrub logs/agents/execmon.log for secrets
- [ ] Auto-respawn ExecMon if tmux session absent; re-seed status
- [ ] Implement dual R/X OAuth with routes and auto-refresh
- [ ] Fix integration-service start target and bind 0.0.0.0:PORT
- [ ] Validate BigQuery JSON and wire GSM for Cloud Run
- [ ] Add GitHub Action to verify boot and scrub logs
- [ ] Update ADR/PRD and .env.op examples using 1Password item IDs
- [ ] Guard Claude auto-launch; skip when non‑interactive
- [ ] Replace GNU timeout with retry helper / gtimeout detection
- [ ] Fix memory detector to avoid false low-memory warnings