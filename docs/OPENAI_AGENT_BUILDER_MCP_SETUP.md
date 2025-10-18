# OpenAI Agent Builder MCP Configuration Guide

**Purpose**: Configure OpenAI Agent Builder to use your MCP Broker for LivHana-SoT access
**Status**: Ready for configuration
**Created**: 2025-10-17

---

## 🎯 CORRECTED ARCHITECTURE

**IMPORTANT**: The MCP broker is NOT meant to be called directly from your local machine. It's designed to be called BY OpenAI Agent Builder.

```
┌─────────────────────┐
│   Your M4 Max       │ You work here, plan here
│   (Planning Layer)  │
└──────────┬──────────┘
           │ [Ask questions, give commands]
           ↓
┌─────────────────────┐
│ OpenAI Agent Builder│ Cloud AI planning brain
│ (LivHana.Ingest)    │ Model: gpt-5-pro-2025-10-06
└──────────┬──────────┘
           │ [Uses ops_* token]
           ↓
┌─────────────────────┐
│   MCP Broker        │ Service mesh hub
│   (Cloud Run)       │ mcp-broker-prod-9809f04432sl...
└──────────┬──────────┘
           │ [Invokes tools]
           ↓
┌─────────────────────┐
│  LivHana-SoT Repo   │ Canonical source of truth
│  (GitHub)           │ RND-Technology/LivHana-SoT
└──────────┬──────────┘
           │ [Cloned locally]
           ↓
┌─────────────────────┐
│   Your M4 Max       │ Execution happens here
│  (Execution Layer)  │ DeepSeek, local tools
└─────────────────────┘
```

---

## 🔑 Token Prefix Clarification

### ✅ CORRECT Token Format

**Prefix**: `ops_` (OpenAI Platform Service)
**Example**: `ops_eyJzaW...` (your token is CORRECT)

**NOT to be confused with**:
- ❌ `op_` (1Password item reference prefix)
- ❌ OPS Layer (One Plant Solution - advocacy business layer)

**Naming Convention**:
- `ops_*` = OpenAI Platform Service authentication token
- OPS = One Plant Solution (R&D, HNC, **OPS**, HERB business layers)

---

## 🔧 OpenAI Agent Builder Configuration

### Step 1: Access Agent Builder

1. Navigate to: https://platform.openai.com/agent-builder
2. Select or create agent: **LivHana.Ingest**
3. Ensure model is set to: **gpt-5-pro-2025-10-06**

### Step 2: Configure MCP Integration

**In Agent Builder settings**, add MCP server:

**Field Values**:
```
MCP Server Name:  LivHana-SoT Broker
MCP Server URL:   https://mcp-broker-prod-9809f04432sl.us-central1.run.app/mcp/invoke
Authentication:   Bearer Token
Bearer Token:     ops_eyJzaW... (your full token from 1Password)
```

**Important Settings**:
- ✅ Enable tool approval gates (safety first)
- ✅ Set mode to "Planning only" (correct for orchestration)
- ✅ Enable streaming for real-time responses

### Step 3: Test Connection

**In Agent Builder chat**, enter test query:

```
List available MCP tools and their descriptions.
```

**Expected Response**:
The agent should invoke the MCP broker and return a list of available tools:
- sot_read
- sot_write
- sot_pr_create
- evidence_log
- rpm_decompose
- (and others)

---

## 🧪 Test Scenarios

### Test 1: Read Repository File

**Query**:
```
Read the file docs/INDEX.md from LivHana-SoT and summarize
the documentation structure.
```

**Expected Behavior**:
1. Agent Builder sends MCP request to broker
2. Broker invokes `sot_read` tool with path: `docs/INDEX.md`
3. Broker returns file contents (43 documented files, Diátaxis structure)
4. Agent summarizes the documentation organization

**Success Criteria**:
- ✅ No authentication errors
- ✅ File contents retrieved
- ✅ Accurate summary provided

### Test 2: RPM Planning Query

