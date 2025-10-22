# Claude Tier-1 Doctor & Autostart Guide

**Version:** 1.0
**Last Updated:** 2025-10-21
**Status:** Production Ready ✅

## Quick Reference

### Run Doctor (Diagnose & Fix Issues)

```bash
claude-tier1 doctor
# or
bash scripts/claude_tier1_doctor.sh
```

### Setup Autostart (Voice Services at Login)

```bash
claude-tier1 autostart
# or
bash scripts/setup_autostart.sh
```

### Normal Boot

```bash
claude-tier1
# or
bash scripts/claude_tier1_boot.sh
```

---

## Doctor Script

### What It Does

The doctor script automatically diagnoses and fixes common issues:

1. **Voice Services** - Checks if Whisper (STT) and Kokoro (TTS) are running
2. **Environment Variables** - Validates API keys (OPENAI, ANTHROPIC, DEEPSEEK, PERPLEXITY)
3. **Dependencies** - Checks Python packages (yaml, httpx, pydantic)
4. **File Permissions** - Ensures boot scripts are executable
5. **Directory Structure** - Creates missing directories (tmp, logs, config, .claude)
6. **Autostart Configuration** - Checks LaunchAgents status

### Auto-Fix Capabilities

The doctor will automatically attempt to fix:

- ✅ Start Whisper STT service if not running
- ✅ Start Kokoro TTS service if not running
- ✅ Load ANTHROPIC_API_KEY from 1Password (if authenticated)
- ✅ Install missing Python packages
- ✅ Make boot scripts executable
- ✅ Create missing directories
- ✅ Load LaunchAgents if not loaded

### Exit Codes

- **0** - All checks passed (system healthy)
- **1** - Critical issues found that could not be auto-fixed
- **2** - Some issues fixed, but manual intervention needed

### Usage Examples

```bash
# Run diagnostics and auto-fix
claude-tier1 doctor

# View doctor log
tail -f logs/claude_tier1_doctor_*.log
```

### Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎼 DIAGNOSIS 1: VOICE SERVICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Whisper STT is running on port 2022
✅ Kokoro TTS is running on port 8880

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎼 DIAGNOSIS 2: ENVIRONMENT VARIABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ OPENAI_API_KEY is set
✅ ANTHROPIC_API_KEY is set
...
```

---

## Autostart Setup

### What It Does

Configures voice services (Whisper & Kokoro) to automatically start at login using macOS LaunchAgents.

### Files Created

1. **Whisper LaunchAgent**
   - Path: `~/Library/LaunchAgents/com.livhana.whisper.plist`
   - Service: Whisper STT on port 2022
   - Logs: `/tmp/whisper-{stdout,stderr}.log`

2. **Kokoro LaunchAgent**
   - Path: `~/Library/LaunchAgents/com.livhana.kokoro.plist`
   - Service: Kokoro TTS on port 8880
   - Logs: `/tmp/kokoro-{stdout,stderr}.log`

### Features

- **RunAtLoad** - Services start automatically at login
- **KeepAlive** - Services restart if they crash
- **NetworkState** - Only start when network is available
- **Logging** - stdout/stderr captured to `/tmp/`

### Usage

```bash
# Setup autostart
claude-tier1 autostart

# Check if services are loaded
launchctl list | grep livhana

# View service logs
tail -f /tmp/whisper-stderr.log
tail -f /tmp/kokoro-stderr.log
```

### Manual Management

```bash
# Unload services (stop autostart)
launchctl unload ~/Library/LaunchAgents/com.livhana.whisper.plist
launchctl unload ~/Library/LaunchAgents/com.livhana.kokoro.plist

# Reload services (re-enable autostart)
launchctl load ~/Library/LaunchAgents/com.livhana.whisper.plist
launchctl load ~/Library/LaunchAgents/com.livhana.kokoro.plist

# Remove autostart completely
rm ~/Library/LaunchAgents/com.livhana.whisper.plist
rm ~/Library/LaunchAgents/com.livhana.kokoro.plist
launchctl unload com.livhana.whisper
launchctl unload com.livhana.kokoro
```

---

## Boot Script Updates

### 1Password Now Optional

The boot script no longer requires 1Password authentication:

**Before:**
```bash
❌ 1Password session not active
❌ Run: op signin
[EXIT]
```

**After:**
```bash
⚠️  1Password session not active - API keys will not auto-load
⚠️  Run: op signin (optional, for convenience only)
[CONTINUES]
```

### Benefits

- ✅ Boot works without 1Password CLI
- ✅ Boot works without 1Password authentication
- ✅ API keys can be set manually via environment variables
- ✅ Voice services can start independently

---

## Global Launcher Commands

The `claude-tier1` global launcher now supports multiple commands:

### Commands

```bash
claude-tier1              # Default: run boot sequence
claude-tier1 boot         # Explicit boot
claude-tier1 start        # Alias for boot
claude-tier1 run          # Alias for boot

claude-tier1 doctor       # Run diagnostics & auto-fix
claude-tier1 fix          # Alias for doctor
claude-tier1 diagnose     # Alias for doctor

