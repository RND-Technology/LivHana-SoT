<!-- 2e23da7e-354a-4aca-afe1-f611ee49ab99 968c9a04-15ad-45e7-952f-97d33f15b41d -->
# Execute Option B: Quick Integration to All-Green Boot

## Overview
Implement the smallest set of changes to eliminate remaining high-risk items and stabilize claude-tier1: integrate the staged guards, add a deterministic healthcheck, and address top TypeScript dependency gaps. No nonessential refactors.

## Changes (edits are minimal and focused)
- scripts/claude_tier1_boot.sh
  - Source `scripts/guards/wait_for_service.sh`; replace hardcoded `sleep 5` with `wait_for_service 3005 30 2`.
  - Pipe service logs through `scripts/guards/scrub_secrets.sh` (no secrets in logs).
  - Fail fast if health probe fails after wait.
- docker-compose.yml
  - Ensure `integration-service` has a healthcheck using `curl -fsS http://localhost:${INTEGRATION_SERVICE_PORT:-3005}/health` with retries/start_period.
- backend/integration-service/package.json
  - Add missing runtime deps: jsonwebtoken, pg, bullmq, puppeteer, @google-cloud/storage, ioredis, csv-stringify.
  - Add dev types as needed: @types/jsonwebtoken, @types/node.
- tests (lightspeed-bigquery)
  - Adjust test type assertions/imports to resolve TS parse/type errors (no logic changes).
- .markdownlintignore (root)
  - Exclude tmp/**, out/**, out_mirror/**, backups/**, logs/**, legacy/** to reduce noise in Problems.

## Acceptance criteria
- `claude-tier1`:
  - 1Password Desktop biometric sign-in works without prompts.
  - integration-service starts with secrets; health=healthy within 30s.
  - No secrets appear in logs; boot exits nonzero on failure paths.
- Problems tab:
  - Missing-module TS errors for integration-service resolved.
  - Test parsing/type errors reduced; no new lints introduced.

## Rollback
- Revert `scripts/claude_tier1_boot.sh`, `docker-compose.yml`, and any package.json changes.
- Remove `.markdownlintignore` if undesired.

## Estimated effort
~30–45 minutes.

## What I need to proceed
- Confirmation to implement Option B now. After that, we can schedule full Option A hardening if desired.

### To-dos

- [ ] Replace sleeps with wait_for_service in claude_tier1_boot.sh
- [ ] Pipe logs through scrub_secrets.sh and fail fast on health
- [ ] Add integration-service healthcheck to docker-compose.yml
- [ ] Install missing runtime/dev TypeScript deps in integration-service
- [ ] Fix minimal TS test assertions/imports (no logic changes)
- [ ] Add .markdownlintignore for tmp/out/backups/logs/legacy noise