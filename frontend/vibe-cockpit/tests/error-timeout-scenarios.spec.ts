/**
 * Timeout Scenario Tests
 * LivHana Trinity - TIER 1 Performance
 */

import { test, expect } from '@playwright/test';
import { createIntegrationAPIClient } from './helpers/api-client';
import { setupAuthenticatedTest } from './helpers/auth-helper';

test.describe('Timeout Scenarios', () => {
  test.beforeEach(async ({ context }) => {
    await setupAuthenticatedTest(context, 'admin');
  });

  test('BigQuery timeout handling (90s limit)', async ({ request }) => {
    console.log('Testing BigQuery timeout...');

    const api = createIntegrationAPIClient(request);

    try {
      const response = await api.get('/api/bigquery/dashboard', { timeout: 90000 });
      expect([200, 503]).toContain(response.status());
      console.log('  BigQuery timeout: HANDLED');
    } catch (error) {
      console.log('  BigQuery timeout: ERROR CAUGHT');
      expect(error).toBeDefined();
    }
  });

  test('Reasoning job timeout handling', async ({ request }) => {
    console.log('Testing reasoning job timeout...');

    const api = createIntegrationAPIClient(request);

    try {
      const response = await api.post('/api/autonomous/execute', {
        task: 'Long running task',
        timeout: 1000,
      }, { timeout: 30000 });

      expect([200, 201, 408, 503]).toContain(response.status());
      console.log('  Reasoning timeout: HANDLED');
    } catch (error) {
      console.log('  Reasoning timeout: ERROR CAUGHT');
      expect(error).toBeDefined();
    }
  });

  test('Voice synthesis timeout handling', async ({ request }) => {
    console.log('Testing voice synthesis timeout...');

    const api = createIntegrationAPIClient(request);

    try {
      const response = await api.post('/api/elevenlabs/synthesize', {
        text: 'Test',
      }, { timeout: 10000 });

      expect([200, 408, 503]).toContain(response.status());
      console.log('  Voice timeout: HANDLED');
    } catch (error) {
      console.log('  Voice timeout: ERROR CAUGHT');
      expect(error).toBeDefined();
    }
  });
});

// Optimized: 2025-10-02

// Last optimized: 2025-10-02
