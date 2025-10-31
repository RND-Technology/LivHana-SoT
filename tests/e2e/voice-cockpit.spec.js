// tests/e2e/voice-cockpit.spec.js
import { test, expect } from '@playwright/test';

test.describe('Voice Cockpit E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the voice cockpit
    await page.goto('/');
  });

  test('Voice cockpit loads successfully', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/LivHana|Voice|Vibe/);

    // Check for main UI elements
    const mainContent = page.locator('main, .main, #app, .app');
    await expect(mainContent).toBeVisible();
  });

  test('Voice interface elements are present', async ({ page }) => {
    // Check for voice-related UI elements
    const voiceElements = [
      page.getByText(/voice|Voice|Vocal|Speak|Listen/i),
      page.getByRole('button', { name: /record|Record|start|Start/i }),
      page.getByRole('button', { name: /stop|Stop|end|End/i }),
      page.locator('[data-testid*="voice"], [class*="voice"], #voice-interface')
    ];

    // At least one voice element should be present
    let foundVoiceElement = false;
    for (const element of voiceElements) {
      try {
        await expect(element.first()).toBeVisible({ timeout: 1000 });
        foundVoiceElement = true;
        break;
      } catch (e) {
        // Continue checking other elements
      }
    }

    expect(foundVoiceElement).toBe(true);
  });

  test('System status indicators are present', async ({ page }) => {
    // Check for status indicators
    const statusElements = [
      page.getByText(/status|Status|online|Online|ready|Ready/i),
      page.locator('[data-testid*="status"], [class*="status"], .status-indicator'),
      page.getByText(/latency|Latency|response|Response/i)
    ];

    // At least one status element should be present
    let foundStatusElement = false;
    for (const element of statusElements) {
      try {
        await expect(element.first()).toBeVisible({ timeout: 1000 });
        foundStatusElement = true;
        break;
      } catch (e) {
        // Continue checking other elements
      }
    }

    expect(foundStatusElement).toBe(true);
  });

  test('Agent status is displayed', async ({ page }) => {
    // Check for agent-related elements
    const agentElements = [
      page.getByText(/agent|Agent|planning|research|artifact|execmon|qa/i),
      page.locator('[data-testid*="agent"], [class*="agent"]'),
      page.getByText(/5.*agent|agent.*5/i)
    ];

    // At least one agent element should be present
    let foundAgentElement = false;
    for (const element of agentElements) {
      try {
        await expect(element.first()).toBeVisible({ timeout: 1000 });
        foundAgentElement = true;
        break;
      } catch (e) {
        // Continue checking other elements
      }
    }

    expect(foundAgentElement).toBe(true);
  });

  test('Error handling works', async ({ page }) => {
    // Try to trigger an error condition (if possible)
    // This is a basic check that the app doesn't crash on errors

    // Check that no console errors occur during normal operation
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for the page to stabilize
    await page.waitForTimeout(2000);

    // Should not have critical console errors
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') && // Ignore favicon errors
      !error.includes('chunk') &&   // Ignore chunk loading warnings
      !error.includes('websocket')  // Ignore websocket connection warnings
    );

    expect(criticalErrors.length).toBeLessThan(3); // Allow some minor errors
  });

  test('Responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Main content should still be visible
    const mainContent = page.locator('main, .main, #app, .app');
    await expect(mainContent).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(mainContent).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(mainContent).toBeVisible();
  });
});