/**
 * E2E Test: Performance Verification
 * Tests BigQuery optimization & code splitting improvements
 */

import { test, expect } from '@playwright/test';

test.describe('Performance - Optimizations Verified', () => {
  test('should load dashboard in under 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5174');

    // Wait for main content to be visible
    await expect(page.locator('text=Executive Command Center')).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds (target: 1-2s with optimizations)
    expect(loadTime).toBeLessThan(3000);

    console.log(`Dashboard load time: ${loadTime}ms`);
  });

  test('should fetch BigQuery data in under 2 seconds', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get('http://localhost:3005/api/compliance/metrics', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJqZXNzZS1hZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1OTM2ODMwNiwiZXhwIjoxNzU5OTczMTA2LCJhdWQiOiJsaXZoYW5hLWxvY2FsIiwiaXNzIjoibGl2aGFuYS1sb2NhbCJ9.Oas7IRYDl5URFrKv52j_6ZHWnZdIwBmAg2Ip830tv5k'
      }
    });

    const queryTime = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();

    // With optimization: should be under 2s (target: 800ms with Redis cache)
    expect(queryTime).toBeLessThan(2000);

    console.log(`BigQuery API response time: ${queryTime}ms`);
  });

  test('should benefit from Redis caching on second request', async ({ request }) => {
    const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJqZXNzZS1hZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1OTM2ODMwNiwiZXhwIjoxNzU5OTczMTA2LCJhdWQiOiJsaXZoYW5hLWxvY2FsIiwiaXNzIjoibGl2aGFuYS1sb2NhbCJ9.Oas7IRYDl5URFrKv52j_6ZHWnZdIwBmAg2Ip830tv5k';

    // First request (may hit BigQuery)
    const startTime1 = Date.now();
    await request.get('http://localhost:3005/api/compliance/metrics', {
      headers: { 'Authorization': token }
    });
    const time1 = Date.now() - startTime1;

    // Second request (should hit Redis cache)
    const startTime2 = Date.now();
    await request.get('http://localhost:3005/api/compliance/metrics', {
      headers: { 'Authorization': token }
    });
    const time2 = Date.now() - startTime2;

    // Second request should be faster (cached)
    expect(time2).toBeLessThan(time1);

    console.log(`First request: ${time1}ms, Second request (cached): ${time2}ms`);
  });

  test('should have JavaScript bundle under 1.5MB', async ({ page }) => {
    const jsRequests: number[] = [];

    page.on('response', (response) => {
      if (response.url().includes('.js') && response.status() === 200) {
        response.body().then((buffer) => {
          jsRequests.push(buffer.length);
        }).catch(() => {/* ignore */});
      }
    });

    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');

    // Wait a bit for all JS to load
    await page.waitForTimeout(2000);

    const totalJSSize = jsRequests.reduce((sum, size) => sum + size, 0);
    const totalJSMB = totalJSSize / 1024 / 1024;

    console.log(`Total JavaScript size: ${totalJSMB.toFixed(2)}MB`);

    // With code splitting: should be under 1.5MB (target: < 1MB)
    expect(totalJSMB).toBeLessThan(1.5);
  });

  test('should handle 10 concurrent requests without degradation', async ({ request }) => {
    const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJqZXNzZS1hZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1OTM2ODMwNiwiZXhwIjoxNzU5OTczMTA2LCJhdWQiOiJsaXZoYW5hLWxvY2FsIiwiaXNzIjoibGl2aGFuYS1sb2NhbCJ9.Oas7IRYDl5URFrKv52j_6ZHWnZdIwBmAg2Ip830tv5k';

    const concurrentRequests = 10;
    const promises = [];

    const startTime = Date.now();

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        request.get('http://localhost:3005/api/compliance/metrics', {
          headers: { 'Authorization': token }
        })
      );
    }

    const responses = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    // All requests should succeed
    responses.forEach((response) => {
      expect(response.ok()).toBeTruthy();
    });

    // Should handle 10 concurrent requests in under 3 seconds
    expect(totalTime).toBeLessThan(3000);

    console.log(`10 concurrent requests completed in: ${totalTime}ms`);
  });
});
