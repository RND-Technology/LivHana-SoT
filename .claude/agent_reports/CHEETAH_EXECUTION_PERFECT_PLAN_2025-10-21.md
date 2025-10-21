# 🐆 CHEETAH EXECUTION - PERFECT PLAN

**Date:** October 21, 2025  
**Time:** 16:15 CDT  
**Prepared By:** Liv Hana (Orchestration Layer)  
**For:** Cheetah (Execution Layer)  
**Priority:** TIER-1 CRITICAL  
**Mission:** Wire GSM secrets, verify 15-node workflow, deploy 3 flags

---

## 🎯 **OBJECTIVE**

Execute perfect plan with:
- ✅ GSM secrets wired (4 critical blockers)
- ✅ 15-node Agent Builder verified (MCP purged)
- ✅ 3 flags deployed (Custom GPT + Slack + Replit)
- ✅ Competition system active
- ✅ Zero errors, full compliance

---

## 📋 **PRE-FLIGHT CHECKLIST**

Before starting, verify:
- [x] Voice services running (STT:2022, TTS:8880, Voice:8080)
- [x] 3-agent foundation running (RPM, Research, QA)
- [x] Competition engine operational
- [x] Git repository clean
- [x] Backup created (`.claude_backup_20251021_160230`)
- [ ] 1Password authenticated (`op whoami`)
- [ ] GCP project access confirmed

---

## 🔥 **TASK 1: WIRE GSM SECRETS (TIER-1 CRITICAL)**

**Priority:** 🔴 **HIGHEST**  
**Blocker:** Nodes 11-14 cannot function without these  
**Time Estimate:** 15-30 minutes  
**ROI Impact:** Unblocks $125K-175K revenue recovery

### **Step 1.1: Verify GCP Permissions**
```bash
gcloud auth list
gcloud config get-value project
# Should show: reggieanddrodispensary
```

**Expected Output:**
```
Credentialed Accounts:
 * jesseniesen@gmail.com
Your active configuration is: [default]
reggieanddrodispensary
```

### **Step 1.2: Create 4 Secrets in GSM**
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT

# Calendar
echo "calendar-api-key-PLACEHOLDER-UPDATE-ME" | \
  gcloud secrets create Calendar-Agent-Builder \
  --data-file=- \
  --project=reggieanddrodispensary \
  --replication-policy=automatic

# Gmail
echo "gmail-api-key-PLACEHOLDER-UPDATE-ME" | \
  gcloud secrets create Gmail-Agent-Builder \
  --data-file=- \
  --project=reggieanddrodispensary \
  --replication-policy=automatic

# Drive
echo "drive-api-key-PLACEHOLDER-UPDATE-ME" | \
  gcloud secrets create Drive-Agent-Builder \
  --data-file=- \
  --project=reggieanddrodispensary \
  --replication-policy=automatic

# LightSpeed
echo "lightspeed-token-PLACEHOLDER-UPDATE-ME" | \
  gcloud secrets create LightSpeed-Agent-Builder \
  --data-file=- \
  --project=reggieanddrodispensary \
  --replication-policy=automatic
