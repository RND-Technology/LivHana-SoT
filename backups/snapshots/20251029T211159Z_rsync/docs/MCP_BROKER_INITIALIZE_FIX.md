# MCP Broker Initialize Fix - CRITICAL

**Problem**: Agent Builder fails with "Unable to load tools" because broker doesn't implement `initialize` method
**Impact**: Blocks all Agent Builder integration despite broker being operational
**Solution**: Add initialize handler (5-minute fix)

---

## 🚨 CURRENT STATE

### What Works ✅

```bash
# tools/list - Returns 3 tools
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  https://mcp-broker-prod-980910443251.us-central1.run.app/mcp/invoke \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Response:
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {"name": "get_compliance_status", ...},
      {"name": "query_inventory", ...},
      {"name": "legislative_monitor", ...}
    ]
  },
  "id": 1
}
```

```bash
# tools/call - Executes tools successfully
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  https://mcp-broker-prod-980910443251.us-central1.run.app/mcp/invoke \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_compliance_status","arguments":{"product_id":"TEST-001"}}}'

# Response:
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Compliance check for product TEST-001: Status COMPLIANT. THCa ≤0.3% Δ9 THC dry weight. COA verified."
      }
    ]
  },
  "id": 1
}
```

### What Fails ❌

```bash
# initialize - Method not found
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  https://mcp-broker-prod-980910443251.us-central1.run.app/mcp/invoke \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"AgentBuilder","version":"1"}}}'

# Response:
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32601,
    "message": "Method not found: initialize"
  },
  "id": 1
}
```

---

## 🔧 REQUIRED FIX

### Add Initialize Handler

The broker needs to implement the MCP initialize handshake. Here's the minimal implementation:

```python
# In your main.py or request handler:

def handle_mcp_request(request_data):
    method = request_data.get('method')

    # ADD THIS BLOCK:
    if method == 'initialize':
        return {
            'jsonrpc': '2.0',
            'result': {
                'protocolVersion': '2025-03-26',
                'capabilities': {
                    'tools': {},  # Broker supports tools
                },
                'serverInfo': {
                    'name': 'Reggie & Dro MCP Broker',
                    'version': '1.0.0'
                }
            },
            'id': request_data.get('id')
        }

    # EXISTING CODE:
    if method == 'tools/list':
        return {
            'jsonrpc': '2.0',
            'result': {
                'tools': [
                    # ... your existing tools ...
                ]
            },
            'id': request_data.get('id')
        }

    # ... rest of your handlers ...
```

### Expected Response Format

When Agent Builder calls `initialize`, broker must respond:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "protocolVersion": "2025-03-26",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "Reggie & Dro MCP Broker",
      "version": "1.0.0"
    }
  },
  "id": 1
}
```

---

## 📊 MCP Protocol Flow

### Current (Broken)

```
Agent Builder:
  1. POST initialize → ❌ Error -32601 "Method not found"
  2. [STOPS - doesn't try tools/list]

Result: "Unable to load tools" error in Agent Builder
```

### After Fix (Working)

```
Agent Builder:
  1. POST initialize → ✅ Success (capabilities exchanged)
  2. POST tools/list → ✅ Returns 3 tools
  3. POST tools/call → ✅ Executes tools

Result: Agent Builder shows 3 available tools, ready for use
```

---

## 🚀 DEPLOYMENT

### Option 1: Quick Patch (If you have source access)

1. Find broker source code (likely in Cloud Run service config)
2. Add initialize handler (code above)
3. Redeploy:

   ```bash
   gcloud run deploy mcp-broker-prod \
     --source . \
     --project reggieanddrodispensary \
     --region us-central1
   ```

### Option 2: Environment Variable Toggle (If broker has dynamic routing)

Some MCP brokers support enabling methods via env vars:

```bash
gcloud run services update mcp-broker-prod \
  --set-env-vars="ENABLE_INITIALIZE=true" \
  --project=reggieanddrodispensary \
  --region=us-central1
```

### Option 3: Update from Git (If broker is in a repo)

```bash
# Find broker repo
gcloud run services describe mcp-broker-prod \
  --region=us-central1 \
  --project=reggieanddrodispensary \
  --format="value(spec.template.metadata.annotations)"

# Look for source repository annotation
# Clone, update, redeploy
```

---

## 🧪 VERIFICATION

After deploying fix, test:

```bash
TOKEN=$(gcloud secrets versions access latest \
  --secret=op-service-account-token \
  --project=reggieanddrodispensary | tr -d '\n\r')

# Test initialize
curl -sS -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  https://mcp-broker-prod-980910443251.us-central1.run.app/mcp/invoke \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"AgentBuilder","version":"1"}}}' \
  | jq '.result.protocolVersion'

# Should return: "2025-03-26"
```

Then in Agent Builder:

1. Click "Update" on MCP config modal
2. Should see "3 tools loaded" (not "Unable to load tools")
3. Tools should appear in Agent Builder UI:
   - get_compliance_status
   - query_inventory
   - legislative_monitor

---

## 📁 WHERE IS BROKER SOURCE?

**Options to locate**:

1. **Check Cloud Run service description**:

   ```bash
   gcloud run services describe mcp-broker-prod \
     --region=us-central1 \
     --project=reggieanddrodispensary \
     --format=yaml
   ```

2. **Look for source repository**:

   ```bash
   # Check if deployed from Cloud Source Repositories
   gcloud source repos list --project=reggieanddrodispensary
   ```

3. **Check Cloud Build history**:

   ```bash
   gcloud builds list \
     --project=reggieanddrodispensary \
     --filter="tags:mcp-broker" \
     --limit=5
   ```

4. **Common locations**:
   - `~/mcp-broker/` (local development)
   - `~/broker/` (Jesse's convention)
   - Cloud Source Repositories
   - GitHub private repo

---

## ⏱️ TIME ESTIMATE

- **Find source**: 5 minutes
- **Add initialize handler**: 2 minutes
- **Deploy + test**: 3 minutes
- **Total**: 10 minutes

---

## 🎯 SUCCESS CRITERIA

**Before Fix**:

- ❌ Agent Builder: "Unable to load tools"
- ❌ initialize returns error -32601

**After Fix**:

- ✅ Agent Builder: "3 tools loaded"
- ✅ initialize returns success with capabilities
- ✅ Tools visible and invokable in Agent Builder UI

---

**Status**: ⏳ Awaiting broker source location
**Blocker**: Need to find broker code to add initialize handler
**ETA**: 10 minutes once source located
**Owner**: Jesse Niesen (CEO)
**Created**: 2025-10-17

**Rally Cry**: You were RIGHT - broker is operational, just missing one handshake method. 5 lines of code away from victory.
