# MCP Broker Validation Guide

**Purpose**: Validate OpenAI Agent Builder → MCP Broker → LivHana-SoT integration
**Status**: ⚠️ SUPERSEDED - See OPENAI_AGENT_BUILDER_MCP_SETUP.md for correct approach
**Created**: 2025-10-17
**Updated**: 2025-10-17

---

## ⚠️ IMPORTANT CORRECTION

**This document contains outdated assumptions about direct MCP broker testing.**

**Use instead**: `docs/OPENAI_AGENT_BUILDER_MCP_SETUP.md`

### Key Corrections:
1. ❌ Token prefix `op_` → ✅ Token prefix `ops_` (OpenAI Platform Service)
2. ❌ Direct curl testing → ✅ Test through OpenAI Agent Builder only
3. ❌ `/health` endpoint → ✅ Use `/mcp/invoke` via Agent Builder
4. ❌ Confusion between "ops" token and OPS Layer → ✅ Clear distinction

---

---

## 🎯 Quick Start

### Option 1: Quick Test (Recommended First)

```bash
# 1. Get your MCP broker token from 1Password
#    Open 1Password app → Search for "MCP" or "broker"
#    Copy the token (should start with 'op_')

# 2. Set environment variable
export MCP_BROKER_TOKEN='op_YOUR_TOKEN_HERE'

# 3. Run quick test
cd ~/LivHana-Trinity-Local/LivHana-SoT
./scripts/test-mcp-broker-quick.sh
```

### Option 2: Full Test (With 1Password CLI)

```bash
# 1. Sign into 1Password CLI
op signin

# 2. Find your token item
op item list | grep -i mcp

# 3. Get the reference path (example)
# op://LivHana-Ops-Keys/MCP_BROKER_TOKEN/credential

# 4. Update test script with correct path
# Edit scripts/test-mcp-broker.sh line 9 with your path

# 5. Run full test
./scripts/test-mcp-broker.sh
```

---

## 🔧 MCP Broker Configuration

### Current Setup (from your screenshot)

**MCP Broker Details:**
- **URL**: `https://mcp-broker-prod-9809f04432sl.us-central1.run.app`
- **Endpoint**: `/mcp/invoke` (Cloud Run service)
- **Authentication**: Bearer token (prefix: `op_`)
- **Service Account**: `op_sa_mcp`

**OpenAI Agent Builder:**
- **Agent Name**: `LivHana.Ingest`
- **Model**: `gpt-5-pro-2025-10-06`
- **Mode**: Planning-only (correct for orchestration layer)
- **Tool Approval**: Enabled (safety first)

---

## 🧪 Test Scenarios

### Test 1: Health Check
**Purpose**: Verify MCP broker is running and accessible
**Expected**: HTTP 200 response with health status

```bash
curl -H "Authorization: Bearer $MCP_BROKER_TOKEN" \
  https://mcp-broker-prod-9809f04432sl.us-central1.run.app/health
```

**Success Criteria**:
- HTTP 200 status
- JSON response with service health
- Response time < 2 seconds

### Test 2: List Available Tools
**Purpose**: Verify MCP tools are configured
**Expected**: List of available tools (sot_read, sot_write, etc.)

```bash
curl -H "Authorization: Bearer $MCP_BROKER_TOKEN" \
  -H "Content-Type: application/json" \
  https://mcp-broker-prod-9809f04432sl.us-central1.run.app/tools
```

**Expected Tools** (from your architecture):
- `sot_read` - Read files from LivHana-SoT
- `sot_write` - Create/update files in LivHana-SoT
- `sot_pr_create` - Submit changes via pull request
- `sot_changelog_append` - Enforce changelog discipline
- `glue_index_validate` - Check cross-layer references
- `layer_boundary_check` - Prevent R&D/HNC/OPS pollution
- `canonical_verify` - Ensure single SoT per claim
- `evidence_log` - Write to .evidence/ directory
- `coa_validate` - Check COAs against NIST standards
- `age_gate_verify` - Ensure 21+ compliance in outputs
- `hnc_episode_generate` - Trigger episode production
- `rpm_decompose` - Break RPM into actionable tasks
- `calendar_block` - Schedule massive action items
- `alloydb_query` - Read from backend databases
- `alloydb_write` - Persist state changes
- `leafly_sync` - Trigger Lightspeed → Leafly sync

