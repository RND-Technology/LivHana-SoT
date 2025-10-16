### 3.4 Error Handling & Retry Logic

**Error Handling Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│               ERROR HANDLING STRATEGIES                       │
└─────────────────────────────────────────────────────────────┘

1. GRACEFUL DEGRADATION
   - BigQuery unavailable → Return mock data
   - Square API down → Use cached catalog
   - Payment gateway timeout → Retry 3x with backoff

2. CIRCUIT BREAKER
   - Track failure rate per service
   - Open circuit after 5 consecutive failures
   - Half-open after 60s cooldown
   - Close on success

3. RETRY LOGIC
   - Network errors: Exponential backoff (1s, 2s, 4s, 8s, 16s)
   - Rate limits: Respect Retry-After header
   - Transient errors: Max 3 retries
   - Fatal errors: No retry (log + alert)

4. FALLBACK CHAINS
   - Primary: Live API
   - Secondary: Redis cache
   - Tertiary: Mock data
   - Quaternary: Empty state (with user message)
```

**Implementation Examples:**

**1. BigQuery Error Handling:**

```javascript
// integration-service/src/bigquery_live.js:199-239
async function refreshCache() {
  if (!bigQueryEnabled || !client) {
    // Fallback to mock data
    cache.dashboard = mockResponse.dashboard;
    cache.mode = 'mock';
    cache.lastRefresh = new Date().toISOString();
    return;
  }

  try {
    const [dashboard, historical, products] = await Promise.all([
      fetchDashboardData(),
      fetchHistoricalData(),
      fetchProductData()
    ]);

    cache.dashboard = dashboard;
    cache.historical = historical;
    cache.products = products;
    cache.mode = 'live';
    cache.lastRefresh = new Date().toISOString();
    cache.lastError = null;
    cache.expiresAt = Date.now() + CACHE_TTL_MS;

  } catch (error) {
    cache.lastError = error.message;
    cache.mode = 'degraded';
    logger.error('Failed to refresh BigQuery cache', error);

    // Keep serving stale data if available
    if (!cache.dashboard) {
      cache.dashboard = mockResponse.dashboard;
    }

    // Set short TTL for retry
    cache.expiresAt = Date.now() + (CACHE_TTL_MS / 2);
  }
}
```

**2. Square API Retry Logic:**

```javascript
// integration-service/scripts/sync-square-to-bigquery.js:31-102
async function syncPayments() {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await squareClient.get('/payments', { params });
      // Success - process and return
      return response.data.payments;

    } catch (error) {
      if (attempt === MAX_RETRIES) {
        // Final attempt failed - log and throw
        logger.error('Square API exhausted retries', error);
        throw error;
      }

      if (error.response?.status === 429) {
        // Rate limited - respect Retry-After header
        const retryAfter = parseInt(error.response.headers['retry-after']) || 60;
        logger.warn(`Rate limited, retrying after ${retryAfter}s`);
        await sleep(retryAfter * 1000);

      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        // Network error - exponential backoff
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        logger.warn(`Network error, retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`);
        await sleep(delay);

      } else {
        // Unknown error - don't retry
        throw error;
      }
    }
  }
}
```

**3. Payment Gateway Error Handling:**

```javascript
// integration-service/src/membership.js:416-489
router.post('/api/memberships/subscribe', async (req, res) => {
  try {
    // Validate input
    if (!customerId || !email || !tier || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check for existing membership
    const existingMembership = await getMembershipByCustomerId(customerId);
    if (existingMembership && existingMembership.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Customer already has an active membership'
      });
    }

    // Process payment with retries
    let subscription;
    try {
      subscription = await kajaGateway.createSubscription(
        { customerId, email },
        validatedTier,
        paymentMethod
      );
    } catch (paymentError) {
      // Payment failed - specific error message
      logger.error('Payment processing failed', paymentError);
      return res.status(402).json({
        success: false,
        error: 'Payment declined. Please check your card details.',
        code: 'PAYMENT_DECLINED'
      });
    }

    // Save membership (with fallback)
    try {
      await saveMembership(membershipData);
    } catch (dbError) {
      // Database save failed - void payment + return error
      logger.error('Failed to save membership, voiding payment', dbError);
      await kajaGateway.voidTransaction(subscription.transactionId);

      return res.status(500).json({
        success: false,
        error: 'Failed to create membership. Payment was not charged.',
        code: 'DATABASE_ERROR'
      });
    }

    // Success
    res.status(201).json({
      success: true,
      membership: membershipData
    });

  } catch (error) {
    // Unexpected error - log and return generic message
    logger.error('Unexpected error in membership subscription', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      code: 'INTERNAL_ERROR'
    });
  }
});
```

**4. BullMQ Job Error Handling:**

```javascript
// reasoning-gateway/src/index.js:69-75
reasoningWorker.on('failed', (job, error) => {
  logger.error({ jobId: job.id, error: error.message }, 'reasoning job failed');

  // Job will be retried based on job options:
  // - attempts: 3
  // - backoff: { type: 'exponential', delay: 1000 }
});

reasoningWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'reasoning job completed');
  // Result available in Redis for REDIS_REMOVE_ON_COMPLETE count
});

// Job options defined in queue creation:
defaultJobOptions: {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000 // 1s, 2s, 4s
  },
  removeOnComplete: 100, // Keep last 100 successful jobs
  removeOnFail: 1000, // Keep last 1000 failed jobs for debugging
}
```

**Error Response Standards:**

```javascript
// Success response
{
  success: true,
  data: { ... },
  timestamp: "2025-10-01T12:34:56.789Z"
}

// Error response
{
  success: false,
  error: "Human-readable error message",
  code: "ERROR_CODE", // Machine-readable code
  details: { ... }, // Optional debug info (dev only)
  timestamp: "2025-10-01T12:34:56.789Z"
}
```

**Error Codes:**

| Code | HTTP Status | Meaning | Retry? |
|------|-------------|---------|--------|
| INVALID_INPUT | 400 | Validation failed | No - fix input |
| UNAUTHORIZED | 401 | Missing/invalid JWT | No - re-auth |
| FORBIDDEN | 403 | Insufficient permissions | No - upgrade role |
| NOT_FOUND | 404 | Resource doesn't exist | No |
| PAYMENT_DECLINED | 402 | Card declined | No - try different card |
| RATE_LIMITED | 429 | Too many requests | Yes - after delay |
| DATABASE_ERROR | 500 | BigQuery/Redis error | Yes - transient |
| GATEWAY_TIMEOUT | 504 | External API timeout | Yes - retry |
| INTERNAL_ERROR | 500 | Unexpected error | Maybe - check logs |

**Monitoring & Alerting:**

```javascript
// Log all errors with context
logger.error({
  error: error.message,
  stack: error.stack,
  context: {
    userId: req.user?.sub,
    path: req.path,
    method: req.method,
    body: req.body // (sanitized - no PII)
  }
}, 'Error occurred');

// Alert on critical errors
if (error.code === 'DATABASE_ERROR' && error.consecutive > 5) {
  await alertPagerDuty({
    severity: 'critical',
    summary: 'BigQuery connection lost',
    dedup_key: 'bigquery-connection'
  });
}
```

---
