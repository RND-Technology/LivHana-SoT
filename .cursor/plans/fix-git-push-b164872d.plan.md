<!-- b164872d-ebdf-4e8c-a20a-00f516f923f4 d80ef04b-0651-4a25-985e-3bdec7e188a7 -->
# PO1 Perfect Code - 5 Critical Fixes

## Fixes Required

### 1. Shell/Alias - Bash Invocation
**Issue**: `claude-tier1` runs via zsh causing `BASH_SOURCE[0]: parameter not set`
**Fix**: Update alias to explicitly use bash
```bash
# In ~/.zshrc, change to:
alias claude-tier1='bash /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh'
```
**File**: User's `~/.zshrc` (manual or scripted update)

### 2. 1Password Hard-Fail Validation
**Issue**: Empty `op whoami` response shows "authenticated: " with no account
**Fix**: `scripts/claude_tier1_boot.sh` - ensure_op_session function

Changes needed:
- Set `OP_BIOMETRIC_UNLOCK_ENABLED=1` before signin
- After signin, validate `op whoami` is non-empty
- Exit 1 if empty response
- Allow `OP_ACCOUNT_SLUG` env override

```bash
# In ensure_op_session():
export OP_BIOMETRIC_UNLOCK_ENABLED=1

# After signin:
account_info=$(op whoami 2>/dev/null)
if [[ -z "$account_info" ]]; then
  error "1Password signin succeeded but whoami returned empty"
  error "Check 1Password Desktop integration is enabled"
  exit 1
fi
```

### 3. Docker Compose Port Conflict
**Issue**: Duplicate service on port 3005 or conflicting port mapping
**Fix**: Check `docker-compose.yml` and related compose files
- Remove duplicate service definitions
- Or change conflicting service to different port
- Keep only one service mapped to `3005:3005`

### 4. PID Capture with Scrubber
**Issue**: `$!` captures scrubber PID, not Node process
**Fix**: `scripts/claude_tier1_boot.sh` - service startup section

Option A - Capture before pipe:
```bash
npm start 2>&1 &
INTEGRATION_PID=$!
# Then pipe logs separately
tail -f logs/integration-service.log | scrub_secrets.sh &
```

Option B - Remove PID usage entirely:
```bash
# Manage via port check only, delete PID file logic
rm -f tmp/integration-service.pid
```

### 5. Env File - Use .env.op
**Issue**: Using root `.env` instead of service-specific `.env.op`
**Fix**: `scripts/claude_tier1_boot.sh` - integration-service startup

```bash
# Change from:
op run --env-file="$ROOT/.env" -- npm start

# To:
op run --env-file="$ROOT/backend/integration-service/.env.op" -- npm start
```

Create `.env.op` if missing with only required secrets

### 6. Git Cleanup
**File**: `.claude/RAW_FILE_AUDIT_COMPLETE.md` (modified)
**Action**: Either commit or delete

```bash
git add .claude/RAW_FILE_AUDIT_COMPLETE.md && git commit -m "docs: raw file audit complete"
# OR
git restore .claude/RAW_FILE_AUDIT_COMPLETE.md
```

## Implementation Order

1. Fix bash alias (manual - user's shell config)
2. Harden 1Password validation (edit boot script)
3. Fix env file path (edit boot script)  
4. Fix PID capture (edit boot script)
5. Check/fix docker-compose port conflict (if present)
6. Commit git changes
7. Test verification

## Verification Commands

```bash
# Test boot
bash scripts/claude_tier1_boot.sh

# Expected:
# - No BASH_SOURCE errors
# - Non-empty "authenticated: user@domain"
# - Services start successfully

# Verify health
curl -sf http://localhost:3005/health

# Check for secrets in logs
grep -Ei '(key=|token=|authorization:|Bearer )' -n logs/integration-service.log
# Expected: Empty output or only "Bearer ***REDACTED***"

# Git status
git status -s
# Expected: Clean working tree
```

## Acceptance Criteria

- `bash scripts/claude_tier1_boot.sh` completes without BASH_SOURCE errors
- `op whoami` validation fails-fast on empty response
- Service starts on port 3005 without conflicts
- Logs contain no plaintext secrets
- Git working tree clean
- All changes committed and pushed

## Time Estimate
- Fixes: 30-45 min
- Testing: 10 min
- Total: ~45-60 min
