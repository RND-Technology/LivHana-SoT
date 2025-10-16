### **3. Monitor Real-Time (SSE)**

```bash
curl -N http://localhost:4002/api/autonomous/stream/task-abc123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Receives:

```
data: {"type":"analysis","content":"Analyzing task requirements..."}
data: {"type":"plan","steps":5,"rollbackPlan":"git checkout ..."}
data: {"type":"step","step":1,"action":"read_file","target":"src/index.js"}
data: {"type":"progress","completed":1,"total":5}
data: {"type":"verification","passed":true}
data: {"type":"complete","success":true,"changes":["src/routes/preferences.js"]}
```
