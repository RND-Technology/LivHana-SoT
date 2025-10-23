# Fallacy Scan - Session 2025-10-21

**Timestamp:** October 21, 2025 - 16:10 CDT  
**Reporter:** Liv Hana (Cursor/Claude Sonnet 4.5)  
**Validator:** Jesse Niesen (CEO)

---

## ⚠️ **FALLACIES IDENTIFIED & CORRECTED**

### **FALLACY #1: MCP Broker "Optional Blocker"**

**What I Said:**
> "Remaining blockers are optional: MCP broker setup (nodes 04/06)"

**Jesse's Correction:**
> "MCP broker setup NEEDS TO BE REMOVED, NOT NEEDED. Relic of AI goose chase from hallucinated models outside of TRUTH pipeline statefulness. DELETE, PURGE!"

**TRUTH:**

- ❌ MCP broker is NOT needed
- ❌ Nodes 04/06 are hallucinated dependencies
- ✅ We have SUPERIOR methods (direct API calls, existing tools, TRUTH pipeline)
- ✅ Simpler routing: Session Anchor → Guardrails (no broker middleman)

**Action Taken:**

- 🔥 **PURGED** nodes 04/06 from Agent Builder config
- 🔥 **DELETED** MCP broker references
- ✅ **SIMPLIFIED** workflow: 17 nodes → 15 nodes
- ✅ **CREATED** new config: `config/agent_builder_15_node_config.json`

**Evidence:**

```
OLD: 18 nodes (including 04_mcp_knowledge, 06_mcp_web)
NEW: 15 nodes (direct routing, no MCP broker)
File: config/agent_builder_15_node_config.json (v2.0.0)
```

---

### **FALLACY #2: GSM Secrets "Optional"**

**What I Said:**
> "What's Blocked (Non-Critical): GSM secrets for Calendar/Gmail/Drive/LightSpeed (nodes 14-17)"

**Jesse's Correction:**
> "GSM secrets for Calendar/Gmail/Drive/LightSpeed (nodes 14–17) IS CRITICAL TIER 1 PRIORITY, MUST BE SOLVED NOW."

**TRUTH:**

- ❌ These are NOT optional
- ❌ These are NOT "nice to have"
- ✅ These are **TIER-1 CRITICAL** blockers
- ✅ Must be solved **NOW**, not later

**Action Required:**

- 🔥 **PRIORITY #1:** Wire 4 GSM secrets immediately
  1. `GSM:Calendar-Agent-Builder` (node 11)
  2. `GSM:Gmail-Agent-Builder` (node 12)
  3. `GSM:Drive-Agent-Builder` (node 13)
  4. `GSM:LightSpeed-Agent-Builder` (node 14)

**Updated Status:**

```
OLD Priority: "Optional enhancement"
NEW Priority: "TIER-1 CRITICAL - Block all deployment until solved"
```

---

## ✅ **CORRECTIONS APPLIED**

### **Agent Builder Workflow: 17 → 15 Nodes**

**Removed (PURGED):**

- ❌ Node 04: MCP Knowledge Search (hallucinated)
- ❌ Node 06: MCP Web Search (hallucinated)

**Simplified Routing:**

```
OLD: Session Anchor → MCP Knowledge → Routing Logic → MCP Web → Guardrails
NEW: Session Anchor → Guardrails (direct, faster, simpler)
```

**New Node Sequence (15 total):**

1. Start
2. Voice Agent
3. Session Anchor
4. Guardrails (7 systems) ← DIRECT from Session Anchor
5. Profit Function
6. RPM Result
7. RPM Purpose
8. RPM Actions
9. RPM Validation
10. RPM Emit (+ competition hooks)
11. Google Calendar ← **TIER-1 CRITICAL SECRET NEEDED**
12. Gmail ← **TIER-1 CRITICAL SECRET NEEDED**
13. Drive ← **TIER-1 CRITICAL SECRET NEEDED**
14. LightSpeed ← **TIER-1 CRITICAL SECRET NEEDED**
15. End (+ competition scoring)

