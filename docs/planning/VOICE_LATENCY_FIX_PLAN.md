# Voice Latency Fix Plan - From 20s to <2s (P50)

**Date**: 2025-10-30  
**Priority**: P0 - CEO Blocker  
**Owner**: Development Team  
**Status**: Planning Phase  

---

## Executive Summary

Current voice mode latency is ~20 seconds from user input to audio response. This is unacceptable for conversational AI. Target latency is <2 seconds (P50) to achieve "elastic voice" - fast, responsive, and interruptible.

**Root Cause**: BullMQ queue architecture introduces unnecessary latency. The system uses async job queuing for operations that should be synchronous.

**Proposed Solution**: Remove BullMQ queue from voice pipeline hot path and use direct HTTP calls to reasoning gateway.

**Estimated Time**: 4-6 hours implementation + 2 hours testing

---

## 1. Current Architecture Analysis

### Pipeline Flow
```
User Voice Input (Browser)
  ↓ (Speech-to-Text ~500ms)
Voice Service :8080 - POST /api/reasoning/enqueue
  ↓ (Queue write ~50ms)
Redis - BullMQ Queue "voice-mode-reasoning-jobs"
  ↓ (Queue polling ~5000ms - DEFAULT AUTOSCALER INTERVAL)
Reasoning Gateway :4002 - Worker picks up job
  ↓ (AI API call ~3-8s for Claude/OpenAI)
Redis - BullMQ Job completion
  ↓ (Queue polling by client ~500ms)
Voice Service - GET /api/reasoning/result/:jobId
  ↓ (Response assembly ~100ms)
Voice Service - POST /api/elevenlabs/synthesize
  ↓ (TTS generation ~1-3s, cached <100ms)
User hears response
```

**Total Latency Breakdown (Estimated)**:
- Speech-to-Text: ~500ms
- Queue enqueue: ~50ms
- **Queue polling interval: ~5000ms** ⚠️ MAJOR BOTTLENECK
- AI reasoning (Claude/GPT): ~3-8s
- Queue result polling: ~500ms
- TTS synthesis: ~1-3s (or <100ms cache hit)
- **Total: ~10-17s minimum, often 20s+**

### Key Files
- `/backend/voice-service/src/routers/reasoning-router.js` - Queue producer
- `/backend/reasoning-gateway/src/index.js` - Queue consumer + worker
- `/backend/reasoning-gateway/src/worker/autoScaler.ts` - Worker autoscaler
- `/backend/common/queue/index.js` - BullMQ queue utilities
- `/frontend/herbitrage-voice/public/app.js` - Frontend client

---

## 2. Root Cause Analysis

### Primary Bottleneck: Queue Architecture
The current architecture uses **asynchronous job queuing** for voice interactions. This introduces multiple sources of latency:

1. **Autoscaler Polling Interval** (Line 25, reasoning-gateway/src/index.js)
   ```javascript
   const AUTOSCALER_INTERVAL_MS = Math.max(1000, parseInt(process.env.REASONING_AUTOSCALER_INTERVAL_MS || '5000', 10));
   ```
   - Default: 5000ms (5 seconds)
   - Workers only check for new jobs every 5 seconds
   - This alone accounts for ~5s latency

2. **Worker Concurrency** (Line 28, reasoning-gateway/src/index.js)
   ```javascript
   const WORKER_CONCURRENCY = Math.max(1, parseInt(process.env.REASONING_WORKER_CONCURRENCY || '1', 10));
   ```
   - Default: 1 job at a time per worker
   - If another job is processing, voice jobs must wait

3. **Queue Round-Trip Overhead**
   - Write to Redis: ~20-50ms
   - Worker picks up: 0-5000ms (depending on poll timing)
   - Write result back: ~20-50ms
   - Client polls for result: ~100-500ms
   - **Total overhead: ~5-6s just for queue mechanics**

4. **No Priority Queue**
   - Voice jobs are treated same as batch jobs
   - No way to fast-track urgent voice interactions

### Secondary Issues

