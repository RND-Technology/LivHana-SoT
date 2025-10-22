# 🎯 SHELL FIX QUICK REFERENCE
**ONE SHOT, ONE KILL** | Tier-1 Shell Environment Recovery

---

## 🔥 THE PROBLEM

1. **Cursor Error**: "Unable to resolve your shell environment in a reasonable time"
2. **1Password Error**: `"OpenAI API Key" isn't an item`
3. **Root Cause**: Blocking boot script runs on EVERY shell initialization

---

## ✅ THE FIX (ONE COMMAND)

```bash
bash /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/FIX_SHELL_NOW.sh
```

**What it does:**
1. ✅ Backs up current `.zshrc` and `.zshenv`
2. ✅ Removes blocking boot script from shell init
3. ✅ Removes missing 1Password API key calls
4. ✅ Creates manual boot aliases (non-blocking)
5. ✅ Tests shell load time (should be < 2s)

---

## 🎯 POST-FIX STEPS

### 1. Restart Cursor
```bash
# Cmd+Q to quit Cursor
# Reopen Cursor
# Should see NO shell environment warning
```

### 2. Test New Shell
```bash
# Open new terminal - should load instantly
time zsh -i -c exit
# Expected: < 2 seconds
```

### 3. Manual Tier-1 Boot (When Ready)
```bash
# New alias for manual boot (non-blocking)
tier1-boot

# Or boot + launch Claude Code
claude-tier1

# Or just 3-agent foundation
boot-3-agents
```

---

## 📋 NEW ALIASES (AVAILABLE AFTER FIX)

| Alias | What It Does |
|-------|-------------|
| `tier1-boot` | Run Tier-1 boot system manually |
| `claude-tier1` | Boot system + launch Claude Code |
| `boot-3-agents` | Launch 3-agent foundation layer |

**KEY DIFFERENCE**: These are MANUAL now, not auto-running on every shell.

---

## 🔄 ROLLBACK (IF NEEDED)

If something breaks:
```bash
# Restore from backup (timestamp from fix output)
cp ~/.zshrc.backup.YYYYMMDD_HHMMSS ~/.zshrc
cp ~/.zshenv.backup.YYYYMMDD_HHMMSS ~/.zshenv
exec zsh
```

---

## 🎯 WHY THIS FIX WORKS

**Before:**
```bash
~/.zshrc line 45: bash /path/to/TIER1_BOOT_LOCK_3_AGENTS_24_7.sh
```
↑ This BLOCKS every shell initialization (30+ seconds)  
↑ Causes Cursor timeout  
↑ Runs even when not needed  

**After:**
```bash
alias boot-3-agents='bash /path/to/TIER1_BOOT_LOCK_3_AGENTS_24_7.sh'
```
↑ MANUAL alias (only runs when you call it)  
↑ Shell loads in < 2 seconds  
↑ Cursor loads instantly  

---

## 🚨 MARINE CORPS PRECISION

**Mission**: Fix shell environment blocking issue  
**Execution**: One command, automated, safe (with backups)  
**Result**: Fast shell loading, Cursor operational, manual boot control  

**SEMPER FI** 🇺🇸

---

## 📞 TROUBLESHOOTING

### Still seeing "OpenAI API Key" error?
```bash
# Check for additional references
grep -r "OpenAI API Key" ~/.zshrc ~/.zshenv ~/.zprofile 2>/dev/null

# If found, comment them out or remove
```

### Shell still slow?
```bash
# Check what's taking time
time zsh -i -c 'exit'

# Profile zsh startup
zsh -i -c 'zprof' 2>/dev/null

# Likely culprit: Google Cloud SDK completion
# Already disabled in fix
```

### Cursor still showing warning?
```bash
# Hard restart Cursor
pkill -9 Cursor
# Wait 5 seconds
# Reopen Cursor

# Or restart Mac if needed
```

---

**READY TO EXECUTE**: `bash /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/FIX_SHELL_NOW.sh`


