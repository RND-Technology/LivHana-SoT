### Step 3: Test Voice → Cursor → Liv Response

**Run this test:**

```bash
curl -X POST http://localhost:4002/api/reasoning/enqueue \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello Liv via Cursor Ultra","sessionId":"test"}'
```
