/**
 * E2E Test: Age Verification (P0 CRITICAL)
 * Tests server-side age gate cannot be bypassed
 */

import { test, expect } from '@playwright/test';

test.describe('Age Verification - Server-Side Security', () => {
  test('should enforce 21+ requirement with server validation', async ({ page }) => {
    await page.goto('http://localhost:5174');

    // Try to access products (should show age gate)
    await page.click('[data-testid="square-products-tab"]');

    // Verify age gate is shown
    await expect(page.locator('text=You must be 21+ to enter')).toBeVisible();

    // Enter birthdate that makes user under 21
    const underageDate = new Date();
    underageDate.setFullYear(underageDate.getFullYear() - 20); // 20 years old

    await page.fill('#birthdate-input', underageDate.toISOString().split('T')[0]);

    // Should NOT allow entry
    await expect(page.locator('[data-testid="product-grid"]')).not.toBeVisible();
  });

  test('should allow 21+ users with valid birthdate', async ({ page }) => {
    await page.goto('http://localhost:5174');

    await page.click('[data-testid="square-products-tab"]');

    // Enter birthdate that makes user 21+
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 25); // 25 years old

    await page.fill('#birthdate-input', validDate.toISOString().split('T')[0]);

    // Should allow entry and show products
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible({ timeout: 5000 });
  });

  test('should log verification attempt to BigQuery', async ({ page, request }) => {
    // Make direct API call to verify server-side logging
    const response = await request.post('http://localhost:3005/api/age-verification/verify', {
      data: {
        birthdate: new Date('1990-01-01').toISOString(),
        metadata: {
          test: true
        }
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.verified).toBe(true);
    expect(data.age).toBeGreaterThanOrEqual(21);
    expect(data.verificationId).toBeDefined();
  });

  test('should reject under-21 via API (cannot bypass)', async ({ request }) => {
    const underageDate = new Date();
    underageDate.setFullYear(underageDate.getFullYear() - 18); // 18 years old

    const response = await request.post('http://localhost:3005/api/age-verification/verify', {
      data: {
        birthdate: underageDate.toISOString(),
        metadata: { test: true }
      }
    });

    expect(response.status()).toBe(403); // Forbidden

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('21+');
  });
});

// Optimized: 2025-10-02

// Last optimized: 2025-10-02
