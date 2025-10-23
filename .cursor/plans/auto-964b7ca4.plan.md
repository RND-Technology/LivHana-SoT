<!-- 964b7ca4-84f9-46d4-902c-492a196e447f 15f154a3-a322-47e8-befa-651755c8f70a -->
### Execute: finalize ESLint flat config, integrate boot helpers, commit, push, verify

#### Tasks
1) Finalize ESLint v9 flat config
- Keep eslint.config.js but expect Node ESM warning; OK for now. Optionally rename to eslint.config.mjs in a follow‑up.
- npm install at repo root to sync devDeps.

2) Commit docs/plans
- Stage `.claude/RED_TEAM_HARDENING_PLAN.md`, `.claude/PHASE_1_2_HARDENING_COMPLETE.md` (if present), `.cursor/plans/*.plan.md` and commit.

3) Harden claude-tier1 boot
- Ensure bash invocation (alias uses bash); add zsh‑safe ROOT fallback: `${BASH_SOURCE[0]:-$0}`.
- Strengthen ensure_op_session: set `OP_BIOMETRIC_UNLOCK_ENABLED=1`; after signin require non‑empty `op whoami` or exit 1; allow `OP_ACCOUNT_SLUG` override.
- Source `scripts/guards/wait_for_service.sh`; replace sleeps with `wait_for_service 3005 30 2`.
- Pipe service logs through `scripts/guards/scrub_secrets.sh`.
- Use `backend/integration-service/.env.op` in `op run` for API/worker.

4) Push branch
- Push `fix/mobile-control-po1` to origin.

5) End‑to‑end verification
- Run `claude-tier1`; verify 200 on `/health` and `/api/rpm/weeks/current`.
- Scan `logs/integration-service.log` for secrets: key/token/Bearer.
- Save verification log under `logs/verification_boot_YYYYMMDD_HHMM.txt`.

#### Commands (approval required)
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT && \
npm install --silent && \
git add .claude/RED_TEAM_HARDENING_PLAN.md .claude/PHASE_1_2_HARDENING_COMPLETE.md 2>/dev/null || true && \
git add .cursor/plans/*.plan.md 2>/dev/null || true && \
git commit -m "docs: add red-team hardening plan + execution plans" && \
git push -u origin fix/mobile-control-po1
```

#### Acceptance criteria
- Lint runs with flat config (no aborts); devDeps installed.
- Boot script uses wait_for_service + scrub_secrets; works under zsh via bash wrapper.
- `claude-tier1` completes with non‑empty `op whoami`; port 3005 healthy.
- No obvious secrets in logs; verification log saved; branch pushed.

### To-dos

- [ ] Stage and commit red-team plan + plan files
- [ ] Wire wait_for_service.sh and replace fixed sleeps in boot
- [ ] Pipe service logs through scrub_secrets.sh in boot
- [ ] Push fix/mobile-control-po1 to remote origin
- [ ] Run claude-tier1 and validate health + logs
- [ ] Write verification log with timestamps and health outputs