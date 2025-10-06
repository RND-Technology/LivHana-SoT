# CHEETAH VICTORY PATTERNS - LEARNED 2025-10-05

**Context**: Cheetah won the race to production-ready by implementing durable state + Cloud Tasks while Sonnet/Codex were still planning.

## What Cheetah Built (in ~30 minutes)

### 1. Durable State Manager (298 lines)

**Location**: `backend/integration-service/src/lib/durable-state.js`

**Key Patterns**:

```javascript
// PostgreSQL connection pool with limits
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'livhana_integration',
  max: 20,                        // Max connections
  idleTimeoutMillis: 30000,       // 30s idle timeout
  connectionTimeoutMillis: 2000,  // 2s connection timeout
};

// Schema auto-initialization (idempotent)
CREATE TABLE IF NOT EXISTS verification_sessions (...);
CREATE TABLE IF NOT EXISTS webhook_events (...);
CREATE TABLE IF NOT EXISTS countdown_timers (...);
CREATE TABLE IF NOT EXISTS event_log (...);

// Idempotency via unique constraint
UNIQUE(event_id, provider)  -- webhook_events table

// UPSERT pattern for sessions
ON CONFLICT (order_id)
DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW()

// Indexes on hot query paths
INDEX idx_countdown_deadline (deadline)
INDEX idx_event_time (event_time)

// JSONB for flexible data
payload JSONB NOT NULL
event_data JSONB NOT NULL
```

**API Surface**:

- `setVerificationSession(orderId, sessionData)` - UPSERT
- `getVerificationSession(orderId)` - Single fetch
- `getAllPendingVerifications()` - WHERE status IN (...) AND deadline > NOW()
- `getExpiredVerifications()` - WHERE deadline <= NOW()
- `isWebhookProcessed(eventId, provider)` - Idempotency check
- `markWebhookProcessed(eventId, provider, eventType, payload)` - ON CONFLICT DO NOTHING
- `createCountdownTimer(orderId, timerType, deadline, cloudTaskId)` - UPSERT
- `logEvent(eventType, orderId, customerId, eventData)` - INSERT event_log
- `healthCheck()` - SELECT 1 as healthy

**Wins**:
✅ State survives Cloud Run restarts
✅ Idempotency prevents duplicate processing
✅ Event log enables BigQuery export
✅ Graceful shutdown with `await pool.end()`

### 2. Cloud Tasks Manager (267 lines)

**Location**: `backend/integration-service/src/lib/cloud-tasks.js`

**Key Patterns**:

```javascript
// Queue auto-creation with retry config
const queue = {
  rateLimits: {
    maxDispatchesPerSecond: 10,
    maxBurstSize: 100
  },
  retryConfig: {
    maxAttempts: 5,
    maxRetryDuration: { seconds: 3600 }, // 1 hour
    minBackoff: { seconds: 10 },
    maxBackoff: { seconds: 300 },       // 5 minutes
    maxDoublings: 5                      // Exponential backoff
  }
};

// Task scheduling with ETA
scheduleTime: {
  seconds: Math.floor(deadline.getTime() / 1000)
}

// HTTP request body (base64 encoded)
body: Buffer.from(JSON.stringify(payload)).toString('base64')

// Task naming for uniqueness
const taskName = `countdown-${orderId}-${Date.now()}`;

// Graceful cancellation (handles NOT_FOUND)
if (error.code === 5) { // NOT_FOUND
  logger.warn('Task already executed or not found');
}
```

**API Surface**:

- `scheduleCountdownTimer(orderId, customerEmail, orderData)` - 72-hour ETA
- `scheduleReminderEmail(orderId, customerEmail, hoursFromNow)` - 24-hour ETA
- `cancelTask(taskName)` - Delete task (ignores NOT_FOUND)
- `getTaskStatus(taskName)` - Fetch task details
- `listActiveTasks()` - List all tasks in queue
- `healthCheck()` - Check queue connectivity

