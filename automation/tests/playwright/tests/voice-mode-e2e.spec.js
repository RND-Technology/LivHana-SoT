// VOICE MODE E2E TESTS - Playwright MCP Integration
// Mission: Test complete voice mode flow with deterministic mocks

import { test, expect } from '@playwright/test';
import { VoiceServiceMock } from '../mocks/voice-service.mock.js';

test.describe('Voice Mode E2E Flow', () => {
  let voiceServiceMock;

  test.beforeEach(async ({ page }) => {
    // Setup deterministic mocks
    voiceServiceMock = new VoiceServiceMock(page);
    await voiceServiceMock.setupMocks();
    
    // Navigate to voice cockpit
    await page.goto('/voice-cockpit');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup mocks
    if (voiceServiceMock) {
      await voiceServiceMock.teardownMocks();
    }
  });

  test('should complete voice synthesis flow', async ({ page }) => {
    // Test voice synthesis functionality
    const textInput = page.locator('[data-testid="voice-text-input"]');
    const synthesizeButton = page.locator('[data-testid="synthesize-button"]');
    const audioPlayer = page.locator('[data-testid="audio-player"]');

    // Enter text for synthesis
    await textInput.fill('Hello, this is a test message for voice synthesis.');
    
    // Click synthesize button
    await synthesizeButton.click();
    
    // Wait for synthesis to complete
    await expect(audioPlayer).toBeVisible({ timeout: 10000 });
    
    // Verify audio element has source
    const audioSrc = await audioPlayer.getAttribute('src');
    expect(audioSrc).toBeTruthy();
    expect(audioSrc).toContain('blob:');
  });

  test('should enqueue and process reasoning job', async ({ page }) => {
    // Test reasoning queue functionality
    const reasoningInput = page.locator('[data-testid="reasoning-input"]');
    const submitButton = page.locator('[data-testid="submit-reasoning"]');
    const resultContainer = page.locator('[data-testid="reasoning-result"]');

    // Enter reasoning prompt
    await reasoningInput.fill('Explain the benefits of voice-first interfaces in cannabis retail.');
    
    // Submit reasoning job
    await submitButton.click();
    
    // Wait for job to be enqueued
    await expect(page.locator('[data-testid="job-status"]')).toContainText('Job enqueued');
    
    // Wait for reasoning result
    await expect(resultContainer).toBeVisible({ timeout: 15000 });
    await expect(resultContainer).toContainText('Mock reasoning response');
  });

  test('should stream reasoning progress via SSE', async ({ page }) => {
    // Test Server-Sent Events streaming
    const reasoningInput = page.locator('[data-testid="reasoning-input"]');
    const submitButton = page.locator('[data-testid="submit-reasoning"]');
    const progressBar = page.locator('[data-testid="progress-bar"]');

    // Enter reasoning prompt
    await reasoningInput.fill('Analyze cannabis market trends for 2025.');
    
    // Submit reasoning job
    await submitButton.click();
    
    // Wait for progress updates
    await expect(progressBar).toBeVisible();
    
    // Check progress updates (25%, 50%, 75%, 100%)
    await expect(progressBar).toHaveAttribute('value', '25', { timeout: 5000 });
    await expect(progressBar).toHaveAttribute('value', '50', { timeout: 5000 });
    await expect(progressBar).toHaveAttribute('value', '75', { timeout: 5000 });
    await expect(progressBar).toHaveAttribute('value', '100', { timeout: 5000 });
  });

  test('should display queue statistics', async ({ page }) => {
    // Test queue monitoring functionality
    const statsButton = page.locator('[data-testid="show-queue-stats"]');
    const statsModal = page.locator('[data-testid="queue-stats-modal"]');

    // Open queue statistics
    await statsButton.click();
    
    // Verify stats modal is visible
    await expect(statsModal).toBeVisible();
    
    // Check queue statistics
    await expect(statsModal.locator('[data-testid="waiting-jobs"]')).toContainText('2');
    await expect(statsModal.locator('[data-testid="active-jobs"]')).toContainText('1');
    await expect(statsModal.locator('[data-testid="completed-jobs"]')).toContainText('150');
    await expect(statsModal.locator('[data-testid="failed-jobs"]')).toContainText('3');
  });

  test('should handle voice selection', async ({ page }) => {
    // Test voice selection functionality
    const voiceSelect = page.locator('[data-testid="voice-select"]');
    const voiceOption = page.locator('[data-testid="voice-option-rachel"]');

    // Open voice selection dropdown
    await voiceSelect.click();
    
    // Verify voice options are loaded
    await expect(voiceOption).toBeVisible();
    await expect(page.locator('[data-testid="voice-option-domi"]')).toBeVisible();
    
    // Select Rachel voice
    await voiceOption.click();
    
    // Verify selection
    await expect(voiceSelect).toContainText('Rachel');
  });

  test('should show health status indicators', async ({ page }) => {
    // Test health monitoring
    const healthIndicator = page.locator('[data-testid="health-indicator"]');
    const serviceStatus = page.locator('[data-testid="service-status"]');

    // Check health indicator is visible and green
    await expect(healthIndicator).toBeVisible();
    await expect(healthIndicator).toHaveClass(/healthy/);
    
    // Check service status
    await expect(serviceStatus).toContainText('All systems operational');
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Override mock to simulate error
    await page.route('**/api/elevenlabs/synthesize', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'TTS service temporarily unavailable'
        })
      });
    });

    const textInput = page.locator('[data-testid="voice-text-input"]');
    const synthesizeButton = page.locator('[data-testid="synthesize-button"]');
    const errorMessage = page.locator('[data-testid="error-message"]');

    // Attempt synthesis
    await textInput.fill('This should fail');
    await synthesizeButton.click();
    
    // Verify error handling
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('TTS service temporarily unavailable');
  });

  test('should maintain compliance guardrails', async ({ page }) => {
    // Test compliance features
    const complianceIndicator = page.locator('[data-testid="compliance-indicator"]');
    const ageVerificationBadge = page.locator('[data-testid="age-verification"]');

    // Check compliance indicators
    await expect(complianceIndicator).toBeVisible();
    await expect(complianceIndicator).toHaveClass(/compliant/);
    
    // Check age verification
    await expect(ageVerificationBadge).toBeVisible();
    await expect(ageVerificationBadge).toContainText('21+');
  });
});
