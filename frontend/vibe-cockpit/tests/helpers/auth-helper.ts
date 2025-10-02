/**
 * Authentication Helper for E2E Tests
 * LivHana Trinity E2E Testing - TIER 1
 */

import { Page, BrowserContext } from '@playwright/test';
import { getTestToken } from '../fixtures/auth-tokens';

/**
 * Set authentication token in localStorage
 * Call this in beforeEach to ensure user is authenticated
 */
export async function setAuthToken(context: BrowserContext, token?: string) {
  await context.addInitScript((tokenValue) => {
    localStorage.setItem('livhana_session_token', tokenValue);
  }, token || getTestToken('admin'));
}

/**
 * Clear authentication token from localStorage
 */
export async function clearAuthToken(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('livhana_session_token');
  });
}

/**
 * Get authentication token from localStorage
 */
export async function getStoredAuthToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    return localStorage.getItem('livhana_session_token');
  });
}

/**
 * Verify user is authenticated by checking token presence
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const token = await getStoredAuthToken(page);
  return token !== null && token.length > 0;
}

/**
 * Wait for authentication to be established
 */
export async function waitForAuth(page: Page, timeout: number = 5000): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await isAuthenticated(page)) {
      return;
    }
    await page.waitForTimeout(100);
  }
  throw new Error('Authentication timeout: token not found in localStorage');
}

/**
 * Setup authenticated context for tests
 * Use this in test.beforeEach
 */
export async function setupAuthenticatedTest(context: BrowserContext, role: 'admin' | 'user' = 'admin') {
  await setAuthToken(context, getTestToken(role));
}

// Optimized: 2025-10-02
