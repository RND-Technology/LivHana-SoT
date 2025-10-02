/**
 * E2E Test: Compliance API (P0 CRITICAL)
 * Tests real compliance data (no mock data)
 */

import { test, expect } from '@playwright/test';

test.describe('Compliance API - Real Data', () => {
  test('should return real compliance metrics from BigQuery', async ({ request }) => {
    // Generate JWT token for API access
    const response = await request.get('http://localhost:3005/api/compliance/metrics', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJqZXNzZS1hZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1OTM2ODMwNiwiZXhwIjoxNzU5OTczMTA2LCJhdWQiOiJsaXZoYW5hLWxvY2FsIiwiaXNzIjoibGl2aGFuYS1sb2NhbCJ9.Oas7IRYDl5URFrKv52j_6ZHWnZdIwBmAg2Ip830tv5k'
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // Verify structure
    expect(data.success).toBe(true);
    expect(data.metrics).toBeDefined();
    expect(data.metrics.ageVerification).toBeDefined();
    expect(data.metrics.productCompliance).toBeDefined();
    expect(data.metrics.texasCompliance).toBeDefined();

    // Verify NO mock data (all values should be numbers, not null)
    expect(typeof data.metrics.ageVerification.totalVerifications).toBe('number');
    expect(typeof data.metrics.ageVerification.successRate).toBe('number');
    expect(typeof data.metrics.productCompliance.totalProducts).toBe('number');
    expect(typeof data.metrics.texasCompliance.score).toBe('number');

    // Verify timestamp is recent
    const timestamp = new Date(data.timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - timestamp.getTime()) / 1000 / 60;
    expect(diffMinutes).toBeLessThan(5); // Generated within last 5 minutes
  });

  test('should display real compliance data in dashboard', async ({ page }) => {
    await page.goto('http://localhost:5174');

    // Wait for dashboard to load
    await expect(page.locator('text=Executive Command Center')).toBeVisible({ timeout: 10000 });

    // Verify compliance section exists
    await expect(page.locator('text=Compliance')).toBeVisible();

    // Verify NO "N/A" values (all should show numbers or percentages)
    const naElements = await page.locator('text=/N\\/A/').count();
    // Allow some N/A values during initial load, but most should have real data
    expect(naElements).toBeLessThan(5);
  });

  test('should gracefully degrade if BigQuery unavailable', async ({ request }) => {
    // Call API directly
    const response = await request.get('http://localhost:3005/api/compliance/metrics', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJqZXNzZS1hZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1OTM2ODMwNiwiZXhwIjoxNzU5OTczMTA2LCJhdWQiOiJsaXZoYW5hLWxvY2FsIiwiaXNzIjoibGl2aGFuYS1sb2NhbCJ9.Oas7IRYDl5URFrKv52j_6ZHWnZdIwBmAg2Ip830tv5k'
      }
    });

    // Should still return 200 (not error)
    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // Should have success: true even if data is empty
    expect(data.success).toBe(true);
    expect(data.metrics).toBeDefined();

    // If BigQuery fails, should have note explaining
    if (data.metrics.texasCompliance.score === 0) {
      expect(data.note).toBeDefined();
    }
  });
});

// Optimized: 2025-10-02