claude-tier1 autostart    # Setup voice autostart
claude-tier1 setup-autostart  # Alias

claude-tier1 help         # Show help message
claude-tier1 -h           # Alias for help
claude-tier1 --help       # Alias for help
```

### Help Output

```bash
$ claude-tier1 help

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎼 CLAUDE TIER-1 LAUNCHER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usage: claude-tier1 [command]

Commands:
  boot, start, run     Start Claude Tier-1 boot sequence (default)
  doctor, fix          Run diagnostics and auto-fix common issues
  autostart            Setup voice services to auto-start at login
  help                 Show this help message

Examples:
  claude-tier1                    # Run normal boot
  claude-tier1 doctor             # Diagnose and fix issues
  claude-tier1 autostart          # Setup autostart for voice services

🎼 ONE SHOT, ONE KILL | GROW BABY GROW, SELL BABY SELL
```

---

## Troubleshooting

### Voice Services Won't Start

1. **Check if voicemode CLI is installed:**
   ```bash
   which voicemode
   # If not found:
   # Install voicemode CLI per documentation
   ```

2. **Check service logs:**
   ```bash
   tail -f /tmp/whisper-stderr.log
   tail -f /tmp/kokoro-stderr.log
   ```

3. **Try manual start:**
   ```bash
   voicemode whisper start
   voicemode kokoro start
   ```

### API Keys Not Loading

1. **Check 1Password authentication:**
   ```bash
   op whoami
   # If not authenticated:
   op signin
   ```

2. **Set keys manually:**
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   export OPENAI_API_KEY="sk-..."
   ```

3. **Add to shell profile:**
   ```bash
   echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
   source ~/.zshrc
   ```

### LaunchAgents Not Loading

1. **Check syntax:**
   ```bash
   plutil -lint ~/Library/LaunchAgents/com.livhana.whisper.plist
   plutil -lint ~/Library/LaunchAgents/com.livhana.kokoro.plist
   ```

2. **Reload LaunchAgents:**
   ```bash
   launchctl unload ~/Library/LaunchAgents/com.livhana.*.plist
   launchctl load ~/Library/LaunchAgents/com.livhana.*.plist
   ```

3. **Check system logs:**
   ```bash
   log show --predicate 'subsystem == "com.apple.launchd"' --last 1h | grep livhana
   ```

---

## Files Reference

### Scripts

- `scripts/claude_tier1_boot.sh` - Main boot script
- `scripts/claude_tier1_doctor.sh` - Doctor/diagnostics script
- `scripts/setup_autostart.sh` - Autostart setup script
- `scripts/preflight_checks.sh` - Pre-flight validation

### Global Launcher

- `~/.local/bin/claude-tier1` - Global launcher with commands

### LaunchAgents

- `~/Library/LaunchAgents/com.livhana.whisper.plist` - Whisper autostart
- `~/Library/LaunchAgents/com.livhana.kokoro.plist` - Kokoro autostart

### Logs

- `logs/claude_tier1_boot_*.log` - Boot logs
- `logs/claude_tier1_doctor_*.log` - Doctor logs
- `/tmp/whisper-{stdout,stderr}.log` - Whisper service logs
- `/tmp/kokoro-{stdout,stderr}.log` - Kokoro service logs

---

## Workflow Examples

### First Time Setup

```bash
# 1. Run doctor to check system
claude-tier1 doctor

# 2. Setup autostart for convenience
claude-tier1 autostart

# 3. Run normal boot
claude-tier1
```

### Daily Startup

```bash
# If autostart configured - just boot
claude-tier1

# If not - run doctor first
claude-tier1 doctor && claude-tier1
```

### Debugging Issues

```bash
# 1. Run doctor to diagnose
claude-tier1 doctor

# 2. Check logs
tail -f logs/claude_tier1_doctor_*.log

# 3. Check voice service logs
tail -f /tmp/whisper-stderr.log
tail -f /tmp/kokoro-stderr.log

# 4. Try boot
claude-tier1
```

---

## Benefits

### Doctor Script

- ✅ **Auto-diagnosis** - Detects issues automatically
- ✅ **Auto-fix** - Repairs common problems without manual intervention
- ✅ **Detailed logging** - Full diagnostic log for debugging
- ✅ **Exit codes** - Scriptable for CI/CD integration

### Autostart

- ✅ **Convenience** - No manual service start required
- ✅ **Reliability** - Services restart on crash
- ✅ **Boot-time ready** - Voice mode available immediately
- ✅ **Standard macOS** - Uses native LaunchAgents

### Updated Boot

- ✅ **No blockers** - Works without 1Password
- ✅ **Graceful degradation** - Falls back to manual API keys
- ✅ **Better UX** - Warnings instead of errors
- ✅ **More flexible** - Multiple auth methods

---

🎼 **ONE SHOT, ONE KILL | GROW BABY GROW, SELL BABY SELL**

*Liv Hana | Tier-1 Orchestration Layer | Claude Sonnet 4.5*
