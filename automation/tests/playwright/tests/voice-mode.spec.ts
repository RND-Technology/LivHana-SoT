import { test, expect } from '@playwright/test';
import { createReasoningSSEPayload } from '../mocks/sse.js';

const mockAudio = Buffer.from('ID3');

const shouldRun = Boolean(process.env.PLAYWRIGHT_BASE_URL);

if (!shouldRun) {
  test.describe.skip('Liv Hana Voice Mode', () => {
    test('skipped due to missing base URL', () => {
      // noop
    });
  });
} else {
  test.describe('Liv Hana Voice Mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/elevenlabs/synthesize', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg' },
          body: mockAudio,
        });
      });

      await page.route('**/api/reasoning/enqueue', async (route) => {
        await route.fulfill({
          status: 202,
          contentType: 'application/json',
          body: JSON.stringify({ jobId: 'mock-job-id' }),
        });
      });

      await page.route('**/api/reasoning/result/mock-job-id', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'completed', result: { final: 'Mock final response' } }),
        });
      });

      await page.route('**/api/reasoning/stream/mock-job-id', async (route) => {
        await route.fulfill({
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            Connection: 'keep-alive',
            'Cache-Control': 'no-cache',
          },
          body: createReasoningSSEPayload(),
        });
      });
    });

    test('activates voice mode, requests reasoning, and displays streamed results', async ({ page }) => {
      await page.goto('/');

      await page.getByTestId('open-voice-mode').click();
      await page.getByText('Enable Voice Mode').click();

      await page.getByTestId('reasoning-submit-button').click();

      await expect(page.getByTestId('reasoning-status-text')).toContainText('progress');
      await expect(page.getByTestId('reasoning-partial')).toContainText('Mock partial');

      await expect(page.getByTestId('reasoning-final')).toContainText('Mock final response');
      await expect(page.getByTestId('reasoning-status-chip')).toContainText('Reasoning Status: completed');

      await page.getByTestId('test-voice-button').click();

      await expect(page.getByTestId('voice-mode-status')).toContainText('Voice Mode: Active');
      await expect(page.getByTestId('voice-mode-status')).toContainText('Agent Status: ready');
    });
  });
}

// Optimized: 2025-10-02
