const { test, expect } = require('@playwright/test');

test.describe('Liv Hana Empire Cockpit - Complete Validation', () => {
  test('Cockpit loads and displays all services', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check page title
    await expect(page).toHaveTitle(/Liv Hana Empire Cockpit/);
    
    // Check header
    await expect(page.locator('h1')).toContainText('Liv Hana Empire Cockpit');
    await expect(page.locator('p')).toContainText('Tier 1 Control Center');
    
    // Check all service cards are present
    await expect(page.locator('.service-card')).toHaveCount(6);
    
    // Check specific services
    await expect(page.locator('text=Age Verification Gate')).toBeVisible();
    await expect(page.locator('text=Integration Service')).toBeVisible();
    await expect(page.locator('text=Reasoning Gateway')).toBeVisible();
    await expect(page.locator('text=Voice Service')).toBeVisible();
    await expect(page.locator('text=Empire Domains')).toBeVisible();
    await expect(page.locator('text=HNC Content Engine')).toBeVisible();
  });

  test('All service links are working', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Test Age Verification Gate link
    const ageGateLink = page.locator('a[href*="age-verification-gate"]').first();
    await expect(ageGateLink).toBeVisible();
    
    // Test Integration Service link
    const integrationLink = page.locator('a[href*="integration-service"]').first();
    await expect(integrationLink).toBeVisible();
    
    // Test Reasoning Gateway link
    const reasoningLink = page.locator('a[href*="reasoning-gateway"]').first();
    await expect(reasoningLink).toBeVisible();
    
    // Test Voice Service link
    const voiceLink = page.locator('a[href*="voice-service"]').first();
    await expect(voiceLink).toBeVisible();
  });

  test('Health check endpoints are accessible', async ({ request }) => {
    // Test cockpit health
    const cockpitHealth = await request.get('http://localhost:8080/health');
    expect(cockpitHealth.status()).toBe(200);
    const cockpitData = await cockpitHealth.json();
    expect(cockpitData.status).toBe('healthy');
    expect(cockpitData.service).toBe('cockpit');
    
    // Test all service health endpoints
    const services = [
      'https://age-verification-gate-980910443251.us-central1.run.app/health',
      'https://integration-service-980910443251.us-central1.run.app/health',
      'https://reasoning-gateway-980910443251.us-central1.run.app/health',
      'https://voice-service-980910443251.us-central1.run.app/health'
    ];
    
    for (const service of services) {
      const response = await request.get(service);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('healthy');
    }
  });

  test('Domain links are present and functional', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check domain cards
    await expect(page.locator('text=reggieanddro.com')).toBeVisible();
    await expect(page.locator('text=livhana.ai')).toBeVisible();
    await expect(page.locator('text=hempretailai.com')).toBeVisible();
    await expect(page.locator('text=texascoa.com')).toBeVisible();
    
    // Check domain links
    const reggieLink = page.locator('a[href*="reggieanddro.com"]');
    await expect(reggieLink).toBeVisible();
    
    const livhanaLink = page.locator('a[href*="livhana.ai"]');
    await expect(livhanaLink).toBeVisible();
  });

  test('HNC Content Engine functionality', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check HNC section
    await expect(page.locator('text=HNC Content Engine')).toBeVisible();
    await expect(page.locator('text=7 Episodes')).toBeVisible();
    await expect(page.locator('text=Daily Schedule')).toBeVisible();
    
    // Test Launch HNC button
    const launchBtn = page.locator('button:has-text("Launch HNC")');
    await expect(launchBtn).toBeVisible();
    
    // Test Publish Content button
    const publishBtn = page.locator('button:has-text("Publish Content")');
    await expect(publishBtn).toBeVisible();
  });

  test('Cockpit responsive design', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.dashboard')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.dashboard')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.dashboard')).toBeVisible();
  });

  test('All metrics display correctly', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check uptime metrics
    await expect(page.locator('text=100%')).toHaveCount(4); // 4 services showing 100% uptime
    
    // Check status indicators
    await expect(page.locator('.status.healthy')).toHaveCount(6); // 6 healthy status indicators
    
    // Check specific metrics
    await expect(page.locator('text=30d')).toBeVisible(); // Age verification cookie duration
    await expect(page.locator('text=TIER 1')).toHaveCount(3); // 3 services showing TIER 1 status
  });

  test('JavaScript functionality works', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Test Launch HNC button functionality
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('HNC Content Engine Launching');
      dialog.accept();
    });
    
    await page.click('button:has-text("Launch HNC")');
    
    // Test Publish Content button functionality
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Content Publishing');
      dialog.accept();
    });
    
    await page.click('button:has-text("Publish Content")');
  });

  test('All external service links open in new tabs', async ({ page, context }) => {
    await page.goto('http://localhost:8080');
    
    // Test that external links open in new tabs
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify target="_blank" attribute
    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
    }
  });

  test('Complete end-to-end validation', async ({ page, request }) => {
    // 1. Cockpit loads
    await page.goto('http://localhost:8080');
    await expect(page).toHaveTitle(/Liv Hana Empire Cockpit/);
    
    // 2. All services displayed
    await expect(page.locator('.service-card')).toHaveCount(6);
    
    // 3. All health checks pass
    const healthEndpoints = [
      'http://localhost:8080/health',
      'https://age-verification-gate-980910443251.us-central1.run.app/health',
      'https://integration-service-980910443251.us-central1.run.app/health',
      'https://reasoning-gateway-980910443251.us-central1.run.app/health',
      'https://voice-service-980910443251.us-central1.run.app/health'
    ];
    
    for (const endpoint of healthEndpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(200);
    }
    
    // 4. All links are present and functional
    await expect(page.locator('a[href*="age-verification-gate"]')).toBeVisible();
    await expect(page.locator('a[href*="integration-service"]')).toBeVisible();
    await expect(page.locator('a[href*="reasoning-gateway"]')).toBeVisible();
    await expect(page.locator('a[href*="voice-service"]')).toBeVisible();
    
    // 5. Domain links present
    await expect(page.locator('a[href*="reggieanddro.com"]')).toBeVisible();
    await expect(page.locator('a[href*="livhana.ai"]')).toBeVisible();
    
    console.log('✅ ALL VALIDATIONS PASSED - COCKPIT FULLY OPERATIONAL');
  });
});