### Test 3: Invoke MCP Tool
**Purpose**: Test actual tool execution
**Expected**: Successful tool invocation with response

```bash
curl -X POST \
  -H "Authorization: Bearer $MCP_BROKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method": "sot_read", "params": {"path": "docs/INDEX.md"}}' \
  https://mcp-broker-prod-9809f04432sl.us-central1.run.app/mcp/invoke
```

**Success Criteria**:
- HTTP 200 status
- Returns content of docs/INDEX.md
- No authentication errors

---

## 🏗️ Architecture Validation

### Verified Components

**Repository Structure** ✅
```
LivHana-SoT/
├── backend/              # API layer, AlloyDB integration
├── frontend/             # Admin dashboards
│   └── vibe-cockpit/     # Real-time monitoring
├── automation/           # Task orchestration
├── empire/
│   ├── content-engine/   # HNC episode generation (142 files)
│   │   ├── text-video-generator.js
│   │   ├── visual-generator.js
│   │   └── voice-generator.js
│   └── cockpit/          # Empire command center
├── docs/                 # Documentation (43 files)
│   ├── INDEX.md          # Documentation hub
│   ├── RPM_WEEKLY_PLAN_OCT4-12_2025.md
│   └── [more docs...]
├── .evidence/            # Compliance audit trails
│   ├── 2025-10-03/
│   ├── 2025-10-04/
│   └── 2025-10-05/
├── scripts/              # Deployment automation
└── infra/                # GCP infrastructure as code
```

**Git Remote** ✅
```
origin  git@github.com:RND-Technology/LivHana-SoT.git (fetch)
origin  git@github.com:RND-Technology/LivHana-SoT.git (push)
```

### Missing (Need Creation)

**Meta Source of Truth Files** ⏳
- `docs/gpt_master_canvas_updated.md` - Meta SoT (you mentioned this)
- `docs/glue_index.md` - Cross-layer references (INDEX.md serves similar purpose)
- `docs/ops_policy_glossary.md` - OPS policy definitions
- `docs/TERPWORKS_MAX_AUTOMATION_BLUEPRINT.md` - B2B wholesale automation

**Note**: These may exist in a different branch or location. If they're critical for MCP broker access, we should create them.

---

## 🔐 Security Considerations

### Bearer Token Management ✅
- **Storage**: 1Password vault (correct)
- **Format**: `op_` prefix (service account pattern)
- **Scope**: MCP broker access only
- **Rotation**: Should be rotated periodically

### Best Practices
1. **Never commit tokens** to git
2. **Use environment variables** for local testing
3. **Use 1Password CLI** for production
4. **Rotate tokens** quarterly or on suspected compromise
5. **Monitor access logs** in GCP Cloud Run

---

## 🚦 Validation Checklist

### Pre-Flight Checks
- [ ] 1Password CLI installed (`brew install --cask 1password-cli`)
- [ ] Signed into 1Password (`op signin`)
- [ ] MCP broker token accessible
- [ ] Token format verified (`op_*` prefix)
- [ ] LivHana-SoT repository cloned and up-to-date

### Connection Tests
- [ ] Health check passes (HTTP 200)
- [ ] Tools list retrieves successfully
- [ ] Tool invocation works (`sot_read`)
- [ ] Authentication validated (no 401/403 errors)

### Repository Access
- [ ] Git remote points to RND-Technology/LivHana-SoT
- [ ] All canonical directories exist
- [ ] Critical files accessible (docs/INDEX.md, etc.)
- [ ] Evidence logging directory present

