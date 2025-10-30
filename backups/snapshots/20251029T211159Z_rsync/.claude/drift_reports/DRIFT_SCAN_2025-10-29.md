# Weekly Architectural Drift Scan
**Date:** 2025-10-29 06:55:24 CDT
**PO1:** Mobile Control Branch Stabilization
**Marine Corps Standard:** Triple Loop Operational Cycles

---

## Executive Summary

## 1. Service Boundary Violations

✅ **No violations detected** - All services properly isolated

## 2. Queue Naming Conventions

⚠️ **Non-standard queue name:**
```
backend/integration-service/src/rpm.ts:import { createQueue, enqueueJob } from '../../common/queue/index.js';
```

⚠️ **Non-standard queue name:**
```
backend/integration-service/src/rpm.ts:const exportQueue = createQueue('rpm.export');
```

⚠️ **Non-standard queue name:**
```
backend/integration-service/src/rpm.js:// import { createQueue, enqueueJob } from '../../common/queue/index.js'; // Commented out - bullmq not installed
```

⚠️ **Non-standard queue name:**
```
backend/integration-service/src/rpm.js:// const exportQueue = createQueue('rpm.export');
```

⚠️ **Non-standard queue name:**
```
backend/orchestration-service/src/index.ts:  queue = createHardenedQueue(QUEUE_NAME, { connection: REDIS_CONFIG });
```

⚠️ **Non-standard queue name:**
```
backend/reasoning-gateway/src/index.js:import { createQueue, createQueueEvents } from '../common/queue/index.js';
```

⚠️ **Non-standard queue name:**
```
backend/reasoning-gateway/src/index.js:const reasoningQueue = createQueue(REASONING_QUEUE_NAME, REDIS_CONNECTION);
```

⚠️ **Non-standard queue name:**
```
backend/reasoning-gateway/src/index.js:const reasoningQueueEvents = createQueueEvents(REASONING_QUEUE_NAME, REDIS_CONNECTION);
```

⚠️ **Non-standard queue name:**
```
backend/reasoning-gateway/src/worker/autoScaler.test.ts:    testQueue = createHardenedQueue('test-reasoning-queue', {
```

⚠️ **Non-standard queue name:**
```
backend/voice-service/src/routers/reasoning-router.js:import { createQueue, createQueueEvents, enqueueJob, getJobStatus } from '../../../common/queue/index.js';
```

⚠️ **Non-standard queue name:**
```
backend/voice-service/src/routers/reasoning-router.js:const reasoningQueue = createQueue(REASONING_QUEUE_NAME);
```

⚠️ **Non-standard queue name:**
```
backend/voice-service/src/routers/reasoning-router.js:const reasoningQueueEvents = createQueueEvents(REASONING_QUEUE_NAME);
```

## 3. Redis Client Security

✅ **Secure Redis usage** - All clients use `createSecureClient()`

## 4. Documentation Audit Status

✅ **Documentation fresh** - All READMEs audited within 30 days

## 5. Test Coverage Analysis

✅ **Test coverage complete** - All critical modules tested

## 6. Compliance Rules Status

⚠️ **Compliance service missing**


---

## Summary

| Category | Status | Issues |
|----------|--------|--------|
| Service Boundaries | ✅ | 0 |
| Queue Naming | ⚠️ | 12 |
| Redis Security | ✅ | 0 |
| Documentation | ✅ | 0 |
| Test Coverage | ✅ | 0 |

**Total Drift Issues:** 12

---

**Marine Corps Standard:** ✅ UPHELD

**Next Scan:** 2025-11-05

