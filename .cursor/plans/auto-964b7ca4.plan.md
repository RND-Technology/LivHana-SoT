<!-- 964b7ca4-84f9-46d4-902c-492a196e447f 9071c874-7008-40bb-ab1d-d63cc7020598 -->
# Tier-1 Zero-Warning Boot — Community‑Verified Method (Updated)

#### Status (confirmed)
- 5/5 agents healthy; voice operational; integration-service health OK in latest runs; logs CLEAN by strict scanner
- Text-only gate active (no model warning): `ALLOW_TEXT_ONLY=1`
- Optional checks demoted via `SUPPRESS_OPTIONAL_WARNINGS=1`

#### What’s already done (accepted)
- Agent scripts: atomic_write via bash; full schema JSON present
- Scrubber: perl → BSD sed chain (community-safe)
- Preflight: env gates added; log scan integrated
- Voice: tmux keep-alive session + `bin/liv-attach` helper
- Boot: GSM secret load includes `LIGHTSPEED_TOKEN`

#### Remaining (community‑verified)
1) Clean backups
- Remove `scripts/claude_tier1_boot.sh.backup_*`

2) One-shot validation (zero-warning run)
- Kill stray services: `pkill -f lightspeed-bigquery; tmux kill-server`
- Run: `ALLOW_TEXT_ONLY=1 SUPPRESS_OPTIONAL_WARNINGS=1 claude-tier1`
- Verify: 5/5 agents, integration `/health`, `liv-voice` exists

3) Health verification (portable)
- Agents: tmux sessions + JSON status (`jq -e '.status=="running" or .status=="active"'`)
- Integration: portable wait loop (no `timeout`): `for s in 1 2 3 5 8; do curl -sf localhost:3005/health && break || sleep $s; done`
- Log scan: `rg` if present, else grep patterns; treat `***REDACTED***|<concealed by 1Password>` as safe

4) Tests
- `npm test` (headless; CI-safe)

5) Commit & tag
- Commit stabilization, tag `tier1-zero-warning-YYYYMMDD`, push branch + tags

#### Community patterns to bake in

- Cloud Run hardening (for services we deploy there)
  - Health checks: configure startup and liveness probes to hit `/health` (200 JSON) and `/live` (lightweight)
  - Secrets: use Secret Manager with `--set-secrets KEY=secret:version` or mounted volumes; avoid 1Password in Cloud Run
  - Runtime: set `--min-instances=1` (avoid cold starts), right-size `--concurrency` per handler, and enable graceful `SIGTERM` shutdown
  - Identity/IAM: use dedicated service account with least-privilege (Secret Manager Accessor, Logs Writer)
  - Logging: emit structured JSON (severity/message), add Logs Router exclusion for Authorization header if any reverse-proxy logs include it
  - Rollouts: traffic-split new revisions, canary 5–10%, auto-roll back on health failures
  - Networking: if AlloyDB/private services needed, use Serverless VPC Connector; prefer AlloyDB connector lib for IAM auth

- Voice always-on: tmux remain-on-exit + tail -F; optional LaunchAgent `com.livhana.liv-voice.plist`
- Integration PID mgmt: prefer health/port over PID files; if needed, capture child PID via `pgrep -P`
- Dependency waits: Postgres (`pg_isready` or TCP), Redis (`redis-cli ping`/`nc -z`), gated by `STRICT_DEPS=1`
- Single-pass 3005 logic: one scan → healthy? skip; else terminate & start → backoff wait → single error with log path
- CI job: run boot in text-only; assert 5/5 agents; curl health; log-scan; upload logs on failure

#### Portability notes (macOS)
- `timeout` may be missing; use backoff loops or `gtimeout` (coreutils) when available
- Ensure `jq` and `rg` installed; otherwise fall back to `grep` + awk/jsonlite

#### Acceptance criteria
- `ALLOW_TEXT_ONLY=1 SUPPRESS_OPTIONAL_WARNINGS=1 claude-tier1` → no warnings; 5/5 agents OK; `/health` 200; logs CLEAN; `bin/liv-attach` always works
- CI preflight passes; warnings/errors block merges

### To-dos

- [ ] Make liv-voice tmux session idempotent and keep-alive in claude_voice_session.sh
- [ ] Add started_at/finished_at to all agent status writes and seeds
- [ ] Replace perl redactor with BSD sed in scrub_secrets.sh and boot pipeline
- [ ] Add ALLOW_TEXT_ONLY and SUPPRESS_OPTIONAL_WARNINGS handling; silence optional checks
- [ ] Unify 3005 pre-scan/cleanup; only log once; strict health flow
- [ ] Add GitHub Action to enforce zero-warning boot, health, and log-scan
- [ ] Add bin/liv-attach helper to respawn/attach voice session