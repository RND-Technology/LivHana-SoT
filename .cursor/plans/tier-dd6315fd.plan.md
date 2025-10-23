<!-- dd6315fd-e9db-4281-bc27-6509e33c3a8d affbc3f3-41c9-49b9-8a3b-00c32b7fd7ea -->
# Final Boot Fixes - Required Changes

## Required Fixes (7 Total)

### Fix 1: Shell/Alias - Call via bash, not zsh
**File**: `~/.zshrc` (line ~45)

**Current**:
```bash
claude-tier1() {
  cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
  bash scripts/claude_tier1_boot.sh
}
```

**Required**:
```bash
alias claude-tier1='bash /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh'
```

**Why**: Eliminates function overhead, ensures bash execution

---

### Fix 2: 1Password - Hard-fail unless whoami non-empty
**File**: `scripts/claude_tier1_boot.sh` (ensure_op_session function)

**Current** (line ~60):
```bash
if op whoami >/dev/null 2>&1; then
  success "1Password authenticated: $(op whoami)"  # ← May be empty!
```

**Required**:
```bash
export OP_BIOMETRIC_UNLOCK_ENABLED=1
WHOAMI=$(op whoami 2>/dev/null || true)
if [[ -n "$WHOAMI" ]]; then
  success "1Password authenticated: $WHOAMI"
else
  error "1Password whoami returned empty - Desktop integration issue"
  error "Fix: Open 1Password → Settings → Developer → Enable CLI integration"
  exit 1
fi
```

---

### Fix 3: Bash Shebang - Fix BASH_SOURCE error
**File**: `scripts/claude_tier1_boot.sh` (line 1)

**Current**:
```bash
#!/usr/bin/env bash
```
(May be missing or wrong)

**Required**:
```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
```

**Why**: `${BASH_SOURCE[0]:-$0}` works in both bash and zsh

---

### Fix 4: Compose - Remove duplicate service or change port
**File**: `docker-compose.yml`

**Issue**: Two services both mapping to port 3005  
**Required**: Keep ONE service on 3005, change other to 3006 or remove

---

### Fix 5: PID Capture - Fix process substitution
**File**: `scripts/claude_tier1_boot.sh` (service startup)

**Current**:
```bash
npm start 2>&1 | scrub_secrets.sh >> "$log" &
INTEGRATION_PID=$!  # ← This is the pipe PID, not Node!
```

**Required** (Option A - No PID):
```bash
npm start 2>&1 | scrub_secrets.sh >> "$log" &
# Manage via port instead of PID
```

**Required** (Option B - Fix PID):
```bash
npm start >> "$log" 2>&1 &  # No pipe
INTEGRATION_PID=$!
```

---

### Fix 6: Env File - Use scoped .env.op
**File**: `backend/integration-service/.env.op` (create if missing)

**Required**:
```bash
# .env.op (no secrets, only op:// references)
DATABASE_URL=op://LivHana-Ops-Keys/ALLOYDB_URL/credential
LIGHTSPEED_TOKEN=op://LivHana-Ops-Keys/LIGHTSPEED_TOKEN/credential
GCP_PROJECT_ID=reggieanddrodispensary
GCS_BUCKET=livhana-rpm-exports
REDIS_HOST=localhost
REDIS_PORT=6379
```

**In boot script**:
```bash
cd "$ROOT/backend/integration-service"
op run --env-file=.env.op -- npm start >> "$log" 2>&1 &
```

---

### Fix 7: Git - Handle OPTION_B_EXECUTION_COMPLETE.md
**File**: `.claude/OPTION_B_EXECUTION_COMPLETE.md`

**Required**: Either:
- Add to git if it has value
- Delete if redundant (prefer RAW_FILE_AUDIT_COMPLETE.md)

---

## Verification Commands (After Fixes)

### 1. Test Boot
```bash
bash /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh
```

**Expected**:
- No "BASH_SOURCE: parameter not set"
- "1Password authenticated: reggiedro" (non-empty)
- Boot completes successfully

### 2. Test Health
```bash
curl -sf http://localhost:3005/health
```

**Expected**: `200 OK` with JSON response

### 3. Check Log Security
```bash
grep -Ei '(key=|token=|authorization:|Bearer )' /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/logs/integration-service.log
```

**Expected**: Empty (no secrets leaked)

### 4. Git Status
```bash
git -C /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT status -s
```

**Expected**: Clean or only expected changes

---

## Acceptance Criteria

- [ ] Boot via bash (not zsh) - no BASH_SOURCE error
- [ ] 1Password whoami non-empty or hard-fail
- [ ] No port conflicts (3005 used once)
- [ ] PID capture works or managed via port
- [ ] Scoped .env.op used for secrets
- [ ] No secrets in logs (grep returns empty)
- [ ] Git status clean

---

## Implementation Order

1. Fix ~/.zshrc alias (bash invocation)
2. Fix scripts/claude_tier1_boot.sh (BASH_SOURCE + whoami validation)
3. Create backend/integration-service/.env.op
4. Fix docker-compose.yml (port conflict)
5. Test full boot
6. Verify security (no secrets in logs)
7. Commit + push

**Estimated time**: 30 minutes

---

**Ready to execute? Say "EXECUTE FINAL FIXES" and I'll apply all 7 changes immediately.** 🚀


### To-dos

- [ ] Update ~/.zshrc claude-tier1 to use bash invocation
- [ ] Fix BASH_SOURCE[0] zsh compatibility in boot script
- [ ] Hard-fail if op whoami returns empty
- [ ] Create backend/integration-service/.env.op with scoped secrets
- [ ] Remove duplicate 3005 port mapping in docker-compose.yml
- [ ] Run full boot test and verify no errors
- [ ] Grep logs for secrets (should be empty)
- [ ] Final commit and push to remote