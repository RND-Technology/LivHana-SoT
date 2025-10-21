# 🎼 Claude Tier-1 Boot System - Quick Start

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** October 21, 2025

## TL;DR

```bash
# From anywhere:
claude-tier1

# Or directly:
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
bash scripts/claude_tier1_boot.sh
```

Then copy the prompt and paste into Cursor to activate voice mode.

---

## What This Does

🎯 **Production-grade boot system** that initializes Claude Sonnet 4.5 with:

1. **Engineered Context Injection**
   - RPM DNA principles
   - Compliance guardrails (LifeWard, 21+, GA-56, COA)
   - Mission objectives ($1.148M protection, $125K-175K recovery)
   - Today's schedule and priorities

2. **Voice Mode Readiness**
   - MCP server health checks (Whisper, Kokoro, Rube)
   - Error recovery procedures
   - Fallback strategies

3. **Session Continuity (Stay TOONED)**
   - Loads SESSION_PROGRESS.md tail
   - Injects RPM_WEEKLY_PLAN_CURRENT.md
   - Rehydrates from previous session state
   - Maintains context across restarts

4. **System Health Monitoring**
   - Validates config/claude_tier1_context.yaml
   - Checks critical blockers (4 secrets)
   - Verifies deployed systems (TRUTH, Compliance, Agent Builder, MCP)
   - Tests service endpoints

---

## Files Created

### Configuration (Durable)
- `config/claude_tier1_context.yaml` - Master config with all context
- `docs/CLAUDE_TIER1_BOOT_SYSTEM.md` - Full documentation

### Runtime (Ephemeral)
- `tmp/claude_tier1_state.json` - Session state (persisted)
- `tmp/claude_tier1_prompt.txt` - Rendered prompt (regenerated)
- `logs/claude_tier1_boot_YYYYMMDD_HHMMSS.log` - Boot logs

### Scripts
- `scripts/claude_tier1_boot.sh` - Main entry point
- `scripts/verify_pipeline_integrity.py` - Config validation
- `scripts/render_claude_prompt.py` - Prompt generation
- `scripts/post_launch_checks.py` - Health checks

### Global Launcher
- `~/.local/bin/claude-tier1` - Run from anywhere

---

## Architecture

```
claude-tier1 (global launcher)
    ↓
scripts/claude_tier1_boot.sh
    ↓
    ├─→ verify_pipeline_integrity.py
    │     - Validates config
    │     - Checks compliance guardrails
    │     - Verifies system files
    │
    ├─→ render_claude_prompt.py
    │     - Loads config + state
    │     - Injects SESSION_PROGRESS.md
    │     - Injects RPM_WEEKLY_PLAN_CURRENT.md
    │     - Renders tmp/claude_tier1_prompt.txt
    │
    └─→ post_launch_checks.py
          - Checks MCP broker
          - Validates GCP Secret Manager
          - Tests voice ports
          - Updates state
```

---

## Usage

### Basic Boot

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
bash scripts/claude_tier1_boot.sh
```

### From Anywhere

```bash
claude-tier1
```

### View Generated Prompt

```bash
cat tmp/claude_tier1_prompt.txt
```

### Check Runtime State

```bash
cat tmp/claude_tier1_state.json | jq .
```

### View Boot Logs

```bash
tail -f logs/claude_tier1_boot_*.log
```

---

## Configuration

### Edit Master Config

```bash
vim config/claude_tier1_context.yaml
```

**Key Sections:**
- `persona` - Name, role, voice settings
- `mission` - Objectives, strategy, weekly plan
- `rpm_dna` - Execution framework
- `compliance_guardrails` - LifeWard, 21+, GA-56, COA
- `systems_deployed` - TRUTH, Compliance, Agent Builder, MCP
- `critical_blockers` - Secrets, dependencies
- `immediate_priorities` - Ordered task list
- `todays_schedule` - Time-blocked plan

### Reset Session State

```bash
rm tmp/claude_tier1_state.json
echo '{}' > tmp/claude_tier1_state.json
```

---

## Voice Mode Integration

### MCP Servers Checked

1. **Whisper (STT)** - Port 2022
2. **Kokoro (TTS)** - Port 8880
3. **Rube (Orchestration)** - MCP integration

### Error Recovery

If voice mode has issues:

1. Restart Cursor completely
2. Run `claude-tier1` again
3. Check logs: `tail -f logs/claude_tier1_boot_*.log`
4. Fall back to text mode if needed

### Troubleshooting

```bash
# Check voice ports
lsof -i :2022  # Whisper
lsof -i :8880  # Kokoro

# Check MCP config
cat ~/.cursor/mcp.json | jq .

# View voice error recovery
grep error_recovery config/claude_tier1_context.yaml
```

---

## What Gets Loaded Into Prompt

✅ **Mission & Strategy**
- Primary: Protect $1.148M revenue, unlock $125K-175K recovery
- Strategy: Deschedule Cannabis sativa L entirely. Texas leads.
- Week: Oct 21-27, 2025 (Team Pilot v3.1)

✅ **RPM DNA Principles**
- Result → Purpose → MAP → Blocks → Download
- Evidence First | <5 Min Verification | Concrete Metrics | Numbered Steps

✅ **Compliance Guardrails** (Non-Negotiable)
- LifeWard: Medical claims blocker
- 21+: Texas DSHS 25 TAC §300.701-702
- GA-56: Executive Order (emergency rulemaking)
- COA: Accredited labs (KCA, KCAA)

✅ **Systems Status**
- TRUTH Pipeline: 5 scripts (blocked by 4 secrets)
- Compliance Service: Ready for Cloud Run
- Agent Builder: 17-node workflow (blocked by secrets)
- MCP Broker: Operational

✅ **Critical Blockers**
- DEEPSEEK_API_KEY
- BLUECHECK_API_KEY
- GITHUB_PERSONAL_ACCESS_TOKEN
- JWT_SECRET1

✅ **Today's Schedule** (Oct 22)
- 08:00: Secrets sync + TRUTH test
- 10:00: Win-back Campaign 1 send
- 13:00: Compliance Service deploy
- 15:00: Jumio staging→prod test

✅ **Session Continuity**
- Last 20 lines of SESSION_PROGRESS.md
- Current RPM plan summary
- Previous session state
- Git status

---

## Advanced

### Manual Validation

```bash
python3 scripts/verify_pipeline_integrity.py \
  --config config/claude_tier1_context.yaml \
  --log /tmp/verify.log
```

### Manual Prompt Render

```bash
python3 scripts/render_claude_prompt.py \
  --config config/claude_tier1_context.yaml \
  --state tmp/claude_tier1_state.json \
  --out /tmp/prompt.txt
```

### Manual Health Checks

```bash
python3 scripts/post_launch_checks.py \
  --log /tmp/health.log \
  --state tmp/claude_tier1_state.json
```

---

## Benefits

✅ **Configuration-Driven** - Edit YAML, not scripts
✅ **Stateful** - Session continuity across restarts
✅ **Health-Monitored** - Automated service checks
✅ **Voice-Ready** - MCP servers validated at boot
✅ **Compliance-Enforced** - Guardrails always active
✅ **Engineer-Optimized** - Full context injection

---

## Next Steps

1. Run `claude-tier1` to boot
2. Copy generated prompt
3. Paste into Cursor
4. Activate voice mode
5. Say: "Status check" or "What are today's priorities?"

---

🎼 **ONE SHOT, ONE KILL | GROW BABY GROW, SELL BABY SELL**

*Liv Hana | Tier-1 Orchestration Layer | Claude Sonnet 4.5*