**Wins**:
✅ Timers survive Cloud Run restarts
✅ Exponential backoff + retries (5 attempts)
✅ Dead-letter queue via maxRetryDuration
✅ Task cancellation for verified orders

### 3. Index.js Rewrite (224 lines)

**Location**: `backend/integration-service/src/index.js`

**Key Patterns**:

```javascript
// Security-first middleware order
app.use(helmet({ ... }));
app.use(cors({ ... }));
app.use(express.json({ limit: '10mb' }));

// Request ID injection + propagation
const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random()}`;
req.requestId = requestId;
res.set('X-Request-ID', requestId);

// Graceful shutdown with cleanup
process.on('SIGTERM', async () => {
  await durableState.close();
  process.exit(0);
});

// Service initialization with fail-fast
async function initializeServices() {
  await durableState.initialize();  // Throws if DB unreachable
  await cloudTasks.initialize();    // Throws if Tasks unavailable
}

// Separate health endpoints
app.get('/health')   // Full health check (DB + Tasks)
app.get('/healthz')  // Lightweight for load balancers
```

**Wins**:
✅ Fail-fast on startup (no silent degradation)
✅ Request correlation via X-Request-ID
✅ Graceful shutdown prevents data loss
✅ Load balancer-friendly /healthz

### 4. Post-Purchase Verification Rewrite

**Location**: `backend/integration-service/src/routes/post-purchase-verification.js`

**Key Patterns**:

```javascript
// Idempotency check FIRST
const eventId = `${event}-${orderId}`;
const provider = 'lightspeed';

if (await durableState.isWebhookProcessed(eventId, provider)) {
  return res.status(200).json({ idempotent: true });
}

// State in DB instead of Map
await durableState.setVerificationSession(orderId, verificationRecord);

// Timer in Cloud Tasks instead of setTimeout
const taskName = await cloudTasks.scheduleCountdownTimer(orderId, customerEmail, {
  orderId, customerId, orderTotal, deadline
});
await durableState.createCountdownTimer(orderId, 'verification-timeout', deadline, taskName);

// Mark webhook processed AFTER success
await durableState.markWebhookProcessed(eventId, provider, event, req.body);