1. **Frontend Bypasses Queue in Production**
   - Line 167, `frontend/herbitrage-voice/public/app.js` calls `/api/v1/generate` directly
   - This is the RIGHT approach, but not documented
   - The queue-based reasoning router is unused in production

2. **Redis Connection Pattern**
   - Queue creation uses `createQueue()` which may create new connections per request
   - No explicit connection pooling visible in reasoning-router.js

3. **ElevenLabs TTS Has Good Caching**
   - 120s TTL cache with <100ms hit latency
   - This is working well, no changes needed here

### Evidence
- **Code Review**: Autoscaler polls every 5s (line 25, reasoning-gateway/src/index.js)
- **Frontend Code**: Direct API call to `/api/v1/generate` (line 167, app.js)
- **Architecture Doc**: README confirms "10-30 seconds" estimated processing time

---

## 3. Proposed Solution

### Strategy: Remove Queue from Hot Path

**Principle**: Voice interactions are synchronous, not batch jobs. Use direct HTTP for low latency.

### Architecture Change

**BEFORE** (Current - 20s latency):
```
User → Voice Service → Redis Queue → Worker Poll (5s) → AI API → Queue → Response
```

**AFTER** (Proposed - <2s latency):
```
User → Voice Service → Direct HTTP → AI API → Response
```

### Keep Queue for What It's For
- Background batch processing
- Non-urgent reasoning tasks
- Scheduled jobs
- Retries and error handling

### Voice Pipeline Should Be
- Direct HTTP to reasoning gateway
- Streaming responses where possible
- Priority routing for voice requests
- Connection pooling for Redis (cache only)

---

## 4. Implementation Plan

### Phase 1: Direct HTTP Endpoint (2-3 hours)

#### File: `/backend/voice-service/src/routers/reasoning-router.js`

**ADD NEW ENDPOINT** (after line 75):
```javascript
/**
 * POST /api/reasoning/chat
 * Direct synchronous reasoning for voice interactions
 * Target latency: <2s P50
 * 
 * Body:
 * {
 *   prompt: string (required),
 *   userId: string (optional),
 *   sessionId: string (optional),
 *   stream: boolean (optional, default: false)
 * }
 */
router.post('/chat', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { prompt, userId, sessionId, stream = false } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Direct HTTP call to reasoning gateway (no queue)
    const REASONING_GATEWAY_URL = process.env.REASONING_GATEWAY_BASE_URL || 'http://localhost:4002';
    
    const response = await fetch(`${REASONING_GATEWAY_URL}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        task_type: 'voice_interaction',
        max_budget: 0.01,
        metadata: {
          userId: userId || 'anonymous',
          sessionId: sessionId || `session-${Date.now()}`,
          source: 'voice-mode',
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Reasoning gateway error: ${errorText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    // Log performance metrics
    console.log(`✅ Voice reasoning completed in ${latency}ms`);

    res.json({
      success: true,
      result: data.result,
      model: data.model_used,
      latency_ms: latency,
      tokens: data.tokens,
      cost: data.cost,
      timestamp: data.timestamp
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`❌ Voice reasoning failed after ${latency}ms:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      latency_ms: latency
    });
  }
});
```

**UPDATE HEALTH ENDPOINT** (line 53):
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'voice-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      reasoning_direct: !!process.env.REASONING_GATEWAY_BASE_URL, // NEW
      reasoning_queue: !!process.env.REDIS_HOST, // Kept for batch jobs
      redis: !!process.env.REDIS_HOST
    },
    endpoints: {
      voice_chat: '/api/reasoning/chat', // NEW - Fast path
      queue_enqueue: '/api/reasoning/enqueue' // OLD - Batch jobs
    }
  });
});
```

### Phase 2: Frontend Integration (1 hour)

#### File: `/frontend/herbitrage-voice/public/app.js`

**REPLACE** lines 166-186 with:
```javascript
// Call voice-service direct endpoint (bypasses queue for low latency)
const reasoningResponse = await fetch(`${VOICE_SERVICE_URL}/api/reasoning/chat`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        prompt: text,
        userId: sessionStorage.getItem('userEmail'),
        sessionId: sessionId
    })
});

if (!reasoningResponse.ok) {
    const errorText = await reasoningResponse.text();
    throw new Error(`Reasoning failed: ${errorText}`);
}

const responseData = await reasoningResponse.json();
console.log(`Got reasoning response in ${responseData.latency_ms}ms:`, responseData.result);
const response = responseData.result;

// Log latency for monitoring
if (responseData.latency_ms > 2000) {
    console.warn(`⚠️ High latency: ${responseData.latency_ms}ms (target <2000ms)`);
}
```

### Phase 3: Reasoning Gateway Optimization (1 hour)

#### File: `/backend/reasoning-gateway/src/index.js`

**OPTIMIZE GENERATE ENDPOINT** (line 200-265):

1. **Add request prioritization** (after line 202):
```javascript
const { prompt, task_type = 'general', max_budget = 0.01, metadata = {} } = req.body;
const isVoiceRequest = task_type === 'voice_interaction' || metadata.source === 'voice-mode';
```

2. **Use faster model for voice** (replace lines 211-218):
```javascript
let model;
let client;

if (isVoiceRequest) {
  // Voice mode: Use fastest model
  model = 'gpt-4o-mini'; // ~1-2s latency
  client = openai;
} else if (task_type === 'code_generation' || max_budget >= 0.01) {
  // Complex tasks: Use smart model
  model = 'claude-3-sonnet';
  client = anthropic;
} else {
  // Default: Fast and cheap
  model = 'gpt-3.5-turbo';
  client = openai;
}
```

3. **Add response caching for voice** (after line 246):
```javascript
const latency = Date.now() - startTime;

// Log voice latency for monitoring
if (isVoiceRequest) {
  console.log(`🎙️ Voice request completed in ${latency}ms with ${model}`);
  if (latency > 2000) {
    console.warn(`⚠️ Voice latency SLA miss: ${latency}ms > 2000ms target`);
  }
}
```

### Phase 4: Connection Pooling (Optional, 1 hour)

If Redis connection overhead is significant:

#### File: `/backend/common/queue/index.js`

**ADD CONNECTION POOL** (after line 14):
```javascript
// Connection pool for reuse
let sharedConnection = null;

export function getSharedConnection() {
  if (!sharedConnection) {
    sharedConnection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      // Enable connection pooling
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    };
  }
  return sharedConnection;
}
```

**UPDATE** line 22:
```javascript
export function createQueue(queueName, connection = null) {
  const conn = connection || getSharedConnection();
  return new Queue(queueName, {
    connection: conn,
    // ... rest of config
  });
}
```

### Phase 5: Environment Variables (15 min)

#### File: `/backend/voice-service/.env.example`

**ADD**:
```bash
# Reasoning Gateway (Direct HTTP for low latency)
REASONING_GATEWAY_BASE_URL=http://localhost:4002

