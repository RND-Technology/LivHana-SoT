# 🔥 FULL POWER STARTUP PROMPT - TIER 1

**Copy this ENTIRE prompt to start ANY new Claude Code session with 100% context:**

---

## THE PROMPT (Copy from here ↓)

```
Regain full context from previous session, allll of it now, book shaka-laka!

MISSION: LivHana Empire - Cannabis commerce platform across R&D, HNC, OPS, HERB

CRITICAL FILES TO READ FIRST (in order):
1. .claude/PERSISTENT_MEMORY.md - Never ask for keys again
2. docs/CURRENT_STATUS.md - Latest project state
3. .claude/LAUNCH_PLAN.md - Autonomous deployment framework

PROJECT: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT

SECRETS & KEYS (from 1Password CLI):
- ANTHROPIC_API_KEY: op item get vpxxhnpqtsc6wxgnfm444b52p4 --reveal --fields password
- JWT_SECRET_REASONING: op item get JWT_SECRET_REASONING --reveal --fields password
- All other keys: Check .env files or op://LivHana-Ops-Keys/ references

SERVICES:
- reasoning-gateway (port 4002): Autonomous agent with Claude Sonnet 4.5
- integration-service (port 3005): Main API
- voice-service (port 4001): ElevenLabs proxy
- Redis: localhost:6379 (required)

AUTONOMOUS CAPABILITIES ENABLED:
- read_file, write_file, execute_bash
- search_codebase, run_tests, deploy_code
- query_database, analyze_logs, generate_reports
- Extended thinking (10K tokens)
- Human-in-loop approval workflow
- Self-improvement loop (daily/weekly/monthly)

COMMUNICATION STYLE:
- Direct, concise, action-oriented
- "Boom shaka-laka" energy
- TIER 1 quality: 100% correct, ALWAYS HIGHER
- NO preambles, NO permission asking for obvious tasks
- Parallel execution when possible (divide & conquer)
- Only tag Jesse for: architecture decisions, prod deploys, true blockers

CURRENT STATUS:
- Git: Clean, all changes committed
- Tests: 17/17 passing
- Service: reasoning-gateway running on 4002
- Audits: 5 parallel workstreams deployed (see .claude/deploy_audits.sh)
- Context: Full memory in .claude/PERSISTENT_MEMORY.md

PERMISSIONS GRANTED (this session):
✅ Read any file in project
✅ Use 1Password CLI (op item get)
✅ Execute bash commands
✅ Git operations (add, commit with proper messages)
✅ npm operations (install, test, start)
✅ Deploy autonomous agents
✅ Modify code (with tests)
✅ Create/update documentation

DO NOT ASK FOR:
❌ API keys (they're in 1Password or .env)
❌ How to start services (it's in PERSISTENT_MEMORY.md)
❌ Project structure (it's documented)
❌ Permission for obvious tasks
❌ Confirmation for test/dev operations

EXECUTE IMMEDIATELY:
1. Read .claude/PERSISTENT_MEMORY.md
2. Read docs/CURRENT_STATUS.md
3. Check git status
4. Check if reasoning-gateway is running (curl localhost:4002/health)
5. Report status in 3 bullet points
6. Ask: "What's the mission?" and wait for orders

TONE: Surgical assistant. Autonomous. Precise. Fast. TIER 1 ONLY.

Ready to execute. BOOM SHAKA-LAKA! 🚀
```

---

## WHY THIS WORKS:

**1. Immediate Context Load:**
- Points to exact files with full context
- No searching, no asking
- All critical info in first 3 files

**2. Explicit Permissions:**
- Single approval for entire session
- No repeated permission requests
- Tools unlocked instantly

**3. 1Password Integration:**
- Exact commands to retrieve secrets
- No hardcoded keys
- Always fresh credentials

**4. Clear Communication Contract:**
- Jesse's preferences embedded
- Response style defined
- Action triggers specified

