import { test, expect } from '@playwright/test';

test.describe('PIMP AF Dashboard Visual Capture', () => {
  
  test('capture PIMP AF products page', async ({ page }) => {
    // Navigate to products
    await page.goto('http://localhost:5173/products');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({
      path: './screenshots/pimp-products.png',
      fullPage: true
    });
    
    // Log success
    console.log('✅ PIMP AF Products page captured!');
  });

  test('capture Empire Dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/empire-dashboard');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: './screenshots/empire-dashboard.png',
      fullPage: true
    });
    
    console.log('✅ Empire Dashboard captured!');
  });

  test('capture Square Live Cockpit', async ({ page }) => {
    await page.goto('http://localhost:5173/cockpit');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: './screenshots/square-cockpit.png',
      fullPage: true
    });
    
    console.log('✅ Square Cockpit captured!');
  });
});
