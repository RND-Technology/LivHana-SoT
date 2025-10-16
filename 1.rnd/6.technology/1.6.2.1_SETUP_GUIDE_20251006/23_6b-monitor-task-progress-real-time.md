### **6B. Monitor Task Progress (Real-Time)**

```bash
# Replace {taskId} with actual taskId from above
curl -N "http://localhost:4002/api/autonomous/stream/{taskId}" \
  -H "Authorization: Bearer $TOKEN"
```

**What You'll See:**

```
data: {"type":"analysis","content":"Analyzing task requirements..."}
data: {"type":"plan","steps":2}
data: {"type":"step","step":1,"action":"write_file","target":"hello.txt"}
data: {"type":"progress","completed":1,"total":2}
data: {"type":"complete","success":true,"changes":["hello.txt"]}
```
