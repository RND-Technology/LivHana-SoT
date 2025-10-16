### 4. Test Basic Functionality

```bash
# In Terminal 3: Test with curl
export TOKEN="<get from scripts/generate-dev-token.js>"

# Get capabilities
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/autonomous/capabilities | jq .

# Submit a test task
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"task":"List the files in the current directory","requireApproval":false}' \
  http://localhost:4002/api/autonomous/execute | jq .
```

---
