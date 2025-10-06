#!/usr/bin/env node
/**
 * GMAIL BROWSER SEARCH - Lindsay Goldsmith + Square
 * Uses Playwright to log into Gmail and extract emails
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const GMAIL_EMAIL = 'jesseniesen@gmail.com';
const GMAIL_PASSWORD = 'HighNoon2025';

async function searchGmail() {
  console.log('🚀 Starting Gmail browser search');
  console.log(`📧 Account: ${GMAIL_EMAIL}\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Login to Gmail
    console.log('🔐 Logging into Gmail...');
    await page.goto('https://mail.google.com/');
    await page.waitForTimeout(2000);

    // Enter email
    const emailInput = await page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(GMAIL_EMAIL);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
    }

    // Enter password
    const passwordInput = await page.locator('input[type="password"]').first();
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(GMAIL_PASSWORD);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);
    }

    console.log('✅ Logged in to Gmail\n');

    // Search for Lindsay Goldsmith
    console.log('🔍 Searching for: Lindsay Goldsmith');
    await page.waitForSelector('input[aria-label="Search mail"]', { timeout: 10000 });
    const searchBox = await page.locator('input[aria-label="Search mail"]').first();
    await searchBox.fill('Lindsay Goldsmith OR (Square AND deactivat)');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    console.log('📧 Found emails, extracting...\n');

    // Get all email threads
    const emailThreads = await page.locator('[role="main"] table tbody tr').all();
    console.log(`Found ${emailThreads.length} threads\n`);

    const emails = [];

    for (let i = 0; i < Math.min(emailThreads.length, 10); i++) {
      try {
        // Click on email thread
        await emailThreads[i].click();
        await page.waitForTimeout(2000);

        // Extract email content
        const subject = await page.locator('h2.hP').first().textContent().catch(() => 'Unknown');
        const from = await page.locator('.gD').first().getAttribute('email').catch(() => 'Unknown');
        const date = await page.locator('.g3').first().textContent().catch(() => 'Unknown');

        // Get email body
        const bodyElements = await page.locator('.a3s.aiL').all();
        let body = '';
        for (const elem of bodyElements) {
          body += await elem.textContent() + '\n\n';
        }

        const email = {
          index: i + 1,
          subject,
          from,
          date,
          body: body.trim()
        };

        emails.push(email);

        console.log(`\n📧 EMAIL ${i + 1}`);
        console.log(`From: ${from}`);
        console.log(`Subject: ${subject}`);
        console.log(`Date: ${date}`);
        console.log(`Body preview: ${body.substring(0, 200)}...\n`);
        console.log('='.repeat(80));

        // Go back to search results
        await page.goBack();
        await page.waitForTimeout(1000);

      } catch (error) {
        console.error(`Failed to extract email ${i + 1}:`, error.message);
      }
    }

    // Save results
    const report = `# SQUARE DEACTIVATION EMAILS - LINDSAY GOLDSMITH

Found: ${emails.length} emails

${'='.repeat(80)}

${emails.map(e => `
## EMAIL ${e.index}

**From**: ${e.from}
**Subject**: ${e.subject}
**Date**: ${e.date}

### Body:
${e.body}

${'='.repeat(80)}
`).join('\n')}
`;

    writeFileSync('automation/SQUARE_EMAILS_EXTRACTED.md', report);
    console.log('\n\n✅ EXTRACTION COMPLETE');
    console.log('📁 Saved to: automation/SQUARE_EMAILS_EXTRACTED.md\n');

    // Analyze
    console.log('\n📊 QUICK ANALYSIS:\n');

    const allText = emails.map(e => e.body).join(' ').toLowerCase();

    if (allText.includes('deactivat')) {
      console.log('✅ Deactivation mentioned');
    }
    if (allText.includes('cbd') || allText.includes('hemp')) {
      console.log('✅ CBD/Hemp mentioned');
    }
    if (allText.includes('visa')) {
      console.log('✅ VISA mentioned');
    }
    if (allText.includes('reactivat') || allText.includes('appeal')) {
      console.log('✅ Reactivation path mentioned');
    }

    return emails;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await page.screenshot({ path: 'automation/gmail-error.png', fullPage: true });
    throw error;
  } finally {
    console.log('\n🔍 Browser left open for manual review');
    console.log('Press Ctrl+C to close');
    await new Promise(() => {}); // Keep browser open
  }
}

searchGmail().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
