# VS Code Crash Fix - Electron/Node Fatal Error

**Date**: 2025-10-23  
**Status**: ⚠️ CRASH ON LAUNCH  
**Version**: VS Code 1.104.0 (Electron 37.3.1)  
**Error**: SIGABRT in worker thread (package.json resolution failure)

---

## The Problem

```
Thread 12 Crashed (Worker Thread):
node::modules::BindingData::GetPackageJSON
→ node::OnFatalError
→ SIGABRT (immediate abort)
```

**Crash happens in ~0.3s** before UI loads → corrupted app resources or extension metadata.

---

## Quick Fixes (Try in Order)

### Fix 1: Re-download Clean Copy (Fastest)
```bash
# Quit VS Code completely
osascript -e 'quit app "Visual Studio Code"'

# Move current app to backup
mv "/Applications/Visual Studio Code.app" \
   "/Applications/Visual Studio Code BACKUP.app"

# Download fresh copy
open "https://code.visualstudio.com/Download"
# Install the .dmg, drag to Applications

# Launch
open -a "Visual Studio Code"
```

### Fix 2: Clear Extension Cache
```bash
# Quit VS Code
osascript -e 'quit app "Visual Studio Code"'

# Backup extensions
mv ~/Library/Application\ Support/Code \
   ~/Library/Application\ Support/Code.backup

# Relaunch (fresh state)
open -a "Visual Studio Code"
```

### Fix 3: Reset Preferences
```bash
# Quit VS Code
osascript -e 'quit app "Visual Studio Code"'

# Backup prefs
cp ~/Library/Preferences/com.microsoft.VSCode.plist \
   ~/Library/Preferences/com.microsoft.VSCode.plist.backup

# Delete prefs
rm ~/Library/Preferences/com.microsoft.VSCode.plist

# Relaunch
open -a "Visual Studio Code"
```

### Fix 4: Launch with Diagnostics
```bash
# From terminal
/Applications/Visual\ Studio\ Code.app/Contents/MacOS/Electron \
  --disable-extensions \
  --verbose \
  --log=trace
```

---

## Cursor Alternative (Recommended)

**Since you're using Cursor anyway**, just use Cursor exclusively:

```bash
# Cursor is already working
open -a Cursor /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT

# Cursor has better AI integration anyway
# VS Code crashing is not blocking Tier-1 work
```

---

## Root Cause Investigation (If Needed)

**Inspect bundled package.json files**:
```bash
find "/Applications/Visual Studio Code.app/Contents/Resources/app/node_modules" \
  -name "package.json" \
  -exec sh -c 'python3 -m json.tool "{}" >/dev/null || echo "Invalid: {}"' \;
```

**Check for scope metadata**:
```bash
grep -r "GetPackageJSON" \
  "/Applications/Visual Studio Code.app/Contents/Resources/app" \
  2>/dev/null | head -5
```

---

## Recommendation

**Use Cursor** - It's already working, has better AI, and VS Code crashing doesn't block any Tier-1 work.

**If you need VS Code**, use Fix 1 (re-download clean copy).

---

**Status**: Not blocking Tier-1 operations (Cursor works fine)  
**Priority**: Low (unless you specifically need VS Code)  
**Action**: Defer or use Cursor exclusively

---

**Tier-1 work continues in Cursor regardless.** ✅

