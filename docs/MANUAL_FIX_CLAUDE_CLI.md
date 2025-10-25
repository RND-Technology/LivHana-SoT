# 🚨 MANUAL FIX: Claude CLI Auto-Update Failure

**Issue**: Persistent auto-update failure in Layer 1.1 (Terminal Claude Code CLI)
**Error**: `✗ Auto-update failed · Try claude doctor or npm i -g @anthropic-ai/claude-code`
**Root Cause**: npm global vs Homebrew conflict (both installed simultaneously)

---

## THE PROBLEM

**Current State**:
- npm global: `/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code` (ENOTEMPTY error)
- Homebrew: `/opt/homebrew/bin/claude` → works but can't auto-update
- Conflict: npm can't rename directory during update

**Impact**: 
- Auto-update mechanism broken
- Current version (2.0.25) works fine
- Cosmetic issue, NOT functional blocker

---

## THE FIX (Requires sudo - Manual Execution)

### Step 1: Document Current State
```bash
npm list -g @anthropic-ai/claude-code
which claude
claude --version
```

### Step 2: Remove npm Global
```bash
npm rm -g @anthropic-ai/claude-code
```

**If fails with ENOTEMPTY error**:
```bash
sudo rm -rf /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code
```

### Step 3: Reinstall via Homebrew Only (CASK)
```bash
brew update
brew reinstall --cask claude-code
```

**Note**: Claude Code is a CASK, not a formula. No tap required.

### Step 4: Verify
```bash
which claude
# Should show: /opt/homebrew/bin/claude

claude --version
# Should work without errors

claude doctor
# Run from interactive terminal (not CI/script)
```

### Step 5: Update PATH (if needed)
Ensure `/opt/homebrew/bin` appears BEFORE `/usr/local/bin` in `~/.zshrc`:
```bash
export PATH="/opt/homebrew/bin:$PATH"
```

---

## ROLLBACK (If Something Breaks)

**If PATH breaks**:
```bash
cp ~/.zshrc.v1_backup.* ~/.zshrc
exec zsh
```

**If Claude CLI stops working**:
```bash
brew uninstall claude-code
brew install anthropic-ai/claude-code/claude-code
```

---

## WHY THIS IS MANUAL (Not Automated)

1. **Requires sudo** - can't automate password prompts
2. **Requires TTY** - `claude doctor` needs interactive terminal
3. **System-level** - modifying global npm packages
4. **Low risk tolerance** - better done by human with rollback ready

---

## ALTERNATIVE (If Fix Too Risky)

**Option**: Ignore the auto-update error
- Current version (2.0.25) is fully functional
- Manual updates work: `brew upgrade claude-code`
- Auto-update is convenience only
- No impact on Tier-1 funnel operations

---

## AFTER FIX COMPLETES

Update `tmp/agent_status/codex_tasks.json`:
```json
{
  "id": "codex-cli-fix-001",
  "status": "completed",
  "completed_at": "ISO8601",
  "notes": "Homebrew-only install confirmed, auto-update working"
}
```

---

## Model Alias Missing – Reinstall Cask

**Issue**: Claude Sonnet 4.5 OCT 2025 model unavailable during boot  
**Error**: "Claude Sonnet 4.5 OCT 2025 model unavailable"  
**Root Cause**: Cask installation incomplete or corrupted

### Remediation Steps

1. **Reinstall Claude Cask**:
   ```bash
   brew reinstall --cask claude
   ```

2. **Update Claude CLI** (optional):
   ```bash
   claude self update
   ```

3. **Verify Model Availability**:
   ```bash
   claude models list | grep -i sonnet
   ```
   Expected output: `sonnet-4.5-oct-2025`

4. **Re-run Tier-1 Boot**:
   ```bash
   MAX_AUTO=0 ./START.sh
   ```

### Temporary Override

If model unavailable and boot blocked:
```bash
ALLOW_TEXT_ONLY=1 MAX_AUTO=0 ./START.sh
```

**Warning**: This bypasses voice mode requirement (NOT recommended for production sessions).

**Note**: Override is temporary. Full remediation requires model availability.

---

**Status**: Manual intervention required  
**Priority**: Critical (but non-blocking)  
**Recommendation**: Fix during maintenance window, not during active voice sessions

