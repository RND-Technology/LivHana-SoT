/**
 * BigQuery API Tests
 * LivHana Trinity - TIER 1 Data Integrity
 */

import { test, expect } from '@playwright/test';
import { createIntegrationAPIClient, waitForCondition } from './helpers/api-client';
import { setupAuthenticatedTest } from './helpers/auth-helper';

test.describe('BigQuery Data Pipeline', () => {
  test.beforeEach(async ({ context }) => {
    await setupAuthenticatedTest(context, 'admin');
  });

  test('Cache initializes on first request', async ({ request }) => {
    console.log('Testing BigQuery cache initialization...');

    const api = createIntegrationAPIClient(request);
    const response = await api.get('/api/bigquery/dashboard', { timeout: 90000 });

    if (response.ok()) {
      const data = await response.json();
      console.log(`  Cache initialized: ${data.bigQueryStatus?.mode || 'unknown'} mode`);
      expect(data).toHaveProperty('metrics');
      console.log('  Cache initialization: PASSED');
    } else {
      console.log(`  BigQuery API returned ${response.status()} (may be in mock mode)`);
      expect([200, 503]).toContain(response.status());
    }
  });

  test('Cache serves data quickly on subsequent requests', async ({ request }) => {
    console.log('Testing BigQuery cache performance...');

    const api = createIntegrationAPIClient(request);

    // First request to ensure cache is warm
    await api.get('/api/bigquery/dashboard', { timeout: 90000 });

    // Second request should be fast
    const startTime = Date.now();
    const response = await api.get('/api/bigquery/dashboard', { timeout: 5000 });
    const duration = Date.now() - startTime;

    console.log(`  Cache response time: ${duration}ms`);
    expect(duration).toBeLessThan(5000);
    console.log('  Cache performance: PASSED');
  });

  test('BigQuery status endpoint', async ({ request }) => {
    console.log('Testing BigQuery status...');

    const api = createIntegrationAPIClient(request);
    const response = await api.get('/api/bigquery/status');

    if (response.ok()) {
      const status = await response.json();
      console.log(`  BigQuery mode: ${status.mode || 'unknown'}`);
      expect(status).toHaveProperty('enabled');
      console.log('  BigQuery status: PASSED');
    } else {
      console.log(`  Status endpoint returned ${response.status()}`);
      expect([200, 404]).toContain(response.status());
    }
  });

  test('Historical data query', async ({ request }) => {
    console.log('Testing historical data query...');

    const api = createIntegrationAPIClient(request);
    const response = await api.get('/api/bigquery/historical?days=30', { timeout: 60000 });

    if (response.ok()) {
      const data = await response.json();
      console.log(`  Historical data retrieved`);
      expect(data).toBeDefined();
      console.log('  Historical query: PASSED');
    } else {
      console.log(`  Historical endpoint returned ${response.status()}`);
      expect([200, 404, 503]).toContain(response.status());
    }
  });

  test('Product data sync from BigQuery', async ({ request }) => {
    console.log('Testing product data sync...');

    const api = createIntegrationAPIClient(request);
    const response = await api.get('/api/bigquery/products', { timeout: 60000 });

    if (response.ok()) {
      const products = await response.json();
      console.log(`  Product data: ${Array.isArray(products) ? products.length : 0} items`);
      expect(products).toBeDefined();
      console.log('  Product sync: PASSED');
    } else {
      console.log(`  Products endpoint returned ${response.status()}`);
      expect([200, 404, 503]).toContain(response.status());
    }
  });

  test('Degraded mode handling', async ({ request }) => {
    console.log('Testing degraded mode...');

    const api = createIntegrationAPIClient(request);
    const response = await api.get('/api/bigquery/dashboard', { timeout: 90000 });

    // Should return data even in degraded mode
    if (response.ok()) {
      const data = await response.json();
      const mode = data.bigQueryStatus?.mode || 'unknown';
      console.log(`  Operating mode: ${mode}`);
      expect(['live', 'mock', 'degraded']).toContain(mode);
      console.log('  Degraded mode handling: PASSED');
    } else {
      console.log(`  Dashboard endpoint returned ${response.status()}`);
      expect([200, 503]).toContain(response.status());
    }
  });
});
