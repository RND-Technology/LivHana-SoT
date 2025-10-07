#!/usr/bin/env node

// PLAYWRIGHT INSPECTION - HIGHNOONCARTOON.COM
// Using Playwright to see the actual problem and fix it

import { chromium } from 'playwright';

async function inspectHighNoonCartoon() {
    console.log('🔍 LAUNCHING PLAYWRIGHT TO INSPECT HIGHNOONCARTOON.COM...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('📱 Navigating to HighNoonCartoon.com...');
        await page.goto('https://storage.googleapis.com/hnc-episodes-prod/highnooncartoon.html');
        
        console.log('⏳ Waiting for page to load...');
        await page.waitForLoadState('networkidle');
        
        console.log('📸 Taking screenshot...');
        await page.screenshot({ path: 'highnooncartoon-inspection.png', fullPage: true });
        
        console.log('🔍 Checking page title...');
        const title = await page.title();
        console.log(`📋 Page title: ${title}`);
        
        console.log('🔍 Checking if video player exists...');
        const videoExists = await page.locator('video').count();
        console.log(`🎬 Video elements found: ${videoExists}`);
        
        console.log('🔍 Checking if seasons grid exists...');
        const seasonsGridExists = await page.locator('#seasonsGrid').count();
        console.log(`📺 Seasons grid found: ${seasonsGridExists}`);
        
        console.log('🔍 Checking if episodes are loaded...');
        const episodeLinks = await page.locator('.episode-link').count();
        console.log(`🔗 Episode links found: ${episodeLinks}`);
        
        console.log('🔍 Checking page content...');
        const bodyText = await page.locator('body').textContent();
        console.log(`📄 Page content length: ${bodyText.length} characters`);
        
        console.log('🔍 Checking for JavaScript errors...');
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        console.log('🔍 Checking CSS loading...');
        const stylesheets = await page.locator('link[rel="stylesheet"]').count();
        console.log(`🎨 Stylesheets loaded: ${stylesheets}`);
        
        console.log('🔍 Checking JavaScript loading...');
        const scripts = await page.locator('script').count();
        console.log(`📜 Scripts loaded: ${scripts}`);
        
        console.log('🔍 Checking for network errors...');
        const networkErrors = [];
        page.on('response', response => {
            if (!response.ok()) {
                networkErrors.push(`${response.url()} - ${response.status()}`);
            }
        });
        
        // Wait a bit for any async operations
        await page.waitForTimeout(2000);
        
        console.log('📊 INSPECTION RESULTS:');
        console.log(`   Page title: ${title}`);
        console.log(`   Video elements: ${videoExists}`);
        console.log(`   Seasons grid: ${seasonsGridExists}`);
        console.log(`   Episode links: ${episodeLinks}`);
        console.log(`   Page content length: ${bodyText.length}`);
        console.log(`   Stylesheets: ${stylesheets}`);
        console.log(`   Scripts: ${scripts}`);
        console.log(`   JavaScript errors: ${errors.length}`);
        console.log(`   Network errors: ${networkErrors.length}`);
        
        if (errors.length > 0) {
            console.log('❌ JavaScript errors found:');
            errors.forEach(error => console.log(`   ${error}`));
        }
        
        if (networkErrors.length > 0) {
            console.log('❌ Network errors found:');
            networkErrors.forEach(error => console.log(`   ${error}`));
        }
        
        // Check if the page is actually loading
        const pageContent = await page.content();
        console.log(`📄 Full page content length: ${pageContent.length}`);
        
        // Check if our JavaScript is executing
        const seasonsGrid = await page.locator('#seasonsGrid');
        const gridContent = await seasonsGrid.textContent();
        console.log(`📺 Seasons grid content: ${gridContent ? gridContent.substring(0, 100) : 'No content'}`);
        
        console.log('✅ INSPECTION COMPLETE!');
        console.log('📸 Screenshot saved as: highnooncartoon-inspection.png');
        
    } catch (error) {
        console.error('❌ Error during inspection:', error);
    } finally {
        await browser.close();
    }
}

// Run the inspection
inspectHighNoonCartoon();