### OpenAI Agent Builder Config
- [ ] MCP broker URL configured
- [ ] Bearer token added
- [ ] Tool approval gates enabled
- [ ] GPT-5 Pro model selected
- [ ] Test query executed successfully

---

## 🧪 End-to-End Test Case

### Test: RPM Planning Query

**Objective**: Validate full OpenAI Agent Builder → MCP Broker → LivHana-SoT flow

**Steps**:
1. Open OpenAI Agent Builder
2. Select `LivHana.Ingest` agent
3. Enter test query:
   ```
   Read docs/INDEX.md and summarize the documentation structure.
   Then check docs/RPM_WEEKLY_PLAN_OCT4-12_2025.md and extract
   the top 3 priorities for this week.
   ```

**Expected Behavior**:
1. Agent Builder sends MCP request to broker
2. MCP broker authenticates with bearer token
3. Broker invokes `sot_read` tool for docs/INDEX.md
4. Broker invokes `sot_read` tool for docs/RPM_WEEKLY_PLAN_OCT4-12_2025.md
5. Agent receives file contents
6. Agent processes and responds with summary + top 3 priorities

**Success Criteria**:
- ✅ No authentication errors
- ✅ Files retrieved successfully
- ✅ Response includes accurate document summary
- ✅ Top 3 priorities extracted correctly
- ✅ Response time < 10 seconds
- ✅ Evidence logged to .evidence/2025-10-17/

---

## 📊 Monitoring & Debugging

### GCP Cloud Run Logs

View MCP broker logs:
```bash
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=mcp-broker-prod" \
  --limit 50 \
  --format json \
  --project reggieanddrodispensary
```

### Common Issues

**Issue 1: 401 Unauthorized**
- **Cause**: Invalid or expired bearer token
- **Fix**: Regenerate token in 1Password, update environment variable

**Issue 2: 404 Not Found (tools endpoint)**
- **Cause**: MCP broker may use different endpoint structure
- **Fix**: Try `/mcp/invoke` with `{"method": "tools/list"}` payload

**Issue 3: 500 Internal Server Error**
- **Cause**: MCP broker crashed or misconfigured
- **Fix**: Check GCP Cloud Run logs, restart service if needed

**Issue 4: Tool invocation fails**
- **Cause**: LivHana-SoT repository access issue
- **Fix**: Verify GitHub credentials in MCP broker environment variables

---

## 📁 Related Files

**Test Scripts**:
- `scripts/test-mcp-broker.sh` - Full automated test (requires 1Password CLI)
- `scripts/test-mcp-broker-quick.sh` - Quick test (uses env variable)

**Documentation**:
- `docs/AGENT_BUILDER_HANDOFF.md` - OpenAI Agent Builder setup guide
- `docs/INDEX.md` - Documentation hub (43 files indexed)
- `docs/RPM_WEEKLY_PLAN_OCT4-12_2025.md` - Current RPM plan

**Integration**:
- `docs/CHATGPT_FUSION_READY.md` - ChatGPT Team fusion system (parallel effort)
- `docs/CHAT_EXPORT_INSTRUCTIONS.md` - Chat history export guide

---

## 🚀 Next Steps

### Immediate (Priority 1)
1. Run quick connection test: `./scripts/test-mcp-broker-quick.sh`
2. Verify health check passes
3. Confirm bearer token authentication works

### Short-term (Priority 2)
1. Configure 1Password CLI for secure token access
2. Run full test suite: `./scripts/test-mcp-broker.sh`
3. Test end-to-end RPM query in OpenAI Agent Builder
4. Monitor GCP Cloud Run logs for successful invocations

### Medium-term (Priority 3)
1. Create missing Meta SoT files (gpt_master_canvas_updated.md, etc.)
2. Document actual MCP tool manifest (what tools are really available)
3. Set up automated monitoring/alerts for MCP broker health
4. Establish token rotation schedule

---

**Status**: ✅ Test scripts ready
**Blocker**: Need MCP broker bearer token for actual testing
**Owner**: Jesse Niesen (CEO)
**Last Updated**: 2025-10-17
