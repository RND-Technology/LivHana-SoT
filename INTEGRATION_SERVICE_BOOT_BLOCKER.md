# Integration Service Boot Blocker

**Date:** 2025-10-23  
**Issue:** Integration service fails to start via boot script  
**Status:** BLOCKED - requires .env.op resolution strategy

## Problem

The integration-service startup command fails:

```bash
op run --env-file .env.op -- npm start
```

**Error:**
```
[ERROR] could not resolve item UUID for item DATABASE_URL: could not find item DATABASE_URL in vault pafkcwhhfsysgg2b6j32sjt7wm
```

## Root Cause

The `.env.op` file contains 1Password references (e.g., `op://vault/ItemName/FieldName`), but `op run` cannot resolve them because:
1. Missing vault access permissions
2. Incorrect item references
3. Vault/item naming mismatch

## Impact

- Integration service fails to start on boot
- Health check fails: `curl http://localhost:3005/health`
- Secret scrubbing works, but no logs generated (service doesn't start)

## Solutions

### Option 1: Fix 1Password Vault Access
1. Verify `.env.op` references correct vault/item names
2. Grant `op run` access to vault `pafkcwhhfsysgg2b6j32sjt7wm`
3. Update `.env.op` with correct item UUIDs or friendly names

### Option 2: Skip Integration Service on Boot
Make it optional in `claude_tier1_boot.sh`:
```bash
if [[ "${ENABLE_INTEGRATION_SERVICE:-0}" == "1" ]]; then
  # start integration service
fi
```

### Option 3: Use Plain .env File (Temporary)
Fall back to `.env` with actual secrets (less secure, for dev only):
```bash
ENV_FILE="$ROOT/backend/integration-service/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  warning "Skipping integration-service (no .env found)"
fi
```

## Verification

Once fixed, verify:
1. Service starts: `ps aux | grep "npm start"`
2. Health check passes: `curl -sf http://localhost:3005/health`
3. Logs contain scrubbed output: `grep -E "(API|TOKEN|SECRET|PASSWORD)" logs/integration-service.log` → no matches

## Current Status

✅ Boot script improvements:
- Fixed PID capture with subshell + pgrep
- Fixed scrub_secrets.sh sed syntax
- Added proper error handling

❌ Blocked on:
- 1Password vault resolution for integration-service

**Next Steps:** Investigate vault permissions or make service optional.

