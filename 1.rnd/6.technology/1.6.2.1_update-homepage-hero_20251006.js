#!/usr/bin/env node

/**
 * Update Reggie & Dro Homepage Hero Text
 * Changes "FREE LEGAL WEED" to conversion-optimized "Free Product Testers" copy
 */

import axios from 'axios';

const logger = {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ''),
  debug: (msg, meta) => {} // silent
};

const PERSONAL_TOKEN = process.env.LIGHTSPEED_API_KEY;
const API_BASE = 'https://reggieanddro.vendhq.com/api/2.0';
const WRITE_API_BASE = 'https://reggieanddro.retail.lightspeed.app/api/2.1';

// VARIANT A: Free Product Testers (PROVEN WINNER)
const NEW_HERO_TEXT = `Join 1000+ San Antonio Members as a Free Product Tester

✓ Get Premium THCa Products FREE
✓ Access Exclusive Members-Only Lounge
✓ Secure Biometric Age Verification (21+)`;

const NEW_HERO_SHORT = `Join 1000+ San Antonio Members as a Free Product Tester - Get Premium THCa Products FREE - Access Exclusive Members-Only Lounge - Secure Biometric Age Verification (21+)`;

async function findHomePageContent() {
  logger.info('🔍 Searching for homepage content in LightSpeed...');

  try {
    // Try various API endpoints to find homepage content
    const endpoints = [
      '/webstore',
      '/webstore/settings',
      '/retailers',
      '/store_settings',
      '/pages',
      '/settings'
    ];

    for (const endpoint of endpoints) {
      try {
        logger.info(`Checking endpoint: ${endpoint}`);
        const response = await axios.get(`${API_BASE}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${PERSONAL_TOKEN}`,
            'Accept': 'application/json'
          }
        });

        console.log(`\n✅ ${endpoint}:`);
        console.log(JSON.stringify(response.data, null, 2).substring(0, 500));
        console.log('\n');
      } catch (error) {
        logger.debug(`Endpoint ${endpoint} not available: ${error.response?.status}`);
      }
    }

    // Also check write API
    for (const endpoint of ['/webstore', '/settings']) {
      try {
        logger.info(`Checking write API endpoint: ${endpoint}`);
        const response = await axios.get(`${WRITE_API_BASE}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${PERSONAL_TOKEN}`,
            'Accept': 'application/json'
          }
        });

        console.log(`\n✅ WRITE API ${endpoint}:`);
        console.log(JSON.stringify(response.data, null, 2).substring(0, 500));
        console.log('\n');
      } catch (error) {
        logger.debug(`Write API endpoint ${endpoint} not available: ${error.response?.status}`);
      }
    }

  } catch (error) {
    logger.error('Failed to find homepage content', {
      error: error.message,
      status: error.response?.status
    });
  }
}

async function updateStoreDescription() {
  logger.info('🔄 Attempting to update store description...');

  try {
    // Try to update retailer settings
    const response = await axios.put(`${WRITE_API_BASE}/retailers`, {
      description: NEW_HERO_SHORT,
      tagline: 'Join 1000+ San Antonio Members as Free Product Testers'
    }, {
      headers: {
        'Authorization': `Bearer ${PERSONAL_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    logger.info('✅ Store description updated successfully!');
    return response.data;
  } catch (error) {
    logger.error('Failed to update store description', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}

async function main() {
  console.log('🚀 Reggie & Dro Homepage Hero Text Updater\n');
  console.log('OLD TEXT (REMOVE):');
  console.log('Cannabis Dispensary: Reggie & Dro... FREE LEGAL WEED!\n');
  console.log('NEW TEXT (VARIANT A):');
  console.log(NEW_HERO_TEXT);
  console.log('\n' + '='.repeat(60) + '\n');

  // Step 1: Find where homepage content lives
  await findHomePageContent();

  // Step 2: Try to update store description
  try {
    await updateStoreDescription();
  } catch (error) {
    console.log('\n⚠️  API update not available through standard endpoints');
    console.log('\n📋 MANUAL UPDATE REQUIRED:');
    console.log('\n1. Log into LightSpeed admin: https://reggieanddro.retail.lightspeed.app');
    console.log('2. Navigate to: Setup > Online Store > Theme Settings');
    console.log('3. Find homepage hero section');
    console.log('4. Replace text with:\n');
    console.log(NEW_HERO_TEXT);
    console.log('\n5. Save and publish');
  }
}

main().catch(error => {
  logger.error('Fatal error', { error: error.message });
  process.exit(1);
});
