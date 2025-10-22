# 🔧 FIX: Claude Code CLI Auto-Update Failure

**Issue**: "✗ Auto-update failed · Try claude doctor or npm i -g @anthropic-ai/claude-code"

**Status**: Claude CLI v2.0.24 installed but auto-update mechanism failed

---

## QUICK FIX (Choose One)

### **Option 1: Manual Update (Recommended - 30 seconds)**
```bash
npm install -g @anthropic-ai/claude-code@latest
```

### **Option 2: Force Reinstall (If Option 1 fails)**
```bash
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code
```

### **Option 3: Use Homebrew (Alternative)**
```bash
brew upgrade anthropic-ai/claude/claude-code
```

---

## CURRENT STATUS

**Installed**:
- Location: `/opt/homebrew/bin/claude`
- Version: `2.0.24`
- Package: `@anthropic-ai/claude-code@2.0.24`

**Issue**: 
- `claude doctor` command fails with stdin error
- Auto-update mechanism not working
- Raw mode not supported on current process.stdin

---

## ROOT CAUSE

The error "Raw mode is not supported on the current process.stdin" occurs when:
1. Claude CLI is run in non-interactive shell context
2. stdin/stdout/stderr are redirected or piped
3. Running in automation/script without TTY

This is why `claude doctor` failed when we tried it.

---

## LONG-TERM FIX

**Update ~/.zshrc claude-tier1 function** to handle this gracefully:

```bash
claude-tier1() {
  cd ~/LivHana-Trinity-Local/LivHana-SoT || return 1
  
  # 1Password check
  if ! op whoami >/dev/null 2>&1; then
    echo "🔐 1Password session required..."
    op signin || return 1
  fi
  
  # Boot
  if [ -f boot ]; then
    source boot || return 1
  else
    echo "⚠️  boot file not found, trying tier1-boot instead..."
    bash scripts/claude_tier1_boot.sh || return 1
  fi
  
  # Launch Claude Code (with update check)
  if command -v claude >/dev/null 2>&1; then
    # Check for updates (non-blocking)
    echo "🔄 Checking Claude Code version..."
    CURRENT_VERSION=$(claude --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
    echo "📦 Current version: $CURRENT_VERSION"
    
    # Launch with arguments
    printf '\n🚀 Launching Claude Code...\n\n'
    claude "$@"
  else
    printf '\n❌ Claude Code CLI not installed.\n'
    printf 'Install: npm install -g @anthropic-ai/claude-code\n'
    printf 'Or: brew install anthropic-ai/claude/claude-code\n'
    printf 'Then run: claude-tier1\n\n'
  fi
}
```

---

## VERIFICATION

After update, verify:

```bash
# Check version
claude --version

# Should show latest (2.0.25 or higher)

# Test basic functionality
claude --help

# Launch interactive (in TTY)
claude
```

---

## WHY AUTO-UPDATE FAILED

**Technical Reason**:
- Claude Code CLI tries to use `process.stdin` in raw mode for interactive prompts
- When run from automation/scripts, stdin is not attached to a TTY
- Auto-update mechanism requires interactive input for confirmation

**Solution**:
- Manual updates via npm (no interactive prompts)
- Or wait for Claude Code CLI to fix auto-update for non-TTY contexts

---

## RUNNABLE COMMAND

```bash
npm install -g @anthropic-ai/claude-code@latest && claude --version
```

**Expected Output**: `2.0.25` or higher (latest version)

---

**Status**: Ready to fix
**Time**: 30 seconds  
**Impact**: Resolves auto-update failure, gets latest Claude Code features


