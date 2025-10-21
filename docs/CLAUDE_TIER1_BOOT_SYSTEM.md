# Claude Tier-1 Boot System Documentation

**Version:** 1.0  
**Last Updated:** 2025-10-21  
**Status:** Production Ready ✅

## Overview

The Claude Tier-1 Boot System is a production-grade orchestration layer that initializes Claude Sonnet 4.5 with:

- ✅ **Engineered context injection** (RPM DNA, compliance guardrails, mission objectives)
- ✅ **Voice mode readiness** (MCP server checks, error recovery)
- ✅ **Session continuity** (Stay TOONED - rehydrates from previous sessions)
- ✅ **Health monitoring** (System checks, service validation)
- ✅ **Configuration-driven** (YAML config, JSON runtime state)

## Architecture

```
scripts/claude_tier1_boot.sh (main entry point)
    ↓
    ├─→ scripts/verify_pipeline_integrity.py
    │     - Validates config/claude_tier1_context.yaml
    │     - Checks compliance guardrails active
    │     - Verifies system files exist
    │
    ├─→ scripts/render_claude_prompt.py
    │     - Loads config/claude_tier1_context.yaml
    │     - Loads tmp/claude_tier1_state.json
    │     - Injects SESSION_PROGRESS.md tail
    │     - Injects RPM_WEEKLY_PLAN_CURRENT.md
    │     - Renders tmp/claude_tier1_prompt.txt
    │
    └─→ scripts/post_launch_checks.py
          - Checks MCP broker reachability
          - Validates GCP Secret Manager access
          - Tests voice mode ports (2022, 8880)
          - Updates tmp/claude_tier1_state.json
```

## Quick Start

### 1. Run the Boot Script

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
bash scripts/claude_tier1_boot.sh
```

### 2. Copy the Rendered Prompt

The script will display the engineered prompt. Copy it and paste into:

- **Cursor:** New chat window
- **Claude.ai:** New conversation
- **Claude CLI:** Pipe directly

### 3. Activate Voice Mode

- Click microphone icon in Cursor
- Or use `/voicemode` command
- Or say "Liv Hana" to activate

### 4. Verify Boot

Say or type: "Status check" or "What are today's priorities?"

## Configuration

### `config/claude_tier1_context.yaml`

Master configuration file containing:

- **Persona:** Name, role, model, voice settings
- **Mission:** Primary objectives, strategy, weekly plan
- **RPM DNA:** Execution framework and principles
- **Compliance Guardrails:** LifeWard, 21+, GA-56, COA requirements
- **Systems Deployed:** TRUTH Pipeline, Compliance Service, Agent Builder, MCP Broker
- **Critical Blockers:** Secrets, dependencies, warnings
- **Immediate Priorities:** Ordered task list with commands
- **Today's Schedule:** Time-blocked execution plan
- **Voice Mode Config:** MCP servers, error recovery
- **Stay TOONED:** Continuity settings

### `tmp/claude_tier1_state.json`

Runtime state (persisted across sessions):

```json
{
  "last_boot": "2025-10-21T10:00:00Z",
  "last_command": "bash scripts/claude_tier1_boot.sh",
  "session_count": 5,
  "stay_tooned": true,
  "last_health_check": "2025-10-21T10:05:00Z",
  "health_checks_passed": true,
  "voice_mode_ready": true
}
```

## Helper Scripts

### `verify_pipeline_integrity.py`

**Purpose:** Pre-flight validation of config and systems

**Usage:**
```bash
python3 scripts/verify_pipeline_integrity.py \
  --config config/claude_tier1_context.yaml \
  --log logs/boot.log \
  --root .
```

**Checks:**
- Config file exists and is valid YAML
- All required sections present
- Compliance guardrails active
- System files exist (TRUTH scripts, Compliance API, Agent config)
- Critical blockers documented

### `render_claude_prompt.py`

**Purpose:** Generate engineered system prompt with full context

**Usage:**
```bash
python3 scripts/render_claude_prompt.py \
  --config config/claude_tier1_context.yaml \
  --state tmp/claude_tier1_state.json \
  --out tmp/claude_tier1_prompt.txt \
  --root .
```

**Includes:**
- Mission & RPM DNA
- Compliance guardrails
- System status
- Critical blockers
- Today's schedule
- Session continuity (SESSION_PROGRESS.md tail)
- Current RPM plan summary

### `post_launch_checks.py`

**Purpose:** Post-boot health validation

**Usage:**
```bash
python3 scripts/post_launch_checks.py \
  --log logs/boot.log \
  --state tmp/claude_tier1_state.json \
  --root .
```

**Checks:**
- MCP Broker endpoint reachable
- GCP Secret Manager accessible
- Voice mode ports listening (Whisper 2022, Kokoro 8880)
- Git repository status
- Updates state with `voice_mode_ready` flag

## Voice Mode Integration

### MCP Servers

The boot system checks for:

1. **Whisper (STT)** - Port 2022
   - Speech-to-text for voice input
   - Fallback on error: Text mode

2. **Kokoro (TTS)** - Port 8880
   - Text-to-speech for voice output
   - Fallback on error: Text display

3. **Rube (Orchestration)** - MCP integration
   - Cross-app automation
   - Tool discovery and execution

### Error Recovery

Defined in `config/claude_tier1_context.yaml`:

```yaml
voice_mode_config:
  error_recovery:
    empty_text_blocks: "Restart MCP servers if empty text block errors occur"
    api_timeout: "Fall back to text mode, log incident"
    auth_failure: "Check 1Password session, re-authenticate"
