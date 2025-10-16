### Worker Performance

**File**: `/backend/reasoning-gateway/src/workers/deepseek-processor.js`

**Processing Flow:**

```
Job Received
  ↓
Guardrails Check (~50-100ms) (line 65)
  ↓
Memory Enrichment (~100-200ms) (lines 77-91) [if enabled]
  ↓
DeepSeek API Stream (~500-2000ms) (lines 96-104)
  ↓
Memory Learning (~50-100ms) (lines 118-136) [if enabled]
  ↓
Job Complete
```

**Total Latency**: 700-2400ms per reasoning job

**Optimization Opportunities:**

1. Parallel guardrails + memory fetch (save 50-100ms)
2. Stream response to client before learning phase (improve perceived latency)
3. Cache common reasoning patterns (product recommendations, compliance queries)