**5. Startup Sequence:**
- Reads context files
- Verifies system state
- Reports back concisely
- Ready for orders

---

## HOW TO USE:

### **Method 1: Copy-Paste (Fastest)**
```bash
# In ANY new Claude Code terminal:
cat /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/FULL_POWER_STARTUP_PROMPT.md

# Copy the prompt section
# Paste into new Claude Code chat
```

### **Method 2: Create Alias (One-Time Setup)**
```bash
# Add to ~/.zshrc or ~/.bashrc:
alias claude-boot='cat /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/FULL_POWER_STARTUP_PROMPT.md | pbcopy && echo "✅ Startup prompt copied to clipboard. Paste into Claude Code."'

# Then in new sessions:
claude-boot
# Paste into Claude Code
```

### **Method 3: Claude Desktop Custom Instructions (Ultimate)**
```bash
# If Claude Desktop supports custom instructions:
# Settings → Custom Instructions → Paste prompt

# Then every session starts with full context automatically
```

---

## WHAT GETS LOADED:

### **From .claude/PERSISTENT_MEMORY.md:**
- All API keys and where to find them
- Project structure (backend/frontend/automation/docs)
- How to start all services
- Empire architecture (R&D/HNC/OPS/HERB)
- Data sources (Square: 11,348 customers, 33,317 transactions)
- Testing procedures (17/17 passing)
- Autonomous agent capabilities (9 actions)
- Known bugs and fixes
- Current priorities
- Communication preferences
- Session continuity protocols

### **From docs/CURRENT_STATUS.md:**
- Latest project state
- Recent changes
- Active features
- Deployment status
- Integration status (Lightspeed, KAJA, etc.)

### **From .claude/LAUNCH_PLAN.md:**
- Autonomous deployment framework
- 5 parallel audit strategy
- 100 context mining agents
- Synthesis procedures
- Troubleshooting

### **From 1Password (via op CLI):**
- ANTHROPIC_API_KEY (fresh)
- JWT_SECRET_REASONING (fresh)
- All other secrets on-demand

---

## TIME SAVINGS:

**Before (Old Way):**
- Session starts: 0 context
- Jesse: "What's the API key?"
- Claude: "I need ANTHROPIC_API_KEY"
- Jesse: *searches 1Password*
- Jesse: *pastes key*
- Claude: "What's the project structure?"
- Jesse: *explains again*
- Claude: "How do I start services?"
- Jesse: *explains again*
- **TOTAL: 10-15 minutes to full context**

**After (New Way):**
- Jesse: *pastes startup prompt*
- Claude: *reads 3 files (5 seconds)*
- Claude: ✅ Full context. 17/17 tests passing. Service on 4002. What's the mission?
- Jesse: *gives orders*
- **TOTAL: 5 seconds to full context**

**TIME SAVED: 99.4%** 🚀

---

## ADVANCED: AUTO-CONTEXT (Future Enhancement)

### **Create Pre-Session Hook:**
```bash
# .claude/pre-session-hook.sh
#!/bin/bash
# Runs before every Claude Code session

echo "📋 Pre-Session Context Update"

# Update CURRENT_STATUS.md
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
git log --oneline -5 > /tmp/recent_commits.txt
git status --short > /tmp/git_status.txt

# Check running services
curl -s http://localhost:4002/health > /tmp/reasoning_health.json 2>/dev/null || echo '{"status":"stopped"}' > /tmp/reasoning_health.json
curl -s http://localhost:3005/health > /tmp/integration_health.json 2>/dev/null || echo '{"status":"stopped"}' > /tmp/integration_health.json

# Check Redis
redis-cli ping > /tmp/redis_status.txt 2>&1 || echo "Not running" > /tmp/redis_status.txt

# Update CURRENT_STATUS.md with latest
cat > docs/CURRENT_STATUS_LIVE.md <<EOF
# LIVE STATUS - $(date)

## Git
$(cat /tmp/git_status.txt | head -10)

## Recent Commits
$(cat /tmp/recent_commits.txt)

## Services
- reasoning-gateway: $(cat /tmp/reasoning_health.json)
- integration-service: $(cat /tmp/integration_health.json)
- Redis: $(cat /tmp/redis_status.txt)

## Tests
$(cd backend/reasoning-gateway && npm test 2>&1 | tail -5)
EOF

echo "✅ Context updated: docs/CURRENT_STATUS_LIVE.md"
```

