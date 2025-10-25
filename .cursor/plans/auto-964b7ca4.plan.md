<!-- 964b7ca4-84f9-46d4-902c-492a196e447f b64246f5-46f5-4b84-b90e-d9a1274c46f2 -->
# Tier-1 Zero-Warning Boot: Action Plan

#### 1) Voice session: always-on, attachable
- Fix `scripts/claude_voice_session.sh` to create tmux session `liv-voice` and keep it alive by tailing a log (prevents auto-exit). Ensure idempotency (no duplicate sessions).
- Add auto-respawn helper: if `liv-voice` missing at boot end, spawn and log the attach hint.
- Update boot to print the exact attach command only once.

#### 2) Agent health: remove validator warnings
- Add seeded keys `started_at` and `finished_at` to status JSON in `scripts/start_*agent.sh` and in boot-time seeds within `scripts/claude_tier1_boot.sh` so `[PO1][STATUS] ... missing keys` disappears.
- Keep atomic writes via `scripts/guards/atomic_write.sh`.

#### 3) Integration-service: start + health without perl errors
- Replace perl-based redactor with portable sed in `scripts/guards/scrub_secrets.sh` (BSD/macOS-safe) and in the boot’s process-substitution pipeline. Tested patterns:
```bash
sed -E \
  -e 's/(Authorization[[:space:]]*:[[:space:]]*Bearer[[:space:]]*)[^[:space:]]+/\1***REDACTED***/Ig' \
  -e 's/([?&](api[_-]?key|access_token|token|refresh_token|secret|password|pass)=)[^&#[:space:]]+/\1***REDACTED***/Ig' \
  -e 's/((^|[[:space:]])(API[_-]?KEY|KEY|TOKEN|ACCESS_TOKEN|REFRESH_TOKEN|SECRET|CLIENT_SECRET|PASSWORD|PASS)[[:space:]]*[=:][[:space:]]*)"[^"]*"/\1"***REDACTED***"/Ig' \
  -e 's/((^|[[:space:]])(API[_-]?KEY|KEY|TOKEN|ACCESS_TOKEN|REFRESH_TOKEN|SECRET|CLIENT_SECRET|PASSWORD|PASS)[[:space:]]*[=:][[:space:]]*)[^[:space:]"\']+/\1***REDACTED***/Ig'
```
- In `scripts/claude_tier1_boot.sh` integration block, keep `wait_for_service 3005 30 2`; on failure, print a single actionable error with the log path.

#### 4) Degraded-mode warnings → silent greens
- Add env gates in boot to silence optional checks:
  - `ALLOW_TEXT_ONLY=1` → skip Claude model check silently.
  - `SUPPRESS_OPTIONAL_WARNINGS=1` → convert non-critical env/service notices (DEEPSEEK, PERPLEXITY, compliance svc) to INFO.
  - Memory notice: lower threshold or hide with `SUPPRESS_OPTIONAL_WARNINGS=1`.
- Ensure pre-boot port scan prints only when action is needed; remove duplicate "port cleared" logs.

#### 5) Port 3005: conflict-free logic
- Collapse duplicate pre-scan and pre-clear messages; do one scan and one cleanup path. If a node is already healthy on 3005, skip start; otherwise, terminate, then start and health-check.

#### 6) CI preflight (keeps it green)
- Add a GitHub Action job to run: `claude-tier1` in text-only mode, verify 5/5 agents, `curl :3005/health`, and run the secret-log scanner. Fail PR on any red/yellow.

#### 7) Operator ergonomics
- Add `bin/liv-attach` helper that checks existence of `liv-voice` and re-spawns if missing, then attaches.
- Update `README` quick-start: `ALLOW_TEXT_ONLY=1 claude-tier1 && bin/liv-attach`.

### Targeted Edits
- `scripts/claude_voice_session.sh`: ensure tmux session `liv-voice`, keep-alive tail, idempotent spawn.
- `scripts/start_planning_agent.sh`, `start_research_agent.sh`, `start_artifact_agent.sh`, `start_execution_monitor.sh`, `start_qa_agent.sh`: include `started_at`/`finished_at` in JSON.
- `scripts/claude_tier1_boot.sh`: seed full-schema JSON; swap perl redactor usage for sed; de-duplicate port logs; add suppression gates; ensure single attach hint.
- `scripts/guards/scrub_secrets.sh`: replace perl with sed-only implementation.
- `.github/workflows/boot-preflight.yml`: add zero-warning gates and health checks.

### Acceptance Criteria
- `ALLOW_TEXT_ONLY=1 claude-tier1` yields no warnings; all greens; 5/5 agents healthy; integration-service 200/health; logs clean (scanner returns CLEAN); tmux `liv-voice` attachable.
- CI preflight passes on PRs; failures block merges.

### Rollback
- Revert the sed redactor and boot edits; keep atomic writes intact.

### To-dos

- [ ] Make liv-voice tmux session idempotent and keep-alive in claude_voice_session.sh
- [ ] Add started_at/finished_at to all agent status writes and seeds
- [ ] Replace perl redactor with BSD sed in scrub_secrets.sh and boot pipeline
- [ ] Add ALLOW_TEXT_ONLY and SUPPRESS_OPTIONAL_WARNINGS handling; silence optional checks
- [ ] Unify 3005 pre-scan/cleanup; only log once; strict health flow
- [ ] Add GitHub Action to enforce zero-warning boot, health, and log-scan
- [ ] Add bin/liv-attach helper to respawn/attach voice session