# Voice Mode Performance Targets
VOICE_LATENCY_TARGET_MS=2000
VOICE_LATENCY_WARN_MS=3000
```

#### File: `/backend/reasoning-gateway/.env.example`

**ADD**:
```bash
# Voice Mode Optimization
VOICE_FAST_MODEL=gpt-4o-mini
VOICE_MAX_LATENCY_MS=2000
```

---

## 5. Testing Strategy

### Unit Tests

1. **Test direct reasoning endpoint**
   ```bash
   curl -X POST http://localhost:8080/api/reasoning/chat \
     -H "Content-Type: application/json" \
     -d '{"prompt":"What is 2+2?","userId":"test"}' \
     -w "\nTime: %{time_total}s\n"
   ```
   - Expected: <2s total time
   - Verify response contains `success: true`

2. **Test with fast model (GPT-4o-mini)**
   ```bash
   curl -X POST http://localhost:4002/api/v1/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Hello","task_type":"voice_interaction"}' \
     -w "\nTime: %{time_total}s\n"
   ```
   - Expected: <1.5s API response time

3. **Test ElevenLabs cache hit**
   ```bash
   # First call (cache miss)
   curl -X POST http://localhost:8080/api/elevenlabs/synthesize \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello world"}' \
     --output /dev/null -w "Time: %{time_total}s\n"
   
   # Second call (cache hit)
   curl -X POST http://localhost:8080/api/elevenlabs/synthesize \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello world"}' \
     --output /dev/null -w "Time: %{time_total}s\n"
   ```
   - Expected: Second call <100ms

### Integration Tests

1. **Full voice pipeline test**
   - Open frontend: `frontend/herbitrage-voice/public/index.html`
   - Click "Talk" button
   - Say: "What is the weather?"
   - Measure time from button click to audio playback
   - **Target: <2s P50, <5s P95**

2. **Load test**
   ```bash
   # Send 10 concurrent voice requests
   for i in {1..10}; do
     (curl -X POST http://localhost:8080/api/reasoning/chat \
       -H "Content-Type: application/json" \
       -d "{\"prompt\":\"Test $i\"}" \
       -w "\nRequest $i time: %{time_total}s\n") &
   done
   wait
   ```
   - Verify no request exceeds 5s
   - Check for connection pool exhaustion

3. **Queue still works for batch jobs**
   ```bash
   # Enqueue a batch job
   curl -X POST http://localhost:8080/api/reasoning/enqueue \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Long complex analysis..."}'
   
   # Verify job is queued
   curl http://localhost:8080/api/reasoning/queue/stats
   ```

### Monitoring

1. **Add latency logging**
   - Voice service logs: `Voice reasoning completed in Xms`
   - Reasoning gateway logs: `Voice request completed in Xms`
   - Alert if latency > 3s

2. **Metrics to track**
   - P50 latency (median)
   - P95 latency (95th percentile)
   - P99 latency (99th percentile)
   - Error rate
   - Cache hit rate (ElevenLabs)

---

## 6. Rollback Plan

If issues arise:

1. **Keep old queue endpoint** (`/api/reasoning/enqueue`)
   - No changes to existing queue code
   - Frontend can revert to queue-based approach

2. **Feature flag** (add to voice-service):
   ```javascript
   const USE_DIRECT_REASONING = process.env.USE_DIRECT_REASONING !== 'false';
   ```

3. **Gradual rollout**
   - Week 1: Internal testing only
   - Week 2: 10% of traffic
   - Week 3: 50% of traffic
   - Week 4: 100% of traffic

---

## 7. Success Criteria

### Performance
- ✅ P50 latency: <2s (from user voice input to audio playback start)
- ✅ P95 latency: <5s
- ✅ P99 latency: <8s
- ✅ Error rate: <1%

### Functionality
- ✅ Voice pipeline works end-to-end
- ✅ ElevenLabs TTS cache still functioning
- ✅ Queue endpoints still work for batch jobs
- ✅ No regressions in existing features

### Monitoring
- ✅ Latency metrics logged
- ✅ Alerts configured for SLA misses
- ✅ Dashboard shows P50/P95/P99

---

## 8. Timeline & Effort

| Phase | Task | Effort | Owner |
|-------|------|--------|-------|
| 1 | Add `/api/reasoning/chat` endpoint | 2h | Backend Dev |
| 2 | Update frontend to use direct endpoint | 1h | Frontend Dev |
| 3 | Optimize reasoning gateway | 1h | Backend Dev |
| 4 | Connection pooling (optional) | 1h | Backend Dev |
| 5 | Environment variables & config | 15m | DevOps |
| 6 | Unit tests | 1h | QA/Dev |
| 7 | Integration tests | 1h | QA/Dev |
| 8 | Documentation | 30m | Tech Writer |
| **Total** | **Implementation + Testing** | **~6-8h** | **Team** |

**Estimated Completion**: 1 working day

---

## 9. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI API latency still high | High | Medium | Use GPT-4o-mini for voice (fastest model) |
| Network latency | Medium | Low | Deploy services in same region/VPC |
| Connection pool exhaustion | High | Low | Monitor connection metrics, scale if needed |
| Breaking existing queue users | High | Low | Keep old endpoints, add new ones |
| ElevenLabs rate limits | Medium | Medium | Cache aggressively (already implemented) |

---

## 10. Post-Implementation

### Week 1
- Monitor latency metrics daily
- Adjust model selection if needed
- Tune connection pool settings

### Week 2
- Analyze P50/P95/P99 trends
- Identify any edge cases causing slowness
- Optimize further if needed

### Month 1
- Review error logs
- User feedback survey
- Consider streaming responses for even lower perceived latency

---

## 11. Future Optimizations

Once <2s is achieved, consider:

1. **Server-Sent Events (SSE) streaming**
   - Stream AI response tokens as they arrive
   - User hears first words faster
   - Perceived latency: <500ms

2. **WebSocket for voice**
   - Bidirectional real-time communication
   - Interrupt capability
   - True "elastic voice"

3. **Edge caching**
   - Cache common questions/responses
   - CDN for audio files
   - Sub-100ms latency for cached content

4. **Model fine-tuning**
   - Train smaller, faster model for voice-specific tasks
   - <500ms inference time

---

## Appendix A: Key File Locations

### Backend Files
- `/backend/voice-service/src/routers/reasoning-router.js` - Add new endpoint here
- `/backend/voice-service/src/index.js` - Mount router (already done)
- `/backend/reasoning-gateway/src/index.js` - Optimize generate endpoint
- `/backend/common/queue/index.js` - Connection pooling (optional)

### Frontend Files
- `/frontend/herbitrage-voice/public/app.js` - Update API call

### Config Files
- `/backend/voice-service/.env.example` - Add new env vars
- `/backend/reasoning-gateway/.env.example` - Add new env vars

### Documentation
- `/backend/voice-service/README.md` - Update after implementation
- `/docs/adr/1.6.2.1_3-6-1-5_ADR_002_Voice_Queue_Architecture_20251006.md` - Reference doc

---

## Appendix B: Latency Budget Breakdown

Target: <2000ms total

| Component | Current | Target | Optimization |
|-----------|---------|--------|--------------|
| Speech-to-Text | ~500ms | ~500ms | Browser native (no control) |
| **Queue overhead** | **~5000ms** | **~0ms** | **Remove queue** ✅ |
| Network (Frontend→Voice) | ~50ms | ~50ms | Same region deployment |
| Network (Voice→Reasoning) | ~50ms | ~50ms | Same VPC/region |
| AI API (Claude/GPT) | ~3-8s | ~1-1.5s | Use GPT-4o-mini ✅ |
| Network (Reasoning→Voice) | ~50ms | ~50ms | Same VPC/region |
| TTS synthesis | ~1-3s | ~100ms | Cache hits ✅ |
| Audio playback start | ~100ms | ~100ms | Browser native |
| **TOTAL** | **~10-17s** | **<2s** | **Achievable** ✅ |

---

## Appendix C: Decision Log

**Q: Why not optimize the queue instead of removing it?**  
A: Queues are designed for async batch processing, not real-time interactions. Even with optimizations (0ms poll interval, high concurrency), you still have write→poll→process→write→poll latency. Direct HTTP is fundamentally faster.

**Q: What about queue benefits like retry/error handling?**  
A: Keep the queue for batch jobs. Voice needs different guarantees: fast response > guaranteed delivery. Handle errors at HTTP layer with proper status codes.

**Q: Will this scale?**  
A: Yes. Direct HTTP scales horizontally (add more reasoning-gateway instances). Current queue architecture also requires scaling workers. HTTP is simpler and faster.

**Q: What if reasoning gateway is down?**  
A: Same as now - return error to user. Add health checks and circuit breakers if needed.

---

**END OF PLAN**

---

**Next Steps**:
1. Review this plan with Jesse (CEO)
2. Get approval for direct HTTP approach
3. Assign tasks to developers
4. Begin Phase 1 implementation
5. Test thoroughly before production deployment

**Questions? Contact the team.**
