# 🎯 SHELL ENVIRONMENT FIX PLAN

**Timestamp**: 2025-10-22T01:54:00Z  
**Status**: READY TO EXECUTE  
**Priority**: TIER-1 CRITICAL

---

## 🔥 CRITICAL ISSUES IDENTIFIED

### 1. Shell Blocking on Every Init

**File**: `~/.zshrc` line 45  
**Problem**: Blocking boot script runs on EVERY shell, causing Cursor timeout  

```bash
bash /Users/jesseniesen/LivHana-Trinity-Local/TIER1_BOOT_LOCK_3_AGENTS_24_7.sh
```

### 2. Missing 1Password Item

**File**: `~/.zshrc` line 43  
**Problem**: Tries to fetch non-existent "OpenAI API Key" item  

```bash
export OPENAI_API_KEY=$(op item get "OpenAI API Key" --fields password --reveal)
```

**Result**: `[ERROR] "OpenAI API Key" isn't an item`

### 3. Wrong Directory Context

**Expected**: `/Users/jesseniesen/LivHana-Trinity-Local` (parent)  
**Actual**: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT` (root only)

---

## ✅ FIX SEQUENCE (5 STEPS)

### **STEP 1: Backup Current Shell Config**

```bash
cp ~/.zshrc ~/.zshrc.backup.$(date +%Y%m%d_%H%M%S)
cp ~/.zshenv ~/.zshenv.backup.$(date +%Y%m%d_%H%M%S)
```

### **STEP 2: Fix .zshrc - Remove Blocking Lines**

Edit `~/.zshrc` and COMMENT OUT or REMOVE these lines:

```bash
# LINE 43 - Comment out missing 1Password item
# export OPENAI_API_KEY=$(op item get "OpenAI API Key" --fields password --reveal)

# LINE 45 - Comment out blocking boot script
# bash /Users/jesseniesen/LivHana-Trinity-Local/TIER1_BOOT_LOCK_3_AGENTS_24_7.sh

# LINE 46 - This is redundant after line 43
export OPENAI_API_KEY="local-voice-mode-active"  # Keep this as fallback
```

**CLEANER APPROACH**: Replace lines 43-46 with:

```bash
# OpenAI fallback for local voice mode
export OPENAI_API_KEY="${OPENAI_API_KEY:-local-voice-mode-active}"

# Manual Tier-1 boot alias (non-blocking)
alias tier1-boot='bash /Users/jesseniesen/LivHana-Trinity-Local/TIER1_BOOT_LOCK_3_AGENTS_24_7.sh'
```

### **STEP 3: Verify Shell Loads Fast**

```bash
# Test shell initialization time (should be < 2 seconds)
time zsh -i -c exit

# Expected: real 0m0.5s (or similar fast time)
# If still slow, check Google Cloud SDK loading times
```

### **STEP 4: Fix Boot Script 1Password Calls**

The boot script at `scripts/claude_tier1_boot.sh` tries to fetch these items:

- `ANTHROPIC_API_KEY` (line 101)
- `DEEPSEEK_API_KEY` (line 109)
- `PERPLEXITY_API_KEY` (line 109)

**Check which actually exist**:

```bash
op item list --vault LivHana-Ops-Keys --format json | jq -r '.[].title' | grep -i "anthropic\|deepseek\|perplexity\|openai"
```

**If none exist**, create fallbacks in boot script OR create 1Password items.

### **STEP 5: Restart Shell & Cursor**

```bash
# Option A: Restart current terminal
exec zsh

# Option B: Restart Cursor completely
# Cmd+Q to quit, then reopen
```

---

## 🎯 POST-FIX VALIDATION

### Validate Shell Environment

```bash
# 1. Shell loads quickly (< 2s)
time zsh -i -c exit

# 2. No 1Password errors
zsh -i -c 'echo "Shell loaded: $SHELL"'

# 3. Cursor can resolve environment
# Open Cursor, should see NO warning about shell environment
```

### Validate Boot Script

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
./scripts/claude_tier1_boot.sh

# Should complete without 1Password errors
# Warnings are OK, but no hard failures
```

---

## 🔧 ALTERNATIVE: Minimal .zshrc

If issues persist, replace `~/.zshrc` with this minimal version:

```bash
# Minimal Tier-1 .zshrc
export PATH="/opt/homebrew/opt/python@3.12/libexec/bin:$PATH"

# Google Cloud SDK (conditionally load)
if [ -f "$HOME/google-cloud-sdk/path.zsh.inc" ]; then
  . "$HOME/google-cloud-sdk/path.zsh.inc"
fi

# 1Password configuration
export OP_ACCOUNT="reggiedro"
export OP_VAULT="LivHana-Ops-Keys"
op-get() { op read "op://$OP_VAULT/$1"; }

# API Key fallbacks (non-blocking)
export OPENAI_API_KEY="${OPENAI_API_KEY:-local-voice-mode-active}"

# Liv Hana manual boot (ALIAS, not auto-run)
alias tier1-boot='cd ~/LivHana-Trinity-Local/LivHana-SoT && source boot'
alias claude-tier1='tier1-boot && claude'

# Load local environment if exists
[ -f "$HOME/.local/bin/env" ] && . "$HOME/.local/bin/env"
```

---

## 📋 EXECUTION CHECKLIST

- [ ] Step 1: Backup shell configs
- [ ] Step 2: Edit ~/.zshrc (comment blocking lines)
- [ ] Step 3: Test shell load time
- [ ] Step 4: Verify boot script (optional)
- [ ] Step 5: Restart shell/Cursor
- [ ] Post-fix: Validate shell loads < 2s
- [ ] Post-fix: Validate Cursor has no warnings
- [ ] Post-fix: Run boot script successfully

---

## 🚨 MARINE CORPS PRECISION

**ONE SHOT, ONE KILL**: Fix shell environment blocking, remove missing 1Password calls, restore fast shell initialization.

**SEMPER FI** 🇺🇸