**Query**:
```
Read docs/RPM_WEEKLY_PLAN_OCT4-12_2025.md and extract the
top 3 priorities for this week. Then check if there are any
related tasks in the backend/ directory that support these priorities.
```

**Expected Behavior**:
1. Broker reads RPM plan file
2. Agent extracts top 3 priorities
3. Broker scans backend/ for related files
4. Agent correlates priorities with implementation status

**Success Criteria**:
- ✅ RPM priorities extracted accurately
- ✅ Backend files identified correctly
- ✅ Correlation makes business sense

### Test 3: Cross-Layer Validation (Advanced)

**Query**:
```
I want to create a new HNC episode about Texas THC legislation.
Check if this violates any layer boundaries (R&D/HNC/OPS separation),
verify 21+ age gate compliance, and suggest 3 topics that align
with our advocacy goals without making medical claims.
```

**Expected Behavior**:
1. Broker invokes `layer_boundary_check` tool
2. Broker invokes `age_gate_verify` tool
3. Broker reads OPS policy documents
4. Agent synthesizes compliant topic suggestions

**Success Criteria**:
- ✅ Layer boundary validation passes
- ✅ Age gate compliance confirmed
- ✅ 3 compliant topics suggested
- ✅ No medical claims in suggestions

---

## ⚠️ Why Direct MCP Broker Testing Fails

### The 404 Error Explained

When you ran:
```bash
curl https://mcp-broker-prod-9809f04432sl.us-central1.run.app/health
```

You got HTTP 404 because:
1. **The `/health` endpoint doesn't exist** (or isn't exposed publicly)
2. **MCP broker is designed to be called BY OpenAI**, not by curl
3. **The actual endpoint is `/mcp/invoke`** and expects specific MCP protocol payloads

### Why You Can't Easily Test Locally

**Architecture Reality**:
- MCP broker expects requests from OpenAI's infrastructure
- OpenAI handles authentication, rate limiting, error handling
- Direct curl requests bypass OpenAI's request formatting
- MCP protocol requires specific JSON-RPC structure

**Analogy**:
Trying to curl the MCP broker directly is like trying to call a private internal API. It's designed to be called by OpenAI Agent Builder, which acts as the authorized client.

---

## 🚀 CORRECT Validation Approach

### ✅ DO THIS: Test Through Agent Builder

1. **Configure MCP in Agent Builder** (instructions above)
2. **Send test queries in Agent Builder chat**
3. **Monitor responses for MCP tool invocations**
4. **Check GCP Cloud Run logs** for broker activity

### ❌ DON'T DO THIS: Direct curl Testing

~~Curl the MCP broker health endpoint~~ ← Doesn't exist
~~Test with curl from local machine~~ ← Wrong architecture layer
~~Expect standard REST API endpoints~~ ← It's MCP protocol, not REST

---

## 📊 Monitoring & Debugging

### Check Agent Builder Activity

**In Agent Builder interface**:
- Look for "Tool calls" in conversation
- Verify MCP tool invocations appear
- Check for authentication errors

### Check GCP Cloud Run Logs

```bash
# View recent MCP broker logs
gcloud logging read \
  "resource.type=cloud_run_revision AND \
   resource.labels.service_name=mcp-broker-prod" \
  --limit 50 \
  --format json \
  --project reggieanddrodispensary \
  | jq '.[] | {timestamp, textPayload}'
```

### Check LivHana-SoT Repository Activity

```bash
# Check for recent commits from MCP broker
cd ~/LivHana-Trinity-Local/LivHana-SoT
git log --all --grep="MCP" --oneline -10

# Check evidence logs
ls -lt .evidence/2025-10-17/
```

---

## 🔐 Security Best Practices

### Token Management ✅

1. **Store in 1Password**: ✅ Already doing this
2. **Never commit to git**: ✅ Don't add to any files
3. **Rotate quarterly**: ⏰ Set calendar reminder
4. **Limit scope**: Token should only access MCP broker, nothing else

### Layer Boundary Enforcement ✅

