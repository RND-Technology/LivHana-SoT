#!/usr/bin/env node

// FINAL VERIFICATION - HIGHNOONCARTOON.COM
// Using Playwright to verify the real content is now deployed

import { chromium } from 'playwright';

async function finalVerification() {
    console.log('🔍 FINAL VERIFICATION OF HIGHNOONCARTOON.COM...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('📱 Navigating to HighNoonCartoon.com with cache bust...');
        await page.goto(`https://storage.googleapis.com/hnc-episodes-prod/highnooncartoon.html?v=${Date.now()}`);
        
        console.log('⏳ Waiting for page to load...');
        await page.waitForLoadState('networkidle');
        
        console.log('📸 Taking screenshot...');
        await page.screenshot({ path: 'highnooncartoon-final.png', fullPage: true });
        
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
        
        console.log('🔍 Checking for "84 Episodes" text...');
        const episodesText = await page.locator('text=84 Episodes').count();
        console.log(`📊 "84 Episodes" text found: ${episodesText}`);
        
        console.log('🔍 Checking for "12 Seasons" text...');
        const seasonsText = await page.locator('text=12 Seasons').count();
        console.log(`📺 "12 Seasons" text found: ${seasonsText}`);
        
        console.log('🔍 Checking for season cards...');
        const seasonCards = await page.locator('.season-card').count();
        console.log(`🎬 Season cards found: ${seasonCards}`);
        
        console.log('🔍 Checking for episode items...');
        const episodeItems = await page.locator('.episode-item').count();
        console.log(`📺 Episode items found: ${episodeItems}`);
        
        // Wait for JavaScript to execute
        await page.waitForTimeout(3000);
        
        console.log('🔍 Re-checking episodes after JS execution...');
        const episodeLinksAfter = await page.locator('.episode-link').count();
        console.log(`🔗 Episode links after JS: ${episodeLinksAfter}`);
        
        console.log('📊 FINAL VERIFICATION RESULTS:');
        console.log(`   Page title: ${title}`);
        console.log(`   Video elements: ${videoExists}`);
        console.log(`   Seasons grid: ${seasonsGridExists}`);
        console.log(`   Episode links: ${episodeLinksAfter}`);
        console.log(`   "84 Episodes" text: ${episodesText}`);
        console.log(`   "12 Seasons" text: ${seasonsText}`);
        console.log(`   Season cards: ${seasonCards}`);
        console.log(`   Episode items: ${episodeItems}`);
        
        if (episodeLinksAfter > 0 && title.includes('84 Episodes')) {
            console.log('✅ SUCCESS! Real content is now deployed!');
            console.log('🎬 HIGH NOON CARTOON SERIES IS LIVE!');
        } else {
            console.log('❌ Still showing old content. Cache issue persists.');
        }
        
        console.log('✅ FINAL VERIFICATION COMPLETE!');
        console.log('📸 Screenshot saved as: highnooncartoon-final.png');
        
    } catch (error) {
        console.error('❌ Error during final verification:', error);
    } finally {
        await browser.close();
    }
}

// Run the final verification
finalVerification();

