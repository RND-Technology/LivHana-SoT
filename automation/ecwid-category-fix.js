#!/usr/bin/env node

/**
 * ECWID CATEGORY BOX FIX - AUTOMATED
 *
 * Tier 1 Solution: Playwright automation to fix category boxes in Ecwid admin
 *
 * USAGE:
 * 1. Set environment variables:
 *    export ECWID_EMAIL="your-email@example.com"
 *    export ECWID_PASSWORD="your-password"
 *
 * 2. Run script:
 *    node automation/ecwid-category-fix.js
 *
 * WHAT IT DOES:
 * - Logs into Ecwid admin
 * - Navigates to Design → Custom CSS
 * - Injects CSS fix for category box text visibility
 * - Saves changes
 * - Takes screenshots for verification
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ECWID_LOGIN_URL = 'https://my.ecwid.com/cp/';
const CSS_FIX = `
/* CATEGORY BOX TEXT FIX - Added by automation */
/* Issue: Category boxes show no text until hover */
/* Fix: Force text to be visible always */

.ec-store .grid-category__title,
.ec-store .grid-category__name,
.ec-store .category-card__title,
.ec-store .category-card__name,
.ec-category__title,
.category-box-text,
[class*="category"] [class*="title"],
[class*="category"] [class*="name"] {
  color: #000000 !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
}

/* Ensure hover state still works */
.ec-store .grid-category:hover .grid-category__title,
.ec-store .category-card:hover .category-card__title {
  color: #2D5F3F !important; /* Your brand green */
}

/* Mobile specific fixes */
@media (max-width: 768px) {
  .ec-store .grid-category__title,
  .ec-store .category-card__title {
    color: #000000 !important;
    font-size: 16px !important;
    font-weight: 700 !important;
  }
}

/* END AUTOMATION FIX */
`;

async function fixEcwidCategories() {
  console.log('🚀 Starting Ecwid Category Box Fix Automation');
  console.log('');

  // Check environment variables
  const email = process.env.ECWID_EMAIL;
  const password = process.env.ECWID_PASSWORD;

  if (!email || !password) {
    console.error('❌ ERROR: Missing credentials');
    console.error('');
    console.error('Please set environment variables:');
    console.error('  export ECWID_EMAIL="your-email@example.com"');
    console.error('  export ECWID_PASSWORD="your-password"');
    console.error('');
    process.exit(1);
  }

  // Create screenshots directory
  const screenshotsDir = path.join(process.cwd(), 'automation', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('📸 Screenshots will be saved to:', screenshotsDir);
  console.log('');

  // Launch browser
  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({
    headless: false, // Set to true for background execution
    slowMo: 100 // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to Ecwid login
    console.log('🔐 Navigating to Ecwid login...');
    await page.goto(ECWID_LOGIN_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, '01-login-page.png') });

    // Step 2: Enter credentials
    console.log('✍️  Entering credentials...');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.screenshot({ path: path.join(screenshotsDir, '02-credentials-entered.png') });

    // Step 3: Click login
    console.log('🚪 Logging in...');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '03-logged-in.png') });

    console.log('✅ Logged in successfully');
    console.log('');

    // Step 4: Navigate to Design settings
    console.log('🎨 Navigating to Design settings...');

    // Look for Design menu item
    await page.click('text=Design');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '04-design-menu.png') });

    // Step 5: Find Custom CSS section
    console.log('📝 Looking for Custom CSS section...');

    // Click on Custom CSS or Themes
    const customCssButton = await page.locator('text=Custom CSS').first();
    if (await customCssButton.isVisible()) {
      await customCssButton.click();
      await page.waitForTimeout(2000);
    } else {
      // Try alternate path
      await page.click('text=Themes');
      await page.waitForTimeout(2000);
      await page.click('text=Edit CSS');
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: path.join(screenshotsDir, '05-custom-css-page.png') });

    // Step 6: Find CSS editor
    console.log('✏️  Finding CSS editor...');

    const cssEditor = await page.locator('textarea, .ace_editor, [contenteditable="true"]').first();

    if (!await cssEditor.isVisible()) {
      throw new Error('Could not find CSS editor');
    }

    // Get existing CSS
    const existingCSS = await cssEditor.textContent() || '';
    console.log('📄 Found existing CSS:', existingCSS.length, 'characters');

    // Step 7: Inject fix
    console.log('💉 Injecting CSS fix...');

    // Click into editor
    await cssEditor.click();

    // Append CSS fix
    await page.keyboard.press('End'); // Go to end of document
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type(CSS_FIX);

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '06-css-injected.png') });

    console.log('✅ CSS fix injected');
    console.log('');

    // Step 8: Save changes
    console.log('💾 Saving changes...');

    const saveButton = await page.locator('button:has-text("Save"), button:has-text("Apply")').first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '07-changes-saved.png') });

    console.log('✅ Changes saved successfully');
    console.log('');

    // Step 9: Verify on storefront
    console.log('🔍 Verifying fix on storefront...');
    await page.goto('https://reggieanddro.com/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '08-storefront-after-fix.png'), fullPage: true });

    console.log('✅ Storefront screenshot captured');
    console.log('');
    console.log('🎉 AUTOMATION COMPLETE!');
    console.log('');
    console.log('📸 Review screenshots in:', screenshotsDir);
    console.log('');
    console.log('Next steps:');
    console.log('1. Check storefront: https://reggieanddro.com/products');
    console.log('2. Verify category boxes show text');
    console.log('3. Test on mobile');
    console.log('');

  } catch (error) {
    console.error('❌ AUTOMATION FAILED');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Stack trace:', error.stack);
    console.error('');

    // Take error screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'ERROR-screenshot.png'),
      fullPage: true
    });

    console.error('📸 Error screenshot saved');
    console.error('');

    throw error;

  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser left open for manual inspection');
    console.log('Press Ctrl+C to close');

    // Wait indefinitely
    await new Promise(() => {});
  }
}

// Run automation
fixEcwidCategories().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
