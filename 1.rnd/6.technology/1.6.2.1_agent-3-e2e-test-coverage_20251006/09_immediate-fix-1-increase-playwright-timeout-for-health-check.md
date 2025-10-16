#### IMMEDIATE FIX #1: Increase Playwright Timeout for Health Checks

**File:** `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit/tests/e2e-full-system.spec.ts`

**Current code (line 29):**

```typescript
const integrationHealthResponse = await page.request.get('http://localhost:3005/health');
```

**FIXED CODE:**

```typescript
// Integration Service (port 3005) - Allow time for BigQuery cache initialization
console.log('🔍 Testing Integration Service...');
const integrationHealthResponse = await page.request.get('http://localhost:3005/health', {
  timeout: 60000  // 60 seconds for cold start + BigQuery initialization
});
expect(integrationHealthResponse.ok()).toBeTruthy();
```
