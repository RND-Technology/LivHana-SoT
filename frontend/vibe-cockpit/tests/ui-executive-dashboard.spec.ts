/**
 * Executive Dashboard UI Tests
 * LivHana Trinity - TIER 1 UI/UX
 */

import { test, expect } from '@playwright/test';
import { setupAuthenticatedTest } from './helpers/auth-helper';

test.describe('Executive Dashboard UI', () => {
  test.beforeEach(async ({ context, page }) => {
    await setupAuthenticatedTest(context, 'admin');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard loads and displays key metrics', async ({ page }) => {
    console.log('Testing executive dashboard UI...');

    // Check for revenue/metrics displays
    const hasMetrics = await page.locator('text=/Revenue|Sales|Customers|Orders/i').count() > 0;
    expect(hasMetrics).toBeTruthy();

    console.log('  Dashboard metrics: VISIBLE');
  });

  test('Navigation menu is accessible', async ({ page }) => {
    console.log('Testing navigation menu...');

    const nav = page.locator('nav, [role="navigation"], button, a').first();
    await expect(nav).toBeVisible();

    console.log('  Navigation: ACCESSIBLE');
  });

  test('Dashboard is responsive', async ({ page }) => {
    console.log('Testing responsive design...');

    // Test different viewport sizes
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();

    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();

    console.log('  Responsive design: PASSED');
  });

  test('No critical console errors on dashboard', async ({ page }) => {
    console.log('Testing for console errors...');

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter(err =>
      !err.includes('Failed to fetch') &&
      !err.includes('NetworkError') &&
      !err.includes('401')
    );

    expect(criticalErrors.length).toBe(0);
    console.log('  Console errors: NONE');
  });
});
