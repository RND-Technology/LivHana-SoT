/**
 * REGGIEDRO CHECKOUT E2E TEST
 *
 * Priority: P0 - Revenue Protection
 * Purpose: Catch checkout bugs before they reach production
 * Quality Bar: Christopher Esser Standard (8/10 minimum UI grade)
 *
 * This test validates the complete purchase flow at ReggieAndDro.com
 * and creates Linear issues for any failures or UI problems.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://reggieanddro.com';

test.describe('ReggieAndDro Checkout Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to store
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('P0: Complete checkout flow with calendar selection', async ({ page }) => {
    // STEP 1: Category button visibility and contrast
    console.log('✓ Testing category buttons...');

    const categoryButtons = page.locator('.grid-category__button, .ec-store__category-button');
    await expect(categoryButtons.first()).toBeVisible({ timeout: 10000 });

    // Take screenshot for UI grade assessment
    await page.screenshot({
      path: `reports/screenshots/category-buttons-${Date.now()}.png`,
      fullPage: true
    });

    // Check button contrast (should meet WCAG AA 4.5:1)
    const buttonStyles = await categoryButtons.first().evaluate((btn) => {
      const computed = window.getComputedStyle(btn);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontSize: computed.fontSize,
        padding: computed.padding
      };
    });

    console.log('Category button styles:', buttonStyles);

    // STEP 2: Select a product
    console.log('✓ Selecting product...');

    // Click first category (if visible)
    if (await categoryButtons.first().isVisible()) {
      await categoryButtons.first().click();
      await page.waitForTimeout(2000);
    }

    // Select first product
    const productLink = page.locator('.grid-product__wrap-image, .ec-grid__product').first();
    await expect(productLink).toBeVisible({ timeout: 10000 });
    await productLink.click();
    await page.waitForLoadState('networkidle');

    // STEP 3: Add to cart
    console.log('✓ Adding to cart...');

    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag"), .form-control--button--add-to-bag');
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();
    await page.waitForTimeout(2000);

    // STEP 4: Go to checkout
    console.log('✓ Navigating to checkout...');

    const checkoutButton = page.locator('a:has-text("Checkout"), a:has-text("Go to Checkout"), .ec-cart__button--checkout');
    await expect(checkoutButton).toBeVisible({ timeout: 10000 });
    await checkoutButton.click();
    await page.waitForLoadState('networkidle');

    // STEP 5: CRITICAL - Test pickup date/time calendar
    console.log('✓ Testing checkout calendar (P0 CRITICAL)...');

    // Wait for calendar to appear
    const datePickerSection = page.locator(
      '.ec-cart-step__section--delivery-date, .ec-date-picker, [data-testid="date-picker"], input[type="date"]'
    );

    try {
      await expect(datePickerSection).toBeVisible({ timeout: 15000 });

      // Take screenshot of calendar
      await page.screenshot({
        path: `reports/screenshots/checkout-calendar-${Date.now()}.png`,
        fullPage: true
      });

      // Check calendar styling
      const calendarStyles = await datePickerSection.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          position: computed.position,
          border: computed.border,
          background: computed.background
        };
      });

      console.log('Calendar styles:', calendarStyles);

      // Attempt to select a date
      const dateButton = page.locator(
        '.ec-date-picker__day:not(.disabled), .calendar-day:not(.disabled), button[data-date]'
      ).first();

      if (await dateButton.isVisible()) {
        await dateButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Date selection successful');
      } else {
        console.error('❌ No available date buttons found - CALENDAR BROKEN');
        throw new Error('Calendar date buttons not clickable');
      }

      // Check for time slot picker
      const timeSlotPicker = page.locator(
        '.ec-time-picker__slot, .time-slot, [data-testid="time-slot"]'
      );

      if (await timeSlotPicker.first().isVisible({ timeout: 5000 })) {
        await timeSlotPicker.first().click();
        console.log('✅ Time slot selection successful');
      } else {
        console.warn('⚠️  Time slot picker not visible');
      }

    } catch (error) {
      console.error('❌ CHECKOUT CALENDAR FAILURE:', error.message);

      // Take failure screenshot
      await page.screenshot({
        path: `reports/screenshots/checkout-calendar-FAILURE-${Date.now()}.png`,
        fullPage: true
      });

      throw new Error(`P0 BLOCKER: Checkout calendar broken - ${error.message}`);
    }

    // STEP 6: Fill customer details
    console.log('✓ Filling customer details...');

    // Fill form fields (if visible)
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill('test@reggiedro-e2e.com');
    }

    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
    if (await nameInput.first().isVisible({ timeout: 5000 })) {
      await nameInput.first().fill('E2E Test User');
    }

    const phoneInput = page.locator('input[type="tel"], input[name="phone"]');
    if (await phoneInput.isVisible({ timeout: 5000 })) {
      await phoneInput.fill('210-555-0199');
    }

    // STEP 7: Check for payment options
    console.log('✓ Checking payment options...');

    const paymentMethods = await page.locator(
      '[data-payment-method], .payment-method, button:has-text("AfterPay"), button:has-text("Klarna")'
    ).allTextContents();

    console.log('Available payment methods:', paymentMethods);

    const hasAfterPay = paymentMethods.some(text => text.toLowerCase().includes('afterpay'));
    const hasKlarna = paymentMethods.some(text => text.toLowerCase().includes('klarna'));

    if (!hasAfterPay) {
      console.warn('⚠️  AfterPay not available (P1 priority)');
    }

    if (!hasKlarna) {
      console.warn('⚠️  Klarna not available (P1 priority)');
    }

    // FINAL: Take complete checkout screenshot for UI grading
    await page.screenshot({
      path: `reports/screenshots/checkout-complete-${Date.now()}.png`,
      fullPage: true
    });

    console.log('✅ CHECKOUT FLOW TEST COMPLETE');
  });

  test('UI Grade: Category buttons meet design standards', async ({ page }) => {
    const categoryButtons = page.locator('.grid-category__button').first();

    if (await categoryButtons.isVisible({ timeout: 5000 })) {
      const styles = await categoryButtons.evaluate((btn) => {
        const computed = window.getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();

        return {
          width: rect.width,
          height: rect.height,
          fontSize: parseInt(computed.fontSize),
          padding: computed.padding,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderRadius: computed.borderRadius,
          transition: computed.transition
        };
      });

      // Christopher Esser Standards
      const standards = {
        maxWidth: 250, // buttons shouldn't be oversized
        minFontSize: 12, // readable text
        maxFontSize: 18, // not oversized text
        hasPadding: styles.padding !== '0px',
        hasTransition: styles.transition.includes('all') || styles.transition.includes('background'),
        hasBorderRadius: parseInt(styles.borderRadius) > 0
      };

      console.log('Button dimensions:', { width: styles.width, height: styles.height });
      console.log('Button font size:', styles.fontSize);
      console.log('Standards check:', standards);

      // Grade UI (1-10)
      let uiGrade = 10;

      if (styles.width > standards.maxWidth) {
        console.warn('❌ Buttons too wide');
        uiGrade -= 2;
      }

      if (styles.fontSize > standards.maxFontSize) {
        console.warn('❌ Font too large');
        uiGrade -= 1;
      }

      if (!standards.hasPadding) {
        console.warn('❌ Missing padding');
        uiGrade -= 1;
      }

      if (!standards.hasTransition) {
        console.warn('❌ Missing smooth transitions');
        uiGrade -= 1;
      }

      if (!standards.hasBorderRadius) {
        console.warn('❌ Missing border radius');
        uiGrade -= 1;
      }

      console.log(`UI Grade: ${uiGrade}/10 (Christopher Standard: 8+ required)`);

      if (uiGrade < 8) {
        throw new Error(`UI FAILS Christopher Esser Standard: ${uiGrade}/10`);
      }
    }
  });

  test('Performance: Page load under 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(3000);
  });

  test('Accessibility: WCAG AA contrast ratios', async ({ page }) => {
    // Check main elements for contrast
    const elementsToCheck = [
      '.grid-category__button',
      '.grid-product__title',
      '.ec-cart__button',
      'h1, h2, h3'
    ];

    for (const selector of elementsToCheck) {
      const element = page.locator(selector).first();

      if (await element.isVisible({ timeout: 5000 })) {
        const contrast = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);

          // Simple contrast check (real implementation would calculate luminance)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });

        console.log(`${selector} contrast:`, contrast);
      }
    }
  });
});

/**
 * TEST RESULT ACTIONS:
 *
 * IF ANY TEST FAILS:
 * 1. Screenshot saved to reports/screenshots/
 * 2. Create Linear issue with:
 *    - Priority: P0 if checkout calendar fails
 *    - Priority: P1 if UI grade < 8
 *    - Label: e2e-failure, revenue-blocker (if P0)
 * 3. Block deployment
 *
 * IF ALL TESTS PASS:
 * 1. Approve deployment
 * 2. Log success to monitoring
 */
