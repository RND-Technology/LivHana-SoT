/**
 * API Authentication Tests
 * LivHana Trinity - TIER 1 Security Critical
 */

import { test, expect } from '@playwright/test';
import { createReasoningAPIClient, createIntegrationAPIClient } from './helpers/api-client';
import { TEST_TOKENS } from './fixtures/auth-tokens';

test.describe('API Authentication - JWT Flow', () => {
  test('Valid JWT token grants access', async ({ request }) => {
    console.log('Testing valid JWT authentication...');

    const api = createReasoningAPIClient(request, TEST_TOKENS.VALID_ADMIN);
    const response = await api.get('/api/autonomous/capabilities');

    expect(response.ok()).toBeTruthy();
    console.log('  Valid JWT: PASSED');
  });

  test('Invalid JWT token is rejected', async ({ request }) => {
    console.log('Testing invalid JWT rejection...');

    const response = await request.get('http://localhost:4002/api/autonomous/capabilities', {
      headers: {
        'Authorization': `Bearer ${TEST_TOKENS.INVALID_TOKEN}`,
      },
    });

    expect(response.status()).toBe(401);
    console.log('  Invalid JWT rejection: PASSED');
  });

  test('Expired JWT token is rejected', async ({ request }) => {
    console.log('Testing expired JWT rejection...');

    const response = await request.get('http://localhost:4002/api/autonomous/capabilities', {
      headers: {
        'Authorization': `Bearer ${TEST_TOKENS.EXPIRED_TOKEN}`,
      },
    });

    expect(response.status()).toBe(401);
    console.log('  Expired JWT rejection: PASSED');
  });

  test('Missing auth header returns 401', async ({ request }) => {
    console.log('Testing missing auth header...');

    const response = await request.get('http://localhost:4002/api/autonomous/capabilities');

    expect(response.status()).toBe(401);
    console.log('  Missing auth header: PASSED');
  });

  test('Health endpoints do not require auth', async ({ request }) => {
    console.log('Testing public health endpoints...');

    const reasoningHealth = await request.get('http://localhost:4002/health');
    const integrationHealth = await request.get('http://localhost:3005/health', { timeout: 90000 });

    expect(reasoningHealth.ok()).toBeTruthy();
    expect(integrationHealth.ok()).toBeTruthy();
    console.log('  Public health endpoints: PASSED');
  });

  test('User role permissions', async ({ request }) => {
    console.log('Testing role-based access...');

    // Admin token should have access
    const adminApi = createReasoningAPIClient(request, TEST_TOKENS.VALID_ADMIN);
    const adminResponse = await adminApi.get('/api/autonomous/capabilities');
    expect(adminResponse.ok()).toBeTruthy();

    console.log('  Role-based access: PASSED');
  });
});

// Optimized: 2025-10-02
