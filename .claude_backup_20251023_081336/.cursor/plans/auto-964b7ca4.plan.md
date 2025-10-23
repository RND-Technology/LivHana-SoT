<!-- 964b7ca4-84f9-46d4-902c-492a196e447f 8bf17ea8-32d9-467d-a74d-4fecf2f9854a -->
# Tier‑1: Auto 1Password sign‑in + integration‑service autostart (claude‑teir1)

#### Red-team hardening (high risk → fix)
- 1Password session brittleness (v1 vs v2, Desktop off, multiple accounts): detect `op --version`, prefer Desktop biometric; fallback to first `op account list` entry; verify with `op whoami`; surface explicit remediation.
- Node guard fragility: handle missing Node; auto `nvm use` from `.nvmrc`; abort with actionable hint if still wrong.
- Redis/DB readiness: before starting worker/API, assert `redis-cli -h $REDIS_HOST -p $REDIS_PORT PING` and Postgres readiness (TCP or `pg_isready` via `DATABASE_URL`). Fail-fast with guidance.
- Double-spawn risk: use `pgrep -f "ts-node src/(index|worker\.export)\.ts"` to avoid duplicates; optionally `--restart` flag to kill-and-start.
- Health check weakness: validate HTTP 200 and DB reachability (e.g., `/api/rpm/weeks/current`), not just TCP; include retry/backoff with jitter.
- GCS dependency: add `EXPORT_STRATEGY=local` to fully bypass GCS when permissions absent; worker returns local URL; avoid partial upload attempts.
- Logging discipline: ensure `logs/` exists; line-buffered output; basic rotation (truncate >10MB) to avoid runaway.
- Secrets hygiene: assert `.env.op` contains only `op://`; refuse boot if plaintext detected; never echo env.
- Idempotency/exit codes: `set -euo pipefail`; return non‑zero on any failed probe; clear, actionable messages.
- Aliasing typo trap: provide both `claude-tier1` and `claude-teir1` aliases to reduce operator error.

#### Principle of One (minimal files)
- Collapse helpers into a single canonical script: `automation/scripts/claude_tier1.sh` with pure functions:
  - `ensure_op_session`, `require_node20`, `assert_redis_ready`, `assert_db_ready`, `start_worker`, `start_api`, `probe_health`, `truncate_logs`, `prevent_duplicates`.
- Keep only one config file: `backend/integration-service/.env.op` (OP refs only).
- Optional: one LaunchAgent plist (login autostart), else manual alias only.

#### Key edits (illustrative, not executed)
- In `automation/scripts/claude_tier1.sh`:
```bash
# Guard Node
require_node20(){
  if ! command -v node >/dev/null; then echo "Node not found" >&2; exit 1; fi
  local major; major=$(node -v | sed 's/v//;s/\..*//');
  if [[ "$major" -ne 20 ]]; then
    if command -v nvm >/dev/null && [[ -f "$HOME/.nvm/nvm.sh" ]]; then . "$HOME/.nvm/nvm.sh"; fi
    if command -v nvm >/dev/null && [[ -f .nvmrc ]]; then nvm use; major=$(node -v | sed 's/v//;s/\..*//'); fi
    [[ "$major" -ne 20 ]] && { echo "Node 20 required" >&2; exit 1; }
  fi
}
# Prevent duplicates
prevent_duplicates(){ pgrep -f "ts-node src/$1" >/dev/null && { echo "$1 already running"; return 1; } || return 0; }
# Ensure Redis
assert_redis_ready(){ redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" PING | grep -q PONG || { echo "Redis not ready" >&2; exit 1; }; }
# Ensure DB (TCP)
assert_db_ready(){ python3 - <<'PY'
import os,sys,socket,urllib.parse
u=urllib.parse.urlparse(os.getenv('DATABASE_URL',''))
s=socket.socket(); s.settimeout(2)
try:
 s.connect((u.hostname, u.port or 5432)); print('DB TCP OK')
except Exception as e:
 print('DB not ready',e); sys.exit(1)
PY
}
# Health probe (HTTP + DB)
probe_health(){ curl -fsS "http://localhost:${INTEGRATION_SERVICE_PORT:-3005}/health" >/dev/null || return 1; curl -fsS "http://localhost:3005/api/rpm/weeks/current" >/dev/null || return 1; }
```
- Update worker behavior (env‑gated): if `EXPORT_STRATEGY=local`, skip GCS init/upload and return local file path.

#### Tests
- Cold start (signed‑out op), warm start (session active), wrong Node (v24), missing Redis, DB down, port 3005 busy, duplicate boot, GCS disabled, GCS enabled without perms, biometric disabled.

#### Acceptance (updated)
- `claude-tier1` (and `claude-teir1`) yields: 1P signed‑in, Node 20 enforced, Redis/DB ready, API+worker single instances, health 200 + DB reachable, logs sane, non‑zero exit on any failure, secrets never printed.

#### To‑dos (delta)
- [ ] Collapse helpers into `automation/scripts/claude_tier1.sh` (principle of one)
- [ ] Add Redis/DB readiness probes and duplicate‑process guard
- [ ] Add `EXPORT_STRATEGY=local` path in worker (skip GCS)
- [ ] Enforce `.env.op` only op:// entries preflight
- [ ] Provide dual alias: `claude-tier1` and `claude-teir1`
- [ ] Add test matrix to `docs/mobile-control.md`