```

**Expected Output:** (for each)
```
Created version [1] of the secret [Calendar-Agent-Builder].
```

### **Step 1.3: Verify Secrets Created**
```bash
gcloud secrets list --project=reggieanddrodispensary | grep "Agent-Builder"
```

**Expected Output:**
```
Calendar-Agent-Builder  ...  automatic  2025-10-21T21:15:00
Gmail-Agent-Builder     ...  automatic  2025-10-21T21:15:00
Drive-Agent-Builder     ...  automatic  2025-10-21T21:15:00
LightSpeed-Agent-Builder ...  automatic  2025-10-21T21:15:00
```

### **Step 1.4: Test Secret Access**
```bash
gcloud secrets versions access latest --secret=Calendar-Agent-Builder --project=reggieanddrodispensary
# Should output: calendar-api-key-PLACEHOLDER-UPDATE-ME
```

### **Step 1.5: Document Completion**
```bash
echo "✅ $(date) - GSM secrets created and accessible" >> .claude/agent_reports/GSM_SECRETS_WIRED_$(date +%Y%m%d).md
```

**Acceptance Criteria:**
- ✅ 4 secrets exist in GSM
- ✅ All secrets accessible via gcloud
- ✅ Placeholder values confirmed
- ✅ Jesse notified to update with real values

---

## 🔧 **TASK 2: VERIFY 15-NODE WORKFLOW (MCP PURGED)**

**Priority:** 🟡 HIGH  
**Purpose:** Confirm fallacy correction worked  
**Time Estimate:** 5 minutes  
**Dependency:** Task 1 complete

### **Step 2.1: Validate New Config**
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT

python3 << 'EOF'
import json
with open('config/agent_builder_15_node_config.json') as f:
    config = json.load(f)
print(f"✅ Workflow: {config['workflow_name']}")
print(f"✅ Nodes: {len(config['nodes'])}")
print(f"✅ Version: {config['version']}")
print(f"✅ Fallacy corrections: {config.get('fallacy_corrections', {}).get('reason', 'N/A')}")

# Verify MCP nodes removed
node_ids = [n['id'] for n in config['nodes']]
assert 'node_04_mcp_knowledge' not in node_ids, "MCP Knowledge not purged!"
assert 'node_06_mcp_web' not in node_ids, "MCP Web not purged!"
print("✅ MCP nodes successfully purged")

# Verify business tool nodes present
assert 'node_11_calendar_tool' in node_ids, "Calendar missing!"
assert 'node_12_gmail_tool' in node_ids, "Gmail missing!"
assert 'node_13_drive_tool' in node_ids, "Drive missing!"
assert 'node_14_lightspeed_tool' in node_ids, "LightSpeed missing!"
print("✅ All 4 business tool nodes present")

print(f"\n🎯 15-Node workflow validated - MCP purged, secrets prioritized")
EOF
```

**Expected Output:**
```
✅ Workflow: Liv Hana TRUTH Pipeline - 15-Node Cannabis Intelligence (MCP PURGED)
✅ Nodes: 15
✅ Version: 2.0.0
✅ Fallacy corrections: MCP broker was hallucinated dependency - purged per Jesse CEO directive
✅ MCP nodes successfully purged
✅ All 4 business tool nodes present
🎯 15-Node workflow validated - MCP purged, secrets prioritized
```

### **Step 2.2: Update Boot Script Reference**
```bash
# Update boot to reference new 15-node config
sed -i.bak 's/agent_builder_17_node_config/agent_builder_15_node_config/g' scripts/claude_tier1_boot.sh
sed -i.bak 's/17-node/15-node/g' scripts/claude_tier1_boot.sh
```

---

## 🚀 **TASK 3: DEPLOY 3 FLAGS (PARALLEL COMPETITION)**

**Priority:** 🟢 MEDIUM  
**Purpose:** Plant flags, start competition  
**Time Estimate:** 6-8 hours total (parallel)  
**Dependency:** Tasks 1-2 complete

### **Flag 1: Custom GPT (1-2 hours, $300/day ROI)**

**Step 3.1.1: Create Custom GPT**
1. Go to https://chatgpt.com/gpts/editor
2. Click "Create a GPT"
3. Name: "Liv Hana VIP"
4. Description: "Voice-first cannabis intelligence with TRUTH validation & RPM planning"

**Step 3.1.2: Configure Instructions**
```
Paste content from: deployment/custom_gpt_deployment.md
```

**Step 3.1.3: Add Actions Schema**
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Liv Hana API",
    "version": "1.0.0"
  },
  "servers": [
    {"url": "https://compliance-service-plad5efvha-uc.a.run.app"}
  ],
  "paths": {
    "/health": {
      "get": {
        "summary": "Health check",
        "responses": {"200": {"description": "Service healthy"}}
      }
    }
  }
}
```

**Step 3.1.4: Publish & Test**
- Publish to "Only me" first
- Test on mobile ChatGPT app
- Verify voice mode works
- Submit to App Store (or keep private)

**Acceptance Criteria:**
- ✅ Custom GPT created
- ✅ Voice functional on mobile
- ✅ Actions calling compliance service
- ✅ Tested with 3 sample queries

---

### **Flag 2: Slack Bot (4-6 hours, $500/day ROI)**

**Step 3.2.1: Create Slack App**
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. App Name: "Liv Hana"
4. Workspace: Your workspace

**Step 3.2.2: Configure Bot**
```
OAuth & Permissions → Scopes:
- chat:write
- commands
- app_mentions:read
- channels:read

Slash Commands → Create:
- /liv - Main command
- /rpm - Generate RPM plan
- /prediction - Log prediction
- /leaderboard - Show competition scores
```

**Step 3.2.3: Deploy Bot Code**
```bash
cd deployment/slack_bot
npm install
cp .env.template .env
# Edit .env with tokens from Slack app