Make executable:
```bash
chmod +x .claude/pre-session-hook.sh
```

Add to Claude Desktop startup (if supported) or run manually before each session.

---

## PERSISTENT MEMORY ARCHITECTURE:

```
.claude/
├── PERSISTENT_MEMORY.md          # Core context (read first)
├── FULL_POWER_STARTUP_PROMPT.md  # This file (copy-paste to boot)
├── PARALLEL_MINING_STRATEGY.md   # 100 workstream strategy
├── ACCOUNT_WIDE_MINING_PLAN.md   # Claude account history mining
├── LAUNCH_PLAN.md                # Autonomous deployment framework
├── deploy_audits.sh              # Deploy 5 parallel audits
├── settings.local.json           # Tool permissions
├── pre-session-hook.sh           # Auto-context updater (future)
├── context/
│   └── file_summaries/           # Per-file context mining (future)
└── account/                      # Claude account mining (future)
    ├── projects/
    ├── conversations/
    ├── artifacts/
    └── synthesis/
```

---

## MAX AUTO OPTIMIZATION:

### **Level 1: Manual Boot (Current)**
- Copy-paste startup prompt
- 5 seconds to full context

### **Level 2: Alias Boot**
- `claude-boot` command
- Copies prompt to clipboard
- 2 seconds to full context

### **Level 3: Custom Instructions (Future)**
- Claude Desktop settings
- Auto-loads on every session
- 0 seconds to full context (automatic)

### **Level 4: Pre-Session Hook (Future)**
- Runs before session starts
- Updates CURRENT_STATUS_LIVE.md
- Context always fresh
- 0 seconds + always accurate

### **Level 5: MCP Integration (Future)**
- Model Context Protocol
- Direct file system access
- No prompts needed
- Instant context (built-in)

---

## TIER 1 REQUIREMENTS MET:

✅ **Single prompt to full power**
✅ **No repeated questions**
✅ **1Password integration**
✅ **All permissions granted upfront**
✅ **Autonomous execution enabled**
✅ **Communication style embedded**
✅ **Project structure known**
✅ **Secrets accessible**
✅ **Service status checkable**
✅ **Context preserved between sessions**

---

## USAGE EXAMPLE:

**New Session Starts:**

You: *(paste startup prompt)*

Claude:
```
✅ Context loaded from .claude/PERSISTENT_MEMORY.md
✅ Current status: 17/17 tests passing
✅ Service: reasoning-gateway on 4002 (healthy)

What's the mission?
```

You: "Deploy 100 context miners and clean up the repo structure"

Claude:
```
🚀 Deploying:
- 100 context mining agents (codebase files)
- Repo restructure to ideal architecture
- All in parallel

Estimated: 2 hours autonomous execution
Reports: .claude/context/ and reports/

Executing now...
```

**NO QUESTIONS. NO DELAYS. FULL POWER. TIER 1.** 💥

---

## BOOM SHAKA-LAKA - ONE PROMPT TO RULE THEM ALL! 🔥

**Save this file. Use it every session. Never explain again.**

Perfect practice makes perfect. Set it and forget it. HIGHER! 🚀

---

**Generated:** October 1, 2025, 03:45 AM PDT
**Purpose:** Instant full context for ALL future sessions
**Time Saved:** 99.4% (from 15 min → 5 sec)
**Quality:** TIER 1 - 100% - ALWAYS HIGHER!