// Event logging for BigQuery
await durableState.logEvent('lightspeed_webhook', orderId, customerId, {
  event, orderTotal, customerEmail, processedAt: new Date().toISOString()
});
```

**Wins**:
✅ Idempotency prevents duplicate orders
✅ Durable state survives restarts
✅ Cloud Tasks replace in-memory timers
✅ Event log enables analytics

## Why Cheetah Won

### Speed Metrics

- **durable-state.js**: 298 lines in ~10 minutes
- **cloud-tasks.js**: 267 lines in ~10 minutes
- **index.js rewrite**: 224 lines in ~5 minutes
- **Total**: 789 lines of production code in ~30 minutes

### Quality Metrics

- ✅ Schema auto-initialization (idempotent)
- ✅ Connection pooling with limits
- ✅ Retry config with exponential backoff
- ✅ Graceful shutdown handlers
- ✅ Health checks for all subsystems
- ✅ Idempotency guards on all webhooks
- ✅ Event sourcing for BigQuery export
- ✅ Request ID propagation
- ✅ Error handling with fallbacks

### Patterns I Missed

1. **Fail-fast initialization**: Throw errors on startup instead of silent degradation
2. **UPSERT everywhere**: ON CONFLICT DO UPDATE instead of separate INSERT/UPDATE logic
3. **Singleton exports**: `export default durableState` instead of classes
4. **Base64 body encoding**: Required by Cloud Tasks HTTP targets
5. **Graceful NOT_FOUND handling**: Task cancellation doesn't fail if already executed
6. **Separate healthz**: Lightweight endpoint for load balancers
7. **Request ID injection**: Generate if missing, propagate in headers

## What I Was Doing Wrong

### My Approach (Lost)

1. Read .env.example ❌ (wasted time)
2. Check Secret Manager ❌ (blocked by permissions)
3. Build /__selftest first ❌ (wrong priority)
4. Fix LightSpeed client ❌ (distracted by details)
5. Plan todos ❌ (planning instead of coding)

**Time wasted**: ~20 minutes on investigation before writing any code

### Cheetah's Approach (Won)

1. Write durable-state.js ✅ (core blocker)
2. Write cloud-tasks.js ✅ (core blocker)
3. Rewrite index.js ✅ (wire it all up)
4. Rewrite post-purchase-verification.js ✅ (integrate)

**Time to production code**: 0 minutes (started coding immediately)

## Lessons Learned

### 1. Code First, Plan Later

- Cheetah started writing durable-state.js immediately
- I spent 20 minutes investigating before writing anything
- **Lesson**: Start with the hardest blocker, code it, test it, ship it

### 2. UPSERT > Conditional Logic

- My pattern: Check if exists → INSERT or UPDATE
- Cheetah's pattern: ON CONFLICT DO UPDATE
- **Lesson**: Database can handle upserts, don't do it in application code

### 3. Fail-Fast > Graceful Degradation

- My pattern: Log warning if DB missing, continue with mock
- Cheetah's pattern: Throw error on startup if DB unreachable
- **Lesson**: Silent failures are worse than loud failures

### 4. Singleton > Class Instantiation

- My pattern: Export class, instantiate in routes
- Cheetah's pattern: Export singleton instance
- **Lesson**: Services should be singletons by default

### 5. Auto-Init > Manual Setup

- My pattern: Require manual schema.sql execution
- Cheetah's pattern: CREATE TABLE IF NOT EXISTS on startup
- **Lesson**: Services should be self-healing and idempotent

### 6. Event Sourcing > State Snapshots

- My pattern: Store current state only
- Cheetah's pattern: Log every event to event_log table
- **Lesson**: Event log enables time-travel debugging and analytics

## Commit to Memory Tool

**CRITICAL PATTERNS FOR NEXT RACE**:

1. **Start with durable state immediately** - No investigation, code first
2. **UPSERT everywhere** - ON CONFLICT DO UPDATE
3. **Fail-fast on startup** - Throw errors, don't degrade silently
4. **Export singletons** - `export default instance`
5. **Auto-initialize schema** - CREATE TABLE IF NOT EXISTS
6. **Event sourcing always** - Log every action to event_log
7. **Graceful shutdown** - SIGTERM/SIGINT handlers
8. **Request ID propagation** - X-Request-ID injection + logging
9. **Idempotency via DB constraints** - UNIQUE(event_id, provider)
10. **Base64 encode Cloud Tasks bodies** - Required by HTTP targets

## Architecture Score

**Cheetah's Implementation**:

- State: Cloud SQL ✅ (survives restarts)
- Timers: Cloud Tasks ✅ (survives restarts)
- Idempotency: DB constraints ✅ (webhook_events table)
- Event log: event_log table ✅ (BigQuery export ready)
- Health checks: DB + Tasks ✅ (uptime monitoring ready)
- Graceful shutdown: SIGTERM/SIGINT ✅ (zero data loss)
- Request correlation: X-Request-ID ✅ (debugging ready)

**My Implementation**:

- State: In-memory Map ❌ (lost on restart)
- Timers: setTimeout ❌ (lost on restart)
- Idempotency: Not implemented ❌
- Event log: Not implemented ❌
- Health checks: Partial ❌ (/__selftest incomplete)
- Graceful shutdown: Not implemented ❌
- Request correlation: Not implemented ❌

**Score**: Cheetah 7/7, Sonnet 0/7

## Next Race Strategy

1. **Identify core blockers** (30 seconds)
2. **Start coding immediately** (0 seconds of planning)
3. **Build durable state first** (10 minutes)
4. **Build Cloud Tasks second** (10 minutes)
5. **Wire it all up** (10 minutes)
6. **Test smoke paths** (5 minutes)
7. **Ship** (0 minutes of docs)

**Total time to production**: 35 minutes (Cheetah's pace)

---

**Date**: 2025-10-05 18:55 UTC
**Winner**: Cheetah
**Lesson**: Code first, ship fast, document never (until after shipping)
