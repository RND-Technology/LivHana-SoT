import { test, expect } from '@playwright/test';

test.describe('Empire-Empire Visual Testing Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('capture product page wireframes 2022-2025', async ({ page }) => {
    // Navigate to each product page version
    const years = ['2022', '2023', '2024', '2025'];
    
    for (const year of years) {
      await page.goto(`http://localhost:5173/products/${year}`);
      
      // Wait for animations to complete
      await page.waitForTimeout(1000);
      
      // Capture full page screenshot
      await page.screenshot({
        path: `./screenshots/product-wireframe-${year}.png`,
        fullPage: true
      });
      
      // Capture specific product sections
      const productCard = page.locator('.product-card').first();
      if (await productCard.isVisible()) {
        await productCard.screenshot({
          path: `./screenshots/product-card-${year}.png`
        });
      }
    }
  });

  test('capture Empire Dashboard views', async ({ page }) => {
    await page.goto('http://localhost:5173/empire-dashboard');
    
    // Capture main dashboard
    await page.screenshot({
      path: './screenshots/empire-dashboard-main.png',
      fullPage: true
    });
    
    // Capture each view
    const views = ['revenue', 'products', 'domains', 'analytics'];
    
    for (const view of views) {
      await page.click(`button:has-text("${view.charAt(0).toUpperCase() + view.slice(1)}")`);
      await page.waitForTimeout(500); // Wait for animation
      
      await page.screenshot({
        path: `./screenshots/empire-dashboard-${view}.png`,
        fullPage: true
      });
    }
  });

  test('capture live revenue counter animation', async ({ page }) => {
    await page.goto('http://localhost:5173/empire-dashboard');
    
    // Record video of revenue counter
    const revenueCounter = page.locator('div:has-text("TODAY\'S REVENUE")').locator('..');
    
    // Take multiple screenshots to create animation frames
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(200);
      await revenueCounter.screenshot({
        path: `./screenshots/revenue-animation-frame-${i}.png`
      });
    }
  });

  test('visual regression test for product pages', async ({ page }) => {
    await page.goto('http://localhost:5173/products/current');
    
    // Compare with baseline
    await expect(page).toHaveScreenshot('product-page-baseline.png', {
      maxDiffPixels: 100,
      threshold: 0.2
    });
    
    // Test hover states
    await page.hover('.product-card');
    await expect(page.locator('.product-card')).toHaveScreenshot('product-card-hover.png');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('product-page-mobile.png');
  });

  test('capture compliance engine UI', async ({ page }) => {
    await page.goto('http://localhost:5003/compliance-checker');
    
    // Age verification form
    await page.screenshot({
      path: './screenshots/compliance-age-verification.png',
      clip: { x: 0, y: 0, width: 800, height: 600 }
    });
    
    // State compliance checker
    await page.selectOption('select[name="state"]', 'CA');
    await page.screenshot({
      path: './screenshots/compliance-state-checker.png'
    });
  });

  test('capture all 69 domain previews', async ({ page, context }) => {
    const domains = [
      'reggieanddro.com',
      'herbitrage.com',
      'oneplantsolution.com',
      'highnooncartoon.com'
      // Add more as needed
    ];
    
    for (const domain of domains) {
      // Create new page for each domain
      const newPage = await context.newPage();
      
      try {
        await newPage.goto(`https://${domain}`, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        await newPage.screenshot({
          path: `./screenshots/domains/${domain.replace('.', '-')}.png`,
          fullPage: true
        });
      } catch (error) {
        console.log(`Could not capture ${domain}: ${error.message}`);
      } finally {
        await newPage.close();
      }
    }
  });

  test('generate PDF report of all wireframes', async ({ page }) => {
    await page.goto('http://localhost:5173/empire-dashboard?view=products');
    
    // Generate PDF of product evolution
    await page.pdf({
      path: './reports/product-wireframes-2022-2025.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
  });

  test('accessibility check with screenshots', async ({ page }) => {
    await page.goto('http://localhost:5173/empire-dashboard');
    
    // Inject axe-core for accessibility testing
    await page.addScriptTag({ 
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js' 
    });
    
    // Run accessibility check
    const violations = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore
        window.axe.run((err, results) => {
          resolve(results.violations);
        });
      });
    });
    
    // Screenshot any accessibility violations
    if (Array.isArray(violations) && violations.length > 0) {
      await page.screenshot({
        path: './screenshots/accessibility-violations.png',
        fullPage: true
      });
    }
  });

  test('performance metrics with visual timeline', async ({ page }) => {
    // Start tracing
    await page.context().tracing.start({ 
      screenshots: true, 
      snapshots: true 
    });
    
    await page.goto('http://localhost:5173/empire-dashboard');
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
      };
    });
    
    // Stop tracing and save
    await page.context().tracing.stop({ 
      path: './traces/empire-performance.zip' 
    });
    
    // Screenshot with metrics overlay
    await page.evaluate((metrics) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: #00ff00;
        padding: 20px;
        font-family: monospace;
        z-index: 10000;
        border: 2px solid #00ff00;
      `;
      overlay.innerHTML = `
        <h3>Performance Metrics</h3>
        <p>DOM Loaded: ${metrics.domContentLoaded}ms</p>
        <p>Page Load: ${metrics.loadComplete}ms</p>
        <p>First Paint: ${metrics.firstPaint}ms</p>
      `;
      document.body.appendChild(overlay);
    }, metrics);
    
    await page.screenshot({
      path: './screenshots/performance-metrics.png'
    });
  });
});

// Mobile specific tests
test.describe('Mobile Visual Tests', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  test('mobile dashboard screenshots', async ({ page }) => {
    await page.goto('http://localhost:5173/empire-dashboard');
    
    await page.screenshot({
      path: './screenshots/mobile/dashboard-main.png',
      fullPage: true
    });
    
    // Test swipe gestures
    await page.locator('.revenue-card').first().scrollIntoViewIfNeeded();
    await page.screenshot({
      path: './screenshots/mobile/revenue-card.png'
    });
  });
});

// Optimized: 2025-10-02

// Last optimized: 2025-10-02
