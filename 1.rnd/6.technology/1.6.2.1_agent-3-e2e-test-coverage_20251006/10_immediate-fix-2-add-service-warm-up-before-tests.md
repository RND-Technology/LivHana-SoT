#### IMMEDIATE FIX #2: Add Service Warm-Up Before Tests

**File:** `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit/tests/e2e-full-system.spec.ts`

**Add global setup:**

```typescript
import { test, expect } from '@playwright/test';

const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Global warm-up function
async function warmUpServices(request) {
  console.log('🔥 Warming up backend services...');

  try {
    // Warm up integration service + trigger BigQuery cache
    await request.get('http://localhost:3005/health', { timeout: 60000 });
    console.log('  ✓ Integration service warmed up');

    // Trigger cache refresh (this is the expensive operation)
    await request.get('http://localhost:3005/api/bigquery/dashboard', {
      timeout: 60000,
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    console.log('  ✓ BigQuery cache initialized');

    // Warm up reasoning gateway
    await request.get('http://localhost:4002/health', { timeout: 30000 });
    console.log('  ✓ Reasoning gateway warmed up');

  } catch (error) {
    console.warn('⚠️ Service warm-up failed (some services may be down):', error.message);
  }
}

test.describe('LivHana Trinity - Full System E2E Test', () => {
  test.beforeAll(async ({ request }) => {
    await warmUpServices(request);
  });

  test.beforeEach(async ({ context }) => {
    // Set auth token in localStorage before each test
    await context.addInitScript((token) => {
      localStorage.setItem('livhana_session_token', token);
    }, TEST_TOKEN);
  });

  // ... rest of tests
});
```