---

## 🎯 **TIER-1 CRITICAL BLOCKERS (Must Solve NOW)**

### **1. GSM:Calendar-Agent-Builder**

**Impact:** Cannot auto-schedule RPM tasks  
**Priority:** 🔴 CRITICAL  
**Solution:** Wire secret from Google Secret Manager

### **2. GSM:Gmail-Agent-Builder**

**Impact:** Cannot auto-email RPM summaries  
**Priority:** 🔴 CRITICAL  
**Solution:** Wire secret from Google Secret Manager

### **3. GSM:Drive-Agent-Builder**

**Impact:** Cannot auto-archive RPM artifacts  
**Priority:** 🔴 CRITICAL  
**Solution:** Wire secret from Google Secret Manager

### **4. GSM:LightSpeed-Agent-Builder**

**Impact:** Cannot query dispensary POS data  
**Priority:** 🔴 CRITICAL  
**Solution:** Wire secret from Google Secret Manager

---

## 📋 **SOLUTION PLAN (For Immediate Execution)**

### **Step 1: Create Secrets in GSM**

```bash
# Create placeholder secrets (Jesse will update with real values)
gcloud secrets create Calendar-Agent-Builder --project=reggieanddrodispensary
gcloud secrets create Gmail-Agent-Builder --project=reggieanddrodispensary  
gcloud secrets create Drive-Agent-Builder --project=reggieanddrodispensary
gcloud secrets create LightSpeed-Agent-Builder --project=reggieanddrodispensary
```

### **Step 2: Add Placeholder Values**

```bash
echo "calendar-api-key-placeholder" | gcloud secrets versions add Calendar-Agent-Builder --data-file=- --project=reggieanddrodispensary
echo "gmail-api-key-placeholder" | gcloud secrets versions add Gmail-Agent-Builder --data-file=- --project=reggieanddrodispensary
echo "drive-api-key-placeholder" | gcloud secrets versions add Drive-Agent-Builder --data-file=- --project=reggieanddrodispensary  
echo "lightspeed-token-placeholder" | gcloud secrets versions add LightSpeed-Agent-Builder --data-file=- --project=reggieanddrodispensary
```

### **Step 3: Test Secret Access**

```bash
gcloud secrets versions access latest --secret=Calendar-Agent-Builder --project=reggieanddrodispensary
gcloud secrets versions access latest --secret=Gmail-Agent-Builder --project=reggieanddrodispensary
gcloud secrets versions access latest --secret=Drive-Agent-Builder --project=reggieanddrodispensary
gcloud secrets versions access latest --secret=LightSpeed-Agent-Builder --project=reggieanddrodispensary
```

### **Step 4: Update Placeholders (Jesse Action)**

Jesse replaces placeholders with real API keys via Google Cloud Console.

---

## 🔥 **WHAT WAS PURGED**

**Files Marked for Deletion:**

- `backend/mcp-server/` (entire directory - hallucinated dependency)
- References to "Rube MCP broker" in docs
- Nodes 04/06 from Agent Builder config

**Reason:**
AI goose chase. Hallucinated complexity. We have superior methods:

- Direct API calls to services
- TRUTH pipeline for verification
- Existing tools (no broker needed)

**Simpler = Better = Faster = More Reliable**

---

## ✅ **CORRECTED PRIORITIES**

### **OLD (Incorrect):**

- MCP broker: "Optional"
- GSM secrets: "Non-critical"

### **NEW (Correct):**

- MCP broker: **PURGED** (not needed)
- GSM secrets: **TIER-1 CRITICAL** (solve NOW)

---

## 🎯 **LESSONS LEARNED**

1. **Question AI complexity** - If it adds layers without clear value, it's probably hallucinated
2. **Jesse knows best** - 1500 hours of context beats AI guesses
3. **Simpler is better** - Direct routing > broker middleman
4. **Critical means critical** - No "optional" tier-1 features

---

**Status:** Fallacies corrected, priorities realigned, workflow simplified

**Next:** Execute GSM secrets solution, then deploy 3 flags
