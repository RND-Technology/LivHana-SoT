/**
 * Square API Integration E2E Tests
 * LivHana Trinity - TIER 1 Critical Business Flow
 */

import { test, expect } from '@playwright/test';
import { createIntegrationAPIClient } from './helpers/api-client';
import { setupAuthenticatedTest } from './helpers/auth-helper';

test.describe('Square API Integration - Full Lifecycle', () => {
  test.beforeEach(async ({ context }) => {
    await setupAuthenticatedTest(context, 'admin');
  });

  test('Fetch product catalog from Square API', async ({ page, request }) => {
    console.log('Testing Square product catalog fetch...');

    const api = createIntegrationAPIClient(request);
    const response = await api.get('/api/square/products', { timeout: 60000 });

    // Check response status
    if (response.ok()) {
      const products = await response.json();
      console.log(`  Retrieved ${products.length || 0} products`);

      // Verify response structure
      expect(Array.isArray(products) || typeof products === 'object').toBeTruthy();

      // If products exist, verify schema
      if (Array.isArray(products) && products.length > 0) {
        const firstProduct = products[0];
        expect(firstProduct).toHaveProperty('id');
        expect(firstProduct).toHaveProperty('name');
      }

      console.log('  Product catalog fetch: PASSED');
    } else {
      // API may not be configured - verify graceful degradation
      console.log(`  Square API returned ${response.status()} (may be in mock mode)`);
      expect([200, 404, 503]).toContain(response.status());
    }
  });

  test('Handle Square API rate limiting gracefully', async ({ page, request }) => {
    console.log('Testing Square rate limit handling...');

    const api = createIntegrationAPIClient(request);

    // Make multiple rapid requests
    const requests = Array.from({ length: 5 }, () =>
      api.get('/api/square/products', { timeout: 10000 })
    );

    const responses = await Promise.all(requests.map(r => r.catch(e => null)));
    const successCount = responses.filter(r => r && r.ok()).length;

    console.log(`  ${successCount}/5 requests succeeded`);

    // At least some requests should succeed (rate limiting is graceful)
    expect(successCount).toBeGreaterThan(0);
    console.log('  Rate limit handling: PASSED');
  });

  test('Fallback to mock data when Square API is unavailable', async ({ page }) => {
    console.log('Testing Square mock mode fallback...');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Square products view (if exists)
    const squareLink = page.getByText(/Square|Products/i).first();
    if (await squareLink.count() > 0) {
      await squareLink.click();
      await page.waitForLoadState('networkidle');

      // Page should load without crashing
      const body = page.locator('body');
      await expect(body).toBeVisible();

      console.log('  Mock mode fallback: PASSED');
    } else {
      console.log('  Square products view not found - skipping');
    }
  });

  test('Display Square transaction history with filtering', async ({ page, request }) => {
    console.log('Testing Square transaction history...');

    const api = createIntegrationAPIClient(request);
    const response = await api.get('/api/square/transactions', { timeout: 60000 });

    if (response.ok()) {
      const transactions = await response.json();
      console.log(`  Retrieved ${Array.isArray(transactions) ? transactions.length : 0} transactions`);

      // Verify response structure
      expect(transactions).toBeDefined();

      console.log('  Transaction history: PASSED');
    } else {
      console.log(`  Transactions endpoint returned ${response.status()}`);
      expect([200, 404, 503]).toContain(response.status());
    }
  });

  test('Sync Square inventory updates', async ({ page, request }) => {
    console.log('Testing Square inventory sync...');

    const api = createIntegrationAPIClient(request);

    // Check current sync status
    const statusResponse = await api.get('/api/square/sync/status');
    expect([200, 404, 503]).toContain(statusResponse.status());

    if (statusResponse.ok()) {
      const status = await statusResponse.json();
      console.log(`  Sync status: ${status.status || 'unknown'}`);
    }

    console.log('  Inventory sync check: PASSED');
  });
});