#### Outcome
Typing `claude-teir1` in any terminal will: 1) ensure an active 1Password CLI session (biometric via Desktop), 2) start integration‑service API and export worker with `op run` (no plaintext secrets), 3) wait for health and fail fast on errors, 4) print a PASS summary. Optional login autostart via LaunchAgent.

#### Files to add/update
- `backend/integration-service/.env.op` (OP refs only; no secrets)
- `automation/scripts/claude_tier1.sh` (boot: ensure op session + start API/worker + health)
- `scripts/ops/ensure_1password.sh` (helper: robust 1P sign‑in; supports OP_ACCOUNT_SLUG/OP_SIGNIN_COMMAND)
- `automation/scripts/check_integration_service.sh` (retrying health probe)
- `~/.zshrc` (function `claude-teir1` → call repo script)
- Optional: `~/Library/LaunchAgents/com.livhana.integration-service.plist` (login autostart)

#### Implementation
- 1Password secret wiring
  - Create `backend/integration-service/.env.op`:
    ```
    DATABASE_URL=op://LivHana/integration-service/DATABASE_URL
    JWT_SECRET=op://LivHana/integration-service/JWT_SECRET
    GCP_PROJECT_ID=reggieanddrodispensary
    GCS_BUCKET=livhana-rpm-exports
    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```
  - Document required 1P item fields (`integration-service`).

- Ensure 1Password session (biometric, no prompts)
  - `scripts/ops/ensure_1password.sh` (core lines):
    ```bash
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v op >/dev/null; then echo "Install 1Password CLI (op)" >&2; exit 1; fi
    if ! op whoami >/dev/null 2>&1; then
      export OP_BIOMETRIC_UNLOCK_ENABLED=1
      if [[ -n "${OP_SIGNIN_COMMAND:-}" ]]; then eval "$OP_SIGNIN_COMMAND"; else op signin --account "${OP_ACCOUNT_SLUG:-reggiedro.1password.com}"; fi
    fi
    op whoami >/dev/null  # verify
    ```

- Boot script (API + worker with op)
  - `automation/scripts/claude_tier1.sh` (essentials):
    ```bash
    #!/usr/bin/env bash
    set -euo pipefail
    ROOT="$(cd "$(dirname "$0")/.." && pwd)"
    bash "$ROOT/scripts/ops/ensure_1password.sh"
    # Node v20 guard (abort if >20)
    [[ "$(node -v | sed 's/v//;s/\..*//')" -gt 20 ]] && { echo "Node >20 not allowed" >&2; exit 1; }
    cd "$ROOT/backend/integration-service" && npm i --silent
    # start worker (bg)
    OP_RUN=(op run --env-file "$ROOT/backend/integration-service/.env.op" --)
    nohup "${OP_RUN[@]}" npx ts-node src/worker.export.ts >> "$ROOT/logs/worker.export.log" 2>&1 &
    # start API (fg by default)
    "${OP_RUN[@]}" npx ts-node src/index.ts & echo $! > "$ROOT/tmp/integration-service.pid"
    cd "$ROOT" && bash automation/scripts/check_integration_service.sh
    ```

- Health probe (retry/backoff)
  - `automation/scripts/check_integration_service.sh`:
    ```bash
    #!/usr/bin/env bash
    set -euo pipefail
    url="http://localhost:${INTEGRATION_SERVICE_PORT:-3005}/health"
    for i in {1..20}; do curl -fsS "$url" && exit 0 || sleep 1; done
    echo "integration-service health failed: $url" >&2; exit 1
    ```

- Shell convenience function
  - Append to `~/.zshrc`:
    ```zsh
    claude-teir1() { /bin/bash "$HOME/LivHana-Trinity-Local/LivHana-SoT/automation/scripts/claude_tier1.sh"; }
    ```

- Optional login autostart
  - `~/Library/LaunchAgents/com.livhana.integration-service.plist` (runs the same script with `KeepAlive`), then `launchctl load ...`.

#### Acceptance criteria
- Running `claude-teir1`:
  - Performs 1P sign‑in via Desktop/Touch ID without password prompts.
  - Starts worker + API under `op run` using `backend/integration-service/.env.op` refs.
  - Health passes within 60s; prints summary and exits 0; fails fast otherwise.
  - No secrets on disk; `.env.op` contains only `op://` references.

#### Notes / guardrails
- Configure account via `OP_ACCOUNT_SLUG` (default `reggiedro.1password.com`) or supply `OP_SIGNIN_COMMAND`.
- Keep Node pinned to v20; abort if higher.
- Voice and reasoning services are out‑of‑scope here; can be added as follow‑up autostart tasks.


### To-dos

- [ ] Create backend/integration-service/.env.op with op:// refs and document fields
- [ ] Add automation/scripts/claude_tier1.sh to sign in and start API/worker
- [ ] Add scripts/ops/ensure_1password.sh helper for biometric sign‑in
- [ ] Add automation/scripts/check_integration_service.sh (retrying health check)
- [ ] Append claude-teir1 function to ~/.zshrc
- [ ] Optionally add LaunchAgent to auto-start at login
- [ ] Run claude-teir1; verify health and logs; capture output
- [ ] Document startup flow and guardrails in docs/rpm/README.md