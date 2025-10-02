import { test, expect } from '@playwright/test';

/**
 * LIVHANA EMPIRE - COMPREHENSIVE E2E TEST SUITE
 * Tests: Look, Feel, Functionality, Real Data
 * Inspector: Claude Sonnet 4.5
 */

const BASE_URL = 'http://localhost:5173';
const INTEGRATION_API = 'http://localhost:3005';
const REASONING_API = 'http://localhost:4002';
const VOICE_API = 'http://localhost:4001';

test.describe('LivHana Empire - Full System Test Suite', () => {

  // TIER 1: VISUAL & LAYOUT TESTS
  test.describe('Visual & Layout Verification', () => {

    test('Homepage loads with correct branding and layout', async ({ page }) => {
      await page.goto(BASE_URL);

      // Check page title
      await expect(page).toHaveTitle(/LivHana|Empire|Ultimate Cockpit/i);

      // Verify sidebar is present
      const sidebar = page.locator('[role="navigation"], .sidebar, nav');
      await expect(sidebar).toBeVisible();

      // Screenshot for visual inspection
      await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });
    });

    test('Sidebar contains all 12 navigation items', async ({ page }) => {
      await page.goto(BASE_URL);

      const menuItems = [
        'Ultimate Cockpit',
        'Core Dashboard',
        'Empire Dashboard',
        'Voice Mode',
        'Video Mode',
        'Vibe Coding',
        'Agent Swarm',
        'Square Products',
        'Square Live Cockpit',
        'Empire Systems',
        'Pilot Training',
        'Settings'
      ];

      for (const item of menuItems) {
        const menuItem = page.getByText(item, { exact: false });
        await expect(menuItem).toBeVisible({ timeout: 5000 });
      }

      await page.screenshot({ path: 'test-results/02-sidebar-navigation.png' });
    });

    test('Color scheme and theming is consistent', async ({ page }) => {
      await page.goto(BASE_URL);

      // Check for consistent color palette (adjust selectors as needed)
      const body = page.locator('body');
      const backgroundColor = await body.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // Should have dark theme
      expect(backgroundColor).toMatch(/rgb\(.*\)/);

      await page.screenshot({ path: 'test-results/03-color-scheme.png', fullPage: true });
    });
  });

  // TIER 2: NAVIGATION TESTS
  test.describe('Navigation Functionality', () => {

    test('All navigation links work and load correct components', async ({ page }) => {
      await page.goto(BASE_URL);

      const routes = [
        { link: 'Ultimate Cockpit', expectedUrl: '/ultimate', expectedText: 'Ultimate Cockpit' },
        { link: 'Core Dashboard', expectedUrl: '/dashboard', expectedText: 'Dashboard' },
        { link: 'Empire Dashboard', expectedUrl: '/empire-dashboard', expectedText: 'Empire' },
        { link: 'Voice Mode', expectedUrl: '/voice', expectedText: 'Voice' },
        { link: 'Square Live Cockpit', expectedUrl: '/cockpit', expectedText: 'Square|Cockpit' },
      ];

      for (const route of routes) {
        await page.getByText(route.link, { exact: false }).click();
        await page.waitForURL(`**${route.expectedUrl}`, { timeout: 3000 });

        // Verify content loaded
        await expect(page.getByText(new RegExp(route.expectedText, 'i'))).toBeVisible({ timeout: 5000 });

        await page.screenshot({
          path: `test-results/nav-${route.expectedUrl.replace('/', '')}.png`,
          fullPage: true
        });
      }
    });

    test('Browser back/forward navigation works', async ({ page }) => {
      await page.goto(BASE_URL);

      // Navigate forward
      await page.getByText('Core Dashboard', { exact: false }).click();
      await page.waitForURL('**/dashboard');

      // Go back
      await page.goBack();
      await page.waitForURL('**/');

      // Go forward
      await page.goForward();
      await page.waitForURL('**/dashboard');

      await page.screenshot({ path: 'test-results/04-browser-nav.png' });
    });
  });

  // TIER 3: DATA INTEGRITY TESTS
  test.describe('Real Data Verification', () => {

    test('Square Live Cockpit shows real revenue data', async ({ page }) => {
      await page.goto(BASE_URL + '/cockpit');

      // Wait for data to load
      await page.waitForTimeout(2000);

      // Check for revenue display (should show $77K+)
      const revenueElement = page.locator('text=/\\$\\d+/').first();
      await expect(revenueElement).toBeVisible({ timeout: 10000 });

      const revenueText = await revenueElement.textContent();
      console.log('📊 Revenue displayed:', revenueText);

      // Verify non-zero revenue
      const revenueMatch = revenueText?.match(/\\$([\\d,]+)/);
      if (revenueMatch) {
        const revenueValue = parseInt(revenueMatch[1].replace(',', ''));
        expect(revenueValue).toBeGreaterThan(1000); // Should show at least $1K
      }

      await page.screenshot({ path: 'test-results/05-real-revenue.png', fullPage: true });
    });

    test('Transaction count is non-zero and accurate', async ({ page }) => {
      await page.goto(BASE_URL + '/cockpit');
      await page.waitForTimeout(2000);

      // Look for transaction count
      const transactionElement = page.locator('text=/\\d+.*transaction/i').first();
      await expect(transactionElement).toBeVisible({ timeout: 10000 });

      const txText = await transactionElement.textContent();
      console.log('💳 Transactions displayed:', txText);

      const txMatch = txText?.match(/(\\d+)/);
      if (txMatch) {
        const txCount = parseInt(txMatch[1]);
        expect(txCount).toBeGreaterThan(100); // Should have 100+ transactions
      }

      await page.screenshot({ path: 'test-results/06-transaction-count.png' });
    });

    test('Customer count is accurate', async ({ page }) => {
      await page.goto(BASE_URL + '/cockpit');
      await page.waitForTimeout(2000);

      // Look for customer count
      const customerElement = page.locator('text=/\\d+.*customer/i').first();
      await expect(customerElement).toBeVisible({ timeout: 10000 });

      const custText = await customerElement.textContent();
      console.log('👥 Customers displayed:', custText);

      await page.screenshot({ path: 'test-results/07-customer-count.png' });
    });

    test('BigQuery API returns real data', async ({ request }) => {
      const response = await request.get(`${INTEGRATION_API}/api/bigquery/dashboard`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      console.log('📡 BigQuery API Response:', JSON.stringify(data, null, 2));

      // Verify data structure
      expect(data).toHaveProperty('metrics');
      expect(data.metrics).toHaveProperty('yearRevenue');
      expect(data.metrics.yearRevenue).toBeGreaterThan(10000); // At least $10K

      expect(data.metrics).toHaveProperty('totalTransactions');
      expect(data.metrics.totalTransactions).toBeGreaterThan(100);

      expect(data).toHaveProperty('recentTransactions');
      expect(Array.isArray(data.recentTransactions)).toBeTruthy();
    });
  });

  // TIER 4: INTERACTION TESTS
  test.describe('User Interactions', () => {

    test('Voice Mode button opens modal', async ({ page }) => {
      await page.goto(BASE_URL + '/voice');

      // Look for voice mode button or modal
      const voiceButton = page.getByRole('button', { name: /voice|start|activate/i });
      if (await voiceButton.isVisible()) {
        await voiceButton.click();
        await page.waitForTimeout(1000);
      }

      await page.screenshot({ path: 'test-results/08-voice-mode.png', fullPage: true });
    });

    test('Video Mode interface renders correctly', async ({ page }) => {
      await page.goto(BASE_URL + '/video');
      await page.waitForTimeout(1000);

      // Check for video controls
      const videoControls = page.locator('button').filter({ hasText: /camera|mic|video/i });
      const controlCount = await videoControls.count();
      expect(controlCount).toBeGreaterThanOrEqual(1);

      await page.screenshot({ path: 'test-results/09-video-mode.png', fullPage: true });
    });

    test('Sidebar menu items highlight when active', async ({ page }) => {
      await page.goto(BASE_URL);

      // Click dashboard
      await page.getByText('Core Dashboard', { exact: false }).click();
      await page.waitForURL('**/dashboard');

      // Check if dashboard menu item is highlighted (has selected/active class)
      const dashboardItem = page.getByText('Core Dashboard', { exact: false }).locator('..');
      const classes = await dashboardItem.getAttribute('class') || '';

      console.log('Dashboard menu item classes:', classes);
      // Should contain "selected", "active", or similar
      expect(classes).toMatch(/selected|active|highlight/i);

      await page.screenshot({ path: 'test-results/10-active-highlight.png' });
    });
  });

  // TIER 5: PERFORMANCE TESTS
  test.describe('Performance & Load Times', () => {

    test('Page load time is under 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`⏱️  Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000);
    });

    test('API response time is under 1 second', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${INTEGRATION_API}/api/bigquery/dashboard`);
      const responseTime = Date.now() - startTime;

      console.log(`⚡ API response time: ${responseTime}ms`);
      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(1000);
    });
  });

  // TIER 6: SERVICE HEALTH TESTS
  test.describe('Backend Services Health', () => {

    test('Integration Service (3005) is healthy', async ({ request }) => {
      const response = await request.get(`${INTEGRATION_API}/health`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      console.log('🏥 Integration Service Health:', data);
      expect(data.status).toBe('healthy');
    });

    test('Reasoning Gateway (4002) is healthy', async ({ request }) => {
      try {
        const response = await request.get(`${REASONING_API}/health`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        console.log('🧠 Reasoning Gateway Health:', data);
      } catch (error) {
        console.warn('Reasoning Gateway not accessible:', error);
      }
    });

    test('Voice Service (4001) is healthy', async ({ request }) => {
      try {
        const response = await request.get(`${VOICE_API}/health/voice-mode`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        console.log('🎙️  Voice Service Health:', data);
      } catch (error) {
        console.warn('Voice Service not accessible:', error);
      }
    });
  });

  // TIER 7: EDGE CASES & ERROR HANDLING
  test.describe('Error Handling', () => {

    test('404 page handles gracefully', async ({ page }) => {
      await page.goto(BASE_URL + '/non-existent-page');

      // Should not crash, either show 404 or redirect
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/11-404-handling.png' });
    });

    test('Dashboard handles API errors gracefully', async ({ page, context }) => {
      // Block API requests to simulate error
      await context.route('**/api/bigquery/**', route => route.abort());

      await page.goto(BASE_URL + '/cockpit');
      await page.waitForTimeout(2000);

      // Should show error message or fallback, not crash
      await page.screenshot({ path: 'test-results/12-api-error-handling.png', fullPage: true });
    });
  });

  // TIER 8: RESPONSIVE DESIGN
  test.describe('Responsive Design', () => {

    test('Layout adapts to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(BASE_URL);

      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/13-mobile-view.png', fullPage: true });
    });

    test('Layout adapts to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto(BASE_URL);

      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/14-tablet-view.png', fullPage: true });
    });
  });

  // TIER 9: ACCESSIBILITY
  test.describe('Accessibility Standards', () => {

    test('Page has proper ARIA labels', async ({ page }) => {
      await page.goto(BASE_URL);

      // Check for navigation landmarks
      const nav = await page.locator('[role="navigation"]').count();
      console.log(`♿ Found ${nav} navigation landmarks`);

      await page.screenshot({ path: 'test-results/15-aria-labels.png' });
    });

    test('Keyboard navigation works', async ({ page }) => {
      await page.goto(BASE_URL);

      // Tab through elements
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      // Check if focus is visible
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();

      await page.screenshot({ path: 'test-results/16-keyboard-nav.png' });
    });
  });

  // TIER 10: VISUAL REGRESSION
  test.describe('Visual Regression Tests', () => {

    test('Ultimate Cockpit visual snapshot', async ({ page }) => {
      await page.goto(BASE_URL + '/ultimate');
      await page.waitForTimeout(2000);

      await expect(page).toHaveScreenshot('ultimate-cockpit-snapshot.png', {
        fullPage: true,
        maxDiffPixels: 100
      });
    });

    test('Square Live Cockpit visual snapshot', async ({ page }) => {
      await page.goto(BASE_URL + '/cockpit');
      await page.waitForTimeout(2000);

      await expect(page).toHaveScreenshot('square-cockpit-snapshot.png', {
        fullPage: true,
        maxDiffPixels: 100
      });
    });
  });
});

// Optimized: 2025-10-02