**The MCP broker MUST enforce**:
- R&D/HERB content stays separate from OPS advocacy
- HNC satire content has clear disclaimers
- No medical claims in any layer
- Age gate (21+) enforced in all consumer-facing content

**Tool**: `layer_boundary_check` - validates before any file writes

---

## 📋 Configuration Checklist

### Pre-Configuration
- [x] MCP broker deployed to Cloud Run ✅
- [x] Bearer token generated (ops_* format) ✅
- [x] Token stored in 1Password ✅
- [x] LivHana-SoT repository accessible ✅

### Agent Builder Setup
- [ ] Navigate to OpenAI Agent Builder
- [ ] Create/select LivHana.Ingest agent
- [ ] Set model to gpt-5-pro-2025-10-06
- [ ] Add MCP server configuration
- [ ] Input MCP broker URL: `https://mcp-broker-prod-9809f04432sl.us-central1.run.app/mcp/invoke`
- [ ] Input bearer token: `ops_*` from 1Password
- [ ] Enable tool approval gates
- [ ] Save configuration

### Initial Testing
- [ ] Test 1: List available tools
- [ ] Test 2: Read docs/INDEX.md
- [ ] Test 3: Read RPM weekly plan
- [ ] Test 4: Cross-layer validation query
- [ ] Verify no authentication errors
- [ ] Check GCP Cloud Run logs for activity

---

## 🎯 Expected Tool Manifest

**From Jesse's architecture notes**, the MCP broker should provide these tools:

### Repository Operations
- `sot_read` - Read files from LivHana-SoT
- `sot_write` - Create/update files in LivHana-SoT
- `sot_pr_create` - Submit changes via pull request
- `sot_changelog_append` - Enforce changelog discipline

### Governance & Compliance
- `glue_index_validate` - Check cross-layer references
- `layer_boundary_check` - Prevent R&D/HNC/OPS pollution
- `canonical_verify` - Ensure single SoT per claim
- `evidence_log` - Write to .evidence/ directory
- `coa_validate` - Check COAs against NIST standards
- `age_gate_verify` - Ensure 21+ compliance in outputs

### Content & Planning
- `hnc_episode_generate` - Trigger episode production in empire/content-engine
- `rpm_decompose` - Break RPM into actionable tasks
- `calendar_block` - Schedule massive action items

### Backend Integration
- `alloydb_query` - Read from backend databases
- `alloydb_write` - Persist state changes
- `leafly_sync` - Trigger Lightspeed → Leafly sync

**Verification**: Send "List available tools" query in Agent Builder to confirm actual tool manifest.

---

## 📁 Related Documentation

- `docs/AGENT_BUILDER_HANDOFF.md` - Original Agent Builder notes
- `docs/MCP_BROKER_VALIDATION.md` - Initial validation attempt (corrected by this doc)
- `docs/INDEX.md` - LivHana-SoT documentation hub
- `.evidence/` - Compliance audit trails

---

## 🚨 FALLACY CORRECTIONS SUMMARY

### Corrected Fallacies:
1. ❌ Token prefix `op_` → ✅ Token prefix `ops_` (OpenAI Platform Service)
2. ❌ Direct MCP broker testing → ✅ Test through Agent Builder only
3. ❌ `/health` endpoint exists → ✅ Use `/mcp/invoke` via OpenAI
4. ❌ "ops" confused with OPS Layer → ✅ Clear distinction maintained

### Key Learnings:
- MCP broker is not a standalone REST API
- It's designed to be called by OpenAI Agent Builder
- Your `ops_*` token is correct format
- Validation happens through Agent Builder, not curl

---

**Status**: ✅ Architecture corrected, ready for Agent Builder configuration
**Blocker**: Need to configure Agent Builder with MCP broker URL + token
**Owner**: Jesse Niesen (CEO)
**Last Updated**: 2025-10-17

**Rally Cry**: Orchestration first, then scale. Your planning layer (Agent Builder) is ready to connect to your execution layer (M4 Max + LivHana-SoT).