```

### Troubleshooting Voice Mode

If voice mode errors occur:

1. **Check MCP servers:**
   ```bash
   lsof -i :2022  # Whisper
   lsof -i :8880  # Kokoro
   ```

2. **Restart Cursor:**
   - Close Cursor completely
   - Run `claude-tier1` or `bash scripts/claude_tier1_boot.sh`
   - Reopen Cursor

3. **Check logs:**
   ```bash
   tail -f logs/claude_tier1_boot_*.log
   ```

4. **Fall back to text mode:**
   - Voice mode is optional
   - All functionality available via text

## Session Continuity (Stay TOONED)

The boot system maintains continuity across sessions:

1. **SESSION_PROGRESS.md tail** - Last 20 lines of recent activity
2. **RPM_WEEKLY_PLAN_CURRENT.md** - Current priorities and schedule
3. **Runtime state** - Session count, last command, health status
4. **Git status** - Uncommitted files, current branch

This allows Claude to:
- Resume work seamlessly
- Recall recent decisions
- Continue multi-session tasks
- Maintain context across restarts

## Logs

All boot sessions logged to:

```
logs/claude_tier1_boot_YYYYMMDD_HHMMSS.log
```

Logs include:
- Timestamp for each step
- Validation results
- Health check outcomes
- Errors and warnings
- State updates

## Integration with Existing Systems

### Compatible with:

- ✅ **TRUTH Pipeline** - Scripts checked, status loaded
- ✅ **Compliance Service** - API validated, guardrails enforced
- ✅ **Agent Builder** - 17-node config loaded
- ✅ **MCP Broker** - Health checked at boot
- ✅ **RPM Weekly Plan** - Current plan injected into prompt
- ✅ **Session Progress** - Recent activity loaded for continuity

### Replaces:

- `~/.local/bin/claude-tier1` (simple launcher)
- `.claude/boot_codex_tier1.sh` (legacy boot)
- Manual context injection
- Ad-hoc voice mode setup

## Advanced Usage

### Custom Configuration

Edit `config/claude_tier1_context.yaml` to customize:

- Mission objectives
- Compliance rules
- System endpoints
- Schedule blocks
- Priority tasks

### Cron/Service Integration

For automated restarts:

```bash
# Create systemd service (Linux) or launchd plist (macOS)
# Example: Restart on failure with exponential backoff
[Unit]
Description=Claude Tier-1 Orchestration Layer
After=network.target

[Service]
Type=simple
User=jesseniesen
WorkingDirectory=/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
ExecStart=/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh
Restart=on-failure
RestartSec=30s

[Install]
WantedBy=multi-user.target
```

### CI/CD Integration

Use in GitHub Actions or Cloud Build:

```yaml
- name: Boot Claude Tier-1
  run: |
    cd LivHana-SoT
    bash scripts/claude_tier1_boot.sh
    # Validate boot succeeded
    test -f tmp/claude_tier1_prompt.txt
    test -f tmp/claude_tier1_state.json
```

## Maintenance

### Update Configuration

When mission/priorities change:

```bash
vim config/claude_tier1_context.yaml
# Update mission, priorities, schedule, etc.
git add config/claude_tier1_context.yaml
git commit -m "Update Tier-1 configuration for Week X"
```

### Clear Runtime State

To start fresh (lose session continuity):

```bash
rm tmp/claude_tier1_state.json
echo '{}' > tmp/claude_tier1_state.json
```

### Archive Old Logs

```bash
cd logs
tar -czf archive_$(date +%Y%m).tar.gz claude_tier1_boot_*.log
rm claude_tier1_boot_*.log
```

## Security

- **Secrets:** Never stored in config - fetched from GCP Secret Manager
- **1Password:** Authentication required before boot
- **Logs:** May contain sensitive paths - restrict access
- **State:** Runtime state is non-sensitive metadata only

## Support

For issues or questions:

1. Check logs: `tail -f logs/claude_tier1_boot_*.log`
2. Review config: `cat config/claude_tier1_context.yaml`
3. Validate manually: `python3 scripts/verify_pipeline_integrity.py --config config/claude_tier1_context.yaml`
4. See `.claude/SESSION_PROGRESS.md` for recent activity

---

## Quick Reference

**Boot Command:**
```bash
bash scripts/claude_tier1_boot.sh
```

**Key Files:**
- Config: `config/claude_tier1_context.yaml`
- State: `tmp/claude_tier1_state.json`
- Prompt: `tmp/claude_tier1_prompt.txt`
- Logs: `logs/claude_tier1_boot_*.log`

**Status Check:**
```bash
cat tmp/claude_tier1_state.json | jq .
```

---

🎼 **ONE SHOT, ONE KILL | GROW BABY GROW, SELL BABY SELL**

*Liv Hana | Tier-1 Orchestration Layer | Claude Sonnet 4.5*

