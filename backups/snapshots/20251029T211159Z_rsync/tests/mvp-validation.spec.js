const { test, expect } = require('@playwright/test');

const SERVICES = [
  {
    name: 'Age Verification Gate',
    url: 'https://age-verification-gate-980910443251.us-central1.run.app',
    healthEndpoint: '/health',
    expectedStatus: 200
  },
  {
    name: 'Integration Service',
    url: 'https://integration-service-980910443251.us-central1.run.app',
    healthEndpoint: '/health',
    expectedStatus: 200
  },
  {
    name: 'Reasoning Gateway',
    url: 'https://reasoning-gateway-980910443251.us-central1.run.app',
    healthEndpoint: '/health',
    expectedStatus: 200
  },
  {
    name: 'Voice Service',
    url: 'https://voice-service-980910443251.us-central1.run.app',
    healthEndpoint: '/health',
    expectedStatus: 200
  }
];

test.describe('MVP Services Validation', () => {
  for (const service of SERVICES) {
    test(`${service.name} - Health Check`, async ({ request }) => {
      const response = await request.get(`${service.url}${service.healthEndpoint}`);
      expect(response.status()).toBe(service.expectedStatus);
      
      if (service.name === 'Age Verification Gate') {
        // Age gate returns HTML, not JSON
        const text = await response.text();
        expect(text).toContain('Age Verification Required');
      } else {
        // Other services return JSON
        const data = await response.json();
        expect(data.status).toBe('healthy');
        expect(data.service).toBeDefined();
        expect(data.message).toContain('Production Ready');
      }
    });

    test(`${service.name} - Main Page Loads`, async ({ page }) => {
      await page.goto(service.url);
      await expect(page).toHaveTitle(/Age Verification|Service|Gateway|Voice/);
    });
  }

  test('Age Verification Gate - Cookie Functionality', async ({ page }) => {
    await page.goto('https://age-verification-gate-980910443251.us-central1.run.app');
    
    // Should show age verification page
    await expect(page.locator('h1')).toContainText('Age Verification Required');
    
    // Click verify age button
    await page.click('button:has-text("I am 21 or older")');
    
    // Should redirect and set cookie
    await page.waitForURL('**/');
    
    // Verify cookie is set
    const cookies = await page.context().cookies();
    const ageVerifiedCookie = cookies.find(cookie => cookie.name === 'ageVerified');
    expect(ageVerifiedCookie).toBeDefined();
    expect(ageVerifiedCookie.value).toBe('true');
  });

  test('Integration Service - API Endpoints', async ({ request }) => {
    const baseUrl = 'https://integration-service-980910443251.us-central1.run.app';
    
    // Test health endpoint
    const healthResponse = await request.get(`${baseUrl}/health`);
    expect(healthResponse.status()).toBe(200);
    
    // Test API endpoint (if exists)
    const apiResponse = await request.get(`${baseUrl}/api/v1/status`);
    // Should either return 200 or 404 (if endpoint doesn't exist)
    expect([200, 404]).toContain(apiResponse.status());
  });

  test('Reasoning Gateway - API Endpoints', async ({ request }) => {
    const baseUrl = 'https://reasoning-gateway-980910443251.us-central1.run.app';
    
    // Test health endpoint
    const healthResponse = await request.get(`${baseUrl}/health`);
    expect(healthResponse.status()).toBe(200);
    
    // Test API endpoint (if exists)
    const apiResponse = await request.get(`${baseUrl}/api/v1/status`);
    // Should either return 200 or 404 (if endpoint doesn't exist)
    expect([200, 404]).toContain(apiResponse.status());
  });

  test('Voice Service - API Endpoints', async ({ request }) => {
    const baseUrl = 'https://voice-service-980910443251.us-central1.run.app';
    
    // Test health endpoint
    const healthResponse = await request.get(`${baseUrl}/health`);
    expect(healthResponse.status()).toBe(200);
    
    // Test API endpoint (if exists)
    const apiResponse = await request.get(`${baseUrl}/api/v1/status`);
    // Should either return 200 or 404 (if endpoint doesn't exist)
    expect([200, 404]).toContain(apiResponse.status());
  });
});
