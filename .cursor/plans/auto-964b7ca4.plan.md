<!-- 964b7ca4-84f9-46d4-902c-492a196e447f c005843a-a5b5-4429-9dfc-4db6cb479728 -->
### Why this is happening
- 1Password “empty whoami”: CLI session isn’t scoped with `--account` each call; different shells clear the session. When `whoami` prints empty, your boot now hard‑fails by design.
- Agent startup “Usage: scripts/claude_tier1_boot.sh <target_path>”: one of the agent scripts (or a health helper) is invoking `scripts/claude_tier1_boot.sh` as if it requires an argument. That prints the usage banner and aborts the spawn path.
- planning.status.json invalid JSON: partial file writes during warmup (race). A zero‑byte or truncated write is being read before completion.
- `ash -lc ...`: a mistyped shell command; `ash` doesn’t exist on macOS, so that one‑shot failed mid‑sequence.
- Degraded model warnings (DeepSeek/Perplexity/Claude Sonnet): expected; not boot blockers when `ALLOW_TEXT_ONLY=1` is set.

### Targeted fixes (edits)
1) Scope 1Password in every call
- In `scripts/claude_tier1_boot.sh` ensure all checks use the account flag:
```bash
op --account "$OP_ACCOUNT_SLUG" whoami >/dev/null 2>&1 || \
  OP_BIOMETRIC_UNLOCK_ENABLED=1 op signin --account "$OP_ACCOUNT_SLUG" --force
```
- Use the same `--account` in all `op run` and preflights.

2) Remove accidental recursion/usage from agent path
- Search for any call to `scripts/claude_tier1_boot.sh` inside:
  - `scripts/start_planning_agent.sh`
  - `scripts/start_research_agent.sh`
  - `scripts/start_artifact_agent.sh`
  - `scripts/start_execution_monitor.sh`
  - `scripts/start_qa_agent.sh`
  - `scripts/agents/health_probe.sh`, `scripts/guards/validate_agent_started.sh`
- Delete any line that shells back into `claude_tier1_boot.sh` or expects `<target_path>`.
- Ensure each agent script only:
```bash
SESSION="<name>"; tmux has-session -t "$SESSION" || tmux new -d -s "$SESSION" -n console "bash -lc 'tail -f $LOG_FILE'"
```

3) Make agent status writes atomic and valid JSON
- Create `scripts/guards/atomic_write.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
atomic_write(){ local f="$1"; shift; local d; d="$(dirname "$f")"; mkdir -p "$d"; local t; t="${f}.tmp.$$"; printf "%s" "$*" > "$t" && mv -f "$t" "$f"; }
if [[ "${BASH_SOURCE[0]:-$0}" == "$0" ]]; then atomic_write "$@"; fi
```
- In all `start_*.sh` and in `claude_tier1_boot.sh` seeding blocks, replace `printf > file` with:
```bash
source "$ROOT/scripts/guards/atomic_write.sh"; atomic_write "$STATUS_FILE" "{\"agent\":\"$AGENT\",\"status\":\"running\",\"phase\":\"startup\",\"updated_at\":\"$(date -u +%FT%TZ)\"}\n"
```

4) Exec monitor name consistency
- In `scripts/claude_tier1_boot.sh` and `scripts/guards/validate_agent_started.sh` use `execmon` consistently.

5) Secret scrubbing portability
- Keep process substitution but call the absolute scrubber path to avoid subshell env differences:
```bash
op run --env-file "$ENV_FILE" -- npm start \
  > >( "$ROOT/scripts/guards/scrub_secrets.sh" >> "$log" ) \
  2> >( "$ROOT/scripts/guards/scrub_secrets.sh" >> "$log" ) &
```
- Ensure `scrub_secrets.sh` uses perl (portable on macOS):
```bash
perl -pe 's/((?:key|token|secret)\s*[:=]\s*)\S+/${1}***REDACTED***/ig'
```

6) Harden preflight and boot one‑shot
- Ensure alias is bash, set `setopt interactivecomments` once in ~/.zshrc, gate models via `ALLOW_TEXT_ONLY=1`, and pre‑clear 3005 before boot. Keep the working one‑shot you already ran.

### Validation
- Boot: `claude-tier1` → green, no empty whoami, port 3005 healthy, no secrets in logs.
- Agents: `tmux ls` shows 6 sessions (voice + 5 agents). `scripts/agents/health_probe.sh` returns all PASS.
- Retry: run the one‑shot twice in a row; idempotent and still green.

### Follow‑ups (optional)
- Add `docker-compose.override.yml` healthcheck for `integration-service`.
- Add CI preflight workflow as previously drafted to block regressions.


### To-dos

- [ ] Scope 1Password in all op calls with --account
- [ ] Remove any agent script lines invoking claude_tier1_boot.sh
- [ ] Add atomic_write.sh and switch all status writes to atomic
- [ ] Validate exec monitor name is execmon everywhere
- [ ] Switch scrub_secrets.sh to perl-based scrubbing
- [ ] Enforce alias/bash, set interactivecomments, pre-clear 3005 and verify health