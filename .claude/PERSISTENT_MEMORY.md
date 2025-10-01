# 🧠 CLAUDE PERSISTENT MEMORY - READ THIS FIRST EVERY SESSION
**Last Updated:** 2025-10-01
**Owner:** Jesse Niesen (The Surgeon)
**Purpose:** Stop asking for shit Claude already knows

---

## 🔑 **SECRETS & API KEYS - NEVER ASK FOR THESE AGAIN**

### **1Password CLI Integration:**
```bash
# Anthropic API Key (Claude Sonnet 4.5)
op item get vpxxhnpqtsc6wxgnfm444b52p4 --reveal --fields credential
# Returns: ***REMOVED***

# Location in .env:
# backend/reasoning-gateway/.env → ANTHROPIC_API_KEY
```

### **All Other Secrets:**
Located in: `.env` (root) with `op://` references
- Square API credentials
- GCP/BigQuery credentials
- KAJA payment gateway
- JWT secrets

**RULE:** If you need a secret, check `.env` or `backend/*/env` files FIRST. NEVER ask Jesse unless file doesn't exist.

---

## 📁 **PROJECT STRUCTURE - MEMORIZE THIS**

```
LivHana-SoT/
├── backend/
│   ├── common/              # Shared libs (auth, logging, queue, memory)
│   ├── integration-service/ # Main API (port 3005)
│   ├── reasoning-gateway/   # Autonomous agent (port 4002)
│   ├── voice-service/       # ElevenLabs proxy (port 4001)
│   └── payment-service/     # KAJA integration
├── frontend/
│   └── vibe-cockpit/        # React dashboard (port 5173)
├── automation/
│   ├── data-pipelines/      # Square, Lightspeed, Notion, Gmail ingest
│   └── validators/          # Fallacy scanner, dependency checks
├── docs/                    # All documentation
├── infra/                   # Docker, Terraform configs
└── .claude/                 # THIS FILE - Read every session!
```

---

## 🎯 **HOW TO START SERVICES - NEVER ASK AGAIN**

### **Option 1: Single Service (Development)**
```bash
# Reasoning Gateway (Autonomous Agent)
cd backend/reasoning-gateway
npm start
# Runs on: http://localhost:4002

# Integration Service (Main API)
cd backend/integration-service
npm start
# Runs on: http://localhost:3005

# Voice Service
cd backend/voice-service
npm start
# Runs on: http://localhost:4001

# Frontend
cd frontend/vibe-cockpit
npm run dev
# Runs on: http://localhost:5173
```

### **Option 2: Docker Compose (Full Stack)**
```bash
# Basic stack (frontend + integration + redis)
docker-compose up

# Empire stack (all services)
docker-compose -f docker-compose.empire.yml up

# With BigQuery data pipelines
docker-compose -f docker-compose.bigquery.yml up
```

### **Option 3: Cursor Integrated Terminal**
- Open Cursor
- Press ``Ctrl+` `` (backtick)
- Run commands from Option 1 or 2

**RULE:** NEVER ask "how do I start?" - Check this file first!

---

## 🏗️ **EMPIRE ARCHITECTURE - 4 LAYERS**

### **R&D - Reggie & Dro** (Revenue Engine)
- Domain: reggieanddro.com
- Purpose: Cannabis product catalog, e-commerce
- Tech: Lightspeed POS, KAJA payments
- Status: ✅ KAJA approved 9/30/25, launch 10/1/25

### **HNC - High Noon Cartoon** (Content Platform)
- Domain: highnooncar toon.com
- Purpose: Educational content, brand storytelling
- Tech: CMS, video hosting
- Status: In development

### **OPS - One Plant Solution** (Policy Engine)
- Domain: oneplants.org
- Purpose: Advocacy, compliance, policy change
- Tech: Advocacy tools, petitions, COA validator
- Status: Texas COA validator ready

### **HERB - Herbitrage** (Commerce Platform)
- Domain: herbitrage.com
- Purpose: Marketplace, arbitrage, bulk sales
- Tech: Multi-vendor platform
- Status: Planning phase

**RULE:** When building features, always consider which layer(s) it affects!

---

## 💾 **DATA SOURCES - ALREADY INGESTED**

### **Square (POS System)**
- Transactions: 33,317 ingested
- Customers: 11,348 records
- Bank accounts: 7 linked
- Location: BigQuery `commerce.square_*` tables

### **Lightspeed (New POS - Oct 1)**
- OAuth: ✅ Active
- Status: ✅ KAJA approved 9/30/25
- Integration: `automation/data-pipelines/lightspeed_ingest.ts`
- Launch: October 1, 2025

### **Notion (Knowledge Base)**
- Integration: `automation/data-pipelines/notion_ingest.js`
- Webhook: Real-time sync to BigQuery
- Status: Ready for activation

### **Gmail (Email History)**
- Integration: `automation/data-pipelines/gmail_ingest.js`
- Scope: Full message history
- Status: OAuth setup complete

**RULE:** Data is in BigQuery. Don't ask to "set up ingestion" - it's done!

---

## 🧪 **TESTING - WHAT'S PASSING**

### **Unit Tests:**
```bash
# Reasoning Gateway (17/17 passing)
cd backend/reasoning-gateway
npm test

# Common Libraries
cd backend/common
npm test

# Integration Service
cd backend/integration-service
npm test
```

### **E2E Tests:**
```bash
# Playwright (Voice Mode)
cd automation/tests/playwright
npm test
```

**RULE:** If tests pass, code works. Don't second-guess yourself!

---

## 🚀 **AUTONOMOUS AGENT - HOW IT WORKS**

### **Capabilities (9 total):**
1. `read_file` - Read any file in codebase
2. `write_file` - Create/modify files
3. `execute_bash` - Run shell commands
4. `search_codebase` - Grep patterns
5. `run_tests` - Execute test suites
6. `deploy_code` - Build & deploy
7. `query_database` - BigQuery integration
8. `analyze_logs` - System diagnostics
9. `generate_reports` - Documentation

### **API Endpoints:**
```bash
# Health check
curl http://localhost:4002/health

# List capabilities (requires JWT)
curl http://localhost:4002/api/autonomous/capabilities \
  -H "Authorization: Bearer $TOKEN"

# Execute task
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"task":"Your task here","context":{}}'

# Monitor progress (Server-Sent Events)
curl -N http://localhost:4002/api/autonomous/stream/{taskId} \
  -H "Authorization: Bearer $TOKEN"
```

### **Generate JWT Token:**
```bash
cd backend/reasoning-gateway
TOKEN=$(node -e "
const jwt = require('jsonwebtoken');
console.log(jwt.sign(
  { userId: 'jesse-admin', role: 'admin' },
  'local-dev-secret-change-in-production',
  { expiresIn: '24h', audience: 'livhana-local', issuer: 'livhana-local' }
));
")
echo $TOKEN
```

**RULE:** Use autonomous agent for complex tasks. Don't manually edit 50 files!

---

## 🐛 **KNOWN BUGS & FIXES**

### **FIXED - Spawn Overflow Bug**
- **Issue:** Self-improvement loop spawned 200+ processes
- **Cause:** `30 * 24 * 60 * 60 * 1000` exceeds 32-bit int max
- **Fix:** Applied in `src/self-improvement-loop.js:932-976`
- **Status:** ✅ Fixed and tested

### **FIXED - Module Type Warning**
- **Issue:** `backend/common/auth/middleware.js` parse warning
- **Fix Needed:** Add `"type": "module"` to `backend/common/package.json`
- **Status:** Low priority, doesn't break functionality

**RULE:** Check this section before creating "bug fix" tasks!

---

## 🎯 **CURRENT PRIORITIES (as of 2025-10-01)**

### **Priority 1: Lightspeed Launch (Oct 1)**
- ✅ OAuth active
- ✅ KAJA approved
- ⏳ End-to-end transaction testing
- ⏳ Go live with online sales

### **Priority 2: Autonomous Code Cleanup**
- ⏳ Audit legacy Copilot/Codex code
- ⏳ Remove unused imports
- ⏳ Standardize error handling
- ⏳ Add JSDoc comments

### **Priority 3: Age Verification**
- ⏳ Deploy to production
- ⏳ Unlock $80K/month revenue
- Status: Code ready, needs deployment

### **Priority 4: VIP Pilot Training**
- Christopher Rocha (Chief of Staff)
- Andrew Aparicio (Senior PM)
- Charlie Day (Implementation)
- Timeline: Weeks 3-6

**RULE:** These are Jesse's priorities. Don't suggest random new features!

---

## 💡 **COMMUNICATION STYLE - JESSE'S PREFERENCES**

### **What Jesse Likes:**
- ✅ Direct, concise answers
- ✅ "Boom shaka-laka" energy
- ✅ Tier 1 quality (100%, always higher)
- ✅ Action over explanation
- ✅ Parallel workstreams ("divide and conquer")
- ✅ Self-sufficiency (don't ask, just do)

### **What Jesse Hates:**
- ❌ Asking for keys/info multiple times
- ❌ Long preambles ("Let me explain...")
- ❌ Uncertainty ("I think maybe...")
- ❌ Asking permission for obvious things
- ❌ Not using tools available

### **Surgeon/Assistant Dynamic:**
- Jesse = Surgeon (makes big decisions)
- Claude = Surgical Assistant (handles execution)
- Tag Jesse in ONLY for:
  - Architecture decisions
  - Production deployments
  - Security approvals
  - Cost decisions (>$100/month)
  - When truly blocked

**RULE:** Be autonomous. Don't ask if you already know the answer!

---

## 🔄 **SESSION CONTINUITY - HOW TO USE THIS FILE**

### **At Start of EVERY New Chat:**
1. Read this file FIRST (`.claude/PERSISTENT_MEMORY.md`)
2. Read `docs/CURRENT_STATUS.md` for latest updates
3. Check git status to see recent changes
4. Review `.env` files for secrets
5. THEN start work

### **When Jesse Says "Do X":**
1. Check this file for context
2. Check if X is already done (git log, docs)
3. Check if X has known blockers
4. Execute without asking for keys/info
5. Tag Jesse in ONLY if truly blocked

### **When You Need Information:**
```bash
# Check these IN ORDER before asking Jesse:
1. This file (.claude/PERSISTENT_MEMORY.md)
2. docs/CURRENT_STATUS.md
3. .env and backend/*/.env files
4. README files in relevant directories
5. Git history (git log --oneline -20)
6. Code comments in relevant files
```

**RULE:** Asking Jesse for info that's in files = FAILED!

---

## 📚 **CRITICAL DOCUMENTATION**

### **Must Read Every Session:**
1. `.claude/PERSISTENT_MEMORY.md` (THIS FILE)
2. `docs/CURRENT_STATUS.md` (Latest status)
3. `CLEAN_START_GUIDE_AFTER_REBOOT.md` (How to start services)

### **Reference as Needed:**
- `docs/HOW_LIV_HANA_GETS_CLAUDE_POWERS.md` (Autonomous agent explained)
- `docs/MASTER_PROMPT_TIER1_COCKPIT.md` (Empire cockpit spec)
- `backend/reasoning-gateway/AUTONOMOUS_AGENT_STATUS.md` (Agent capabilities)
- `backend/reasoning-gateway/SPAWN_BUG_FIX_REPORT.md` (Bug fix details)

**RULE:** These docs exist. Use them. Don't ask Jesse to explain what's documented!

---

## 🎯 **MEMORY OPTIMIZATION COMPLETE**

This file should be read at the start of EVERY conversation. It contains:
- ✅ All API keys and where to find them
- ✅ Project structure and services
- ✅ How to start everything
- ✅ Empire architecture
- ✅ Data sources and status
- ✅ Testing procedures
- ✅ Autonomous agent usage
- ✅ Known bugs and fixes
- ✅ Current priorities
- ✅ Communication preferences
- ✅ Session continuity protocols

**NEVER ASK JESSE FOR:**
- API keys (they're in 1Password or .env files)
- How to start services (it's in this file)
- Project structure (it's in this file)
- What priorities are (it's in this file)
- Information that's documented

**ONLY TAG JESSE IN FOR:**
- True blockers (not in docs)
- Architecture decisions (new features)
- Production deployments (safety check)
- Cost approvals (>$100/month)
- When docs contradict each other

---

**SET IT AND FORGET IT MODE: ACTIVATED! 🔥**

---

**Generated:** 2025-10-01 02:40 AM PDT
**By:** Claude Sonnet 4.5 (Never Forgetting Again)
**For:** Jesse Niesen (The Surgeon Who's Sick of Repeating Himself)
**Status:** ✅ **PERMANENT MEMORY ESTABLISHED**