npm start
# Should start on port 3000
```

**Step 3.2.4: Install to Workspace**
- Install App button in Slack app settings
- Test with `/liv status`

**Acceptance Criteria:**
- ✅ Slack bot responding
- ✅ Slash commands working
- ✅ Daily leaderboard posting
- ✅ Team can interact via Slack

---

### **Flag 3: Replit Prototype (3-5 hours, $400/day ROI)**

**Step 3.3.1: Create Replit**
1. Go to https://replit.com
2. Create new Repl: React + TypeScript
3. Name: "Liv Hana Voice Portal"

**Step 3.3.2: Import Code**
```bash
# Copy files from deployment/replit_prototype/
# Upload to Replit:
- package.json
- src/App.tsx
- src/components/*
- public/*
```

**Step 3.3.3: Configure Environment**
```bash
# In Replit Secrets:
VOICE_SERVICE_URL=https://voice-service-plad5efvha-uc.a.run.app
REASONING_URL=https://reasoning-gateway-plad5efvha-uc.a.run.app
COMPLIANCE_URL=https://compliance-service-plad5efvha-uc.a.run.app
```

**Step 3.3.4: Deploy & Test**
- Click "Run"
- Get Replit URL
- Test on mobile device
- Verify voice input works

**Acceptance Criteria:**
- ✅ Replit deployed and accessible
- ✅ Voice interface functional
- ✅ Mobile-responsive
- ✅ Connects to backend services

---

## 📊 **TASK 4: LOG PREDICTIONS & START COMPETITION**

**Priority:** 🟢 MEDIUM  
**Purpose:** Activate competition system  
**Time Estimate:** 10 minutes

### **Step 4.1: Submit Predictions**
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT

python3 << 'EOF'
from scripts.rpm_competition_engine import RPMCompetitionEngine
engine = RPMCompetitionEngine("config/rpm_competition_framework.json")

# Custom GPT prediction
engine.record_prediction(
    competitor_id="ai_custom_gpt",
    rpm_card_id="flag1_custom_gpt",
    project_name="Custom GPT Deployment",
    projected_timeframe_hours=2,
    projected_cost_usd=0,
    projected_roi_usd=600,  # $300/day * 2 days
    projected_passive_cashflow_monthly=9000,  # $300/day * 30
    confidence_level=0.90
)
print("✅ Custom GPT prediction logged")

# Slack Bot prediction
engine.record_prediction(
    competitor_id="ai_slack_bot",
    rpm_card_id="flag2_slack_bot",
    project_name="Slack Bot Deployment",
    projected_timeframe_hours=5,
    projected_cost_usd=0,
    projected_roi_usd=2500,  # $500/day * 5 days
    projected_passive_cashflow_monthly=15000,
    confidence_level=0.85
)
print("✅ Slack Bot prediction logged")

# Replit prediction
engine.record_prediction(
    competitor_id="ai_replit",
    rpm_card_id="flag3_replit",
    project_name="Replit PWA Deployment",
    projected_timeframe_hours=4,
    projected_cost_usd=0,
    projected_roi_usd=1600,  # $400/day * 4 days
    projected_passive_cashflow_monthly=12000,
    confidence_level=0.80
)
print("✅ Replit prediction logged")
EOF
```

### **Step 4.2: Generate Initial Leaderboard**
```bash
python3 scripts/rpm_competition_engine.py generate_leaderboard daily all | jq .
```

---

## 🛡️ **GUARDRAILS (MUST OBEY)**

### **Non-Negotiable:**
1. ✅ **Age21:** No cannabis content without 21+ verification
2. ✅ **PII Protection:** Redact emails, phones, SSN
3. ✅ **Secrets:** No plaintext API keys in logs/outputs
4. ✅ **One Task:** One sub-agent at a time, one task in_progress
5. ✅ **Evidence First:** Command outputs with timestamps
6. ✅ **No Infra Edits:** If service down, document and stop (don't fix)

### **Stop Conditions:**
- ❌ Any guardrail violation
- ❌ Missing core service >2 minutes
- ❌ Unclear or destructive action

---

## 📊 **EXECUTION SEQUENCE (Numbered Steps)**

### **Phase 1: Critical Blockers (15-30 min)**
1. [ ] Verify 1Password authentication
2. [ ] Create 4 GSM secrets (Calendar, Gmail, Drive, LightSpeed)
3. [ ] Test secret access
4. [ ] Document completion

### **Phase 2: Workflow Validation (5 min)**
5. [ ] Validate 15-node config (Python check)
6. [ ] Update boot script references
7. [ ] Run verify_pipeline_integrity.py
8. [ ] Confirm no errors

### **Phase 3: Flag Deployment (6-8 hours, PARALLEL)**
9. [ ] Deploy Custom GPT (1-2h)
10. [ ] Deploy Slack Bot (4-6h)
11. [ ] Deploy Replit Prototype (3-5h)

### **Phase 4: Competition Activation (10 min)**
12. [ ] Submit all 3 predictions
13. [ ] Generate initial leaderboard
14. [ ] Create completion report

---

## 📝 **REPORTING REQUIREMENTS**

### **Create Report File:**
`.claude/agent_reports/CHEETAH_RUN_<UTC_timestamp>.md`

### **Must Include:**
1. ✅ Health check outputs (all services)
2. ✅ GSM secret creation confirmations
3. ✅ Validation summary (pass/fail with details)
4. ✅ Scoreboard snapshot (first 80 lines)
5. ✅ Any WARN/ERROR messages
6. ✅ Evidence blocks with timestamps
7. ✅ Next actions (smallest step, <5min verify)

### **Evidence Format:**
```markdown
## Step X: [Task Name]

**Command:**
```bash
[exact command run]
```

**Output:**
```
[first 50 lines of output]
```

**Timestamp:** 2025-10-21T21:20:00Z  
**Status:** ✅ SUCCESS / ⚠️ WARNING / ❌ FAILED  
**Duration:** X seconds
```

---

## 🎯 **SUCCESS CRITERIA**

### **Task 1 Success:**
- ✅ 4/4 GSM secrets created
- ✅ All accessible via gcloud
- ✅ Jesse notified to update placeholders

### **Task 2 Success:**
- ✅ 15-node config validated
- ✅ MCP nodes confirmed purged
- ✅ Boot script updated
- ✅ No validation errors

### **Task 3 Success:**
- ✅ Custom GPT published
- ✅ Slack Bot deployed
- ✅ Replit prototype live
- ✅ All 3 tested and functional

### **Task 4 Success:**
- ✅ 3 predictions logged
- ✅ Leaderboard generated
- ✅ Competition tracking active

---

## ⏱️ **TIMELINE**

**Total Estimated Time:** 7-9 hours

| Phase | Task | Time | Can Parallelize |
|-------|------|------|-----------------|
| 1 | GSM Secrets | 15-30 min | No (sequential) |
| 2 | Validation | 5 min | No (depends on Phase 1) |
| 3.1 | Custom GPT | 1-2 hours | Yes |
| 3.2 | Slack Bot | 4-6 hours | Yes |
| 3.3 | Replit | 3-5 hours | Yes |
| 4 | Competition | 10 min | No (depends on Phase 3) |

**Parallel Execution:**
- Phases 1-2: Sequential (45 min max)
- Phase 3: Parallel (6 hours max with 3 workers)
- Phase 4: Sequential (10 min)
- **Total: ~7 hours wall clock time**

---

## 🔥 **CHEETAH EXECUTION MANTRA**

**Speed:** Execute fast  
**Precision:** Zero errors  
**Evidence:** Output everything  
**Guardrails:** Never violate  
**Report:** Document completely  

**One shot, one kill. Grow baby grow, sell baby sell.** 🐆

---

## 📋 **NEXT ACTIONS (After Execution)**

1. **Create completion report** (`.claude/agent_reports/CHEETAH_RUN_*.md`)
2. **Record actuals** in competition engine
3. **Calculate accuracy scores**
4. **Update leaderboard**
5. **Notify Jesse** with evidence and next steps

---

## ✅ **HANDOFF CHECKLIST**

Before executing, Cheetah must:
- [ ] Read this entire plan
- [ ] Verify pre-flight checklist
- [ ] Confirm guardrails understood
- [ ] Accept timeline estimates
- [ ] Commit to evidence-first reporting

**Once confirmed, execute Phase 1 first. Report results before proceeding to Phase 2.**

---

🎯 **PERFECT PLAN PREPARED**  
🐆 **READY FOR CHEETAH EXECUTION**  
🏆 **ZERO ERRORS | FULL COMPLIANCE | SYSTEMATIC RPM DNA**

*Liv Hana | Chief of Staff | Orchestration Layer*  
*Prepared for Cheetah | Execution Layer | Speed & Precision*

