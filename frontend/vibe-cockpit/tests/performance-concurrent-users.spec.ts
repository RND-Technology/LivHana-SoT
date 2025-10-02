/**
 * Concurrent User Tests
 * LivHana Trinity - TIER 1 Scalability
 */

import { test, expect } from '@playwright/test';
import { createIntegrationAPIClient, createReasoningAPIClient } from './helpers/api-client';
import { setupAuthenticatedTest } from './helpers/auth-helper';

test.describe('Concurrent Users Simulation', () => {
  test.beforeEach(async ({ context }) => {
    await setupAuthenticatedTest(context, 'admin');
  });

  test('Handle multiple simultaneous dashboard loads', async ({ browser }) => {
    console.log('Testing concurrent dashboard loads...');

    // Create multiple contexts (simulating users)
    const contexts = await Promise.all(
      Array.from({ length: 5 }, () => browser.newContext())
    );

    const pages = await Promise.all(
      contexts.map(ctx => ctx.newPage())
    );

    // Load dashboard simultaneously
    const startTime = Date.now();
    await Promise.all(
      pages.map(page => page.goto('http://localhost:5174/'))
    );
    const totalTime = Date.now() - startTime;

    console.log(`  5 concurrent loads completed in ${totalTime}ms`);
    expect(totalTime).toBeLessThan(30000); // 30 seconds for 5 users

    // Cleanup
    await Promise.all(contexts.map(ctx => ctx.close()));
    console.log('  Concurrent loads: PASSED');
  });

  test('Handle multiple simultaneous API requests', async ({ request }) => {
    console.log('Testing concurrent API requests...');

    const integrationApi = createIntegrationAPIClient(request);
    const reasoningApi = createReasoningAPIClient(request);

    // Make various concurrent requests
    const requests = [
      integrationApi.get('/health'),
      integrationApi.get('/api/square/products'),
      reasoningApi.get('/health'),
      reasoningApi.get('/api/autonomous/capabilities'),
      integrationApi.get('/api/bigquery/dashboard', { timeout: 90000 }),
    ];

    const startTime = Date.now();
    const responses = await Promise.allSettled(requests);
    const totalTime = Date.now() - startTime;

    const successCount = responses.filter(r => r.status === 'fulfilled').length;
    console.log(`  ${successCount}/5 concurrent API calls succeeded in ${totalTime}ms`);
    expect(successCount).toBeGreaterThan(2); // At least 60% success
    console.log('  Concurrent API requests: PASSED');
  });

  test('System remains responsive under load', async ({ page }) => {
    console.log('Testing system responsiveness under load...');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Perform multiple rapid interactions
    for (let i = 0; i < 10; i++) {
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    }

    // System should still be responsive
    await expect(page.locator('body')).toBeVisible();
    console.log('  System responsiveness: MAINTAINED');
  });
});

// Optimized: 2025-10-02
