<!-- 964b7ca4-84f9-46d4-902c-492a196e447f 6761fa09-2c55-4a16-8d8b-313cc2977437 -->
# Execute: Commit docs, integrate helpers, push, verify boot

#### 1) Commit remaining untracked files (docs/plans)
- Stage hardening plan and plan files:
  - `.claude/RED_TEAM_HARDENING_PLAN.md`
  - `.claude/PHASE_1_2_HARDENING_COMPLETE.md` (if present)
  - `.cursor/plans/*.plan.md` (auto/*, tier-*.plan.md)
- Commit with a clear message and show status.

Proposed commands:
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
git add .claude/RED_TEAM_HARDENING_PLAN.md .claude/PHASE_1_2_HARDENING_COMPLETE.md 2>/dev/null || true
git add .cursor/plans/*.plan.md 2>/dev/null || true
git commit -m "docs: add red-team hardening plan + execution plans"
git status -s
```

#### 2) Integrate helpers into boot script (Option B completion)
Target: `scripts/claude_tier1_boot.sh`
- Source wait helper and replace fixed sleeps with dynamic wait on port 3005.
- Pipe service logs through scrubber to prevent secrets in logs.
- Keep `ensure_op_session`, Node20 guard, duplicate-spawn guard as-is.

Minimal edits (sketch):
```diff
 # ensure integration-service start
-  sleep 5
+  # wait for port 3005 to accept connections (max 30s, 2s backoff base)
+  source "$ROOT/scripts/guards/wait_for_service.sh"
+  wait_for_service 3005 30 2 || { error "integration-service failed readiness"; exit 1; }
@@
-  nohup op run --env-file="$ROOT/.env" -- npm start >> "$integration_log" 2>&1 &
+  # scrub sensitive tokens from logs while preserving diagnostics
+  nohup op run --env-file="$ROOT/.env" -- npm start 2>&1 | "$ROOT/scripts/guards/scrub_secrets.sh" >> "$integration_log" &
```

If the script uses a different env file, replace `"$ROOT/.env"` with `backend/integration-service/.env.op` per earlier plan.

#### 3) Push branch to remote
- Push `fix/mobile-control-po1` and set upstream if needed.

```bash
git push -u origin fix/mobile-control-po1
```

#### 4) End-to-end boot verification
- Ensure 1Password biometric sign-in occurs automatically.
- Validate API and worker health; assert no secrets in logs.

```bash
# run boot
claude-tier1
# health checks
curl -sf http://localhost:3005/health | jq .
# confirm RPM endpoint
curl -sf http://localhost:3005/api/rpm/weeks/current | jq .
# quick log scan for secrets (heuristic)
grep -E "(key=|token=|authorization:|Bearer )" -ni logs/integration-service.log && echo "SECRET HIT" || echo "No obvious secrets in logs"
```

#### 5) Evidence capture
- Save a short verification note with timestamps and command outputs:
  - `logs/verification_boot_$(date +%Y%m%d_%H%M).txt`

```bash
{
  date; 
  curl -sf http://localhost:3005/health; echo;
  curl -sf http://localhost:3005/api/rpm/weeks/current; echo;
} > logs/verification_boot_$(date +%Y%m%d_%H%M).txt
```

### Acceptance criteria
- Commit created with hardening docs/plans staged.
- Boot script sources `wait_for_service.sh` and pipes through `scrub_secrets.sh`.
- `claude-tier1` completes without manual op signin; port 3005 healthy.
- No obvious secrets in service logs. Upstream push succeeds.


### To-dos

- [ ] Stage and commit red-team plan + plan files
- [ ] Wire wait_for_service.sh and replace fixed sleeps in boot
- [ ] Pipe service logs through scrub_secrets.sh in boot
- [ ] Push fix/mobile-control-po1 to remote origin
- [ ] Run claude-tier1 and validate health + logs
- [ ] Write verification log with timestamps and health outputs