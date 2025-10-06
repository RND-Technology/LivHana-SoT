#!/usr/bin/env node

/**
 * Update Reggie & Dro Ecwid Homepage Hero Text
 * Direct API call to update Instant Site tiles
 */

import axios from 'axios';

[REDACTED - SECURITY BREACH]
const ECWID_STORE_ID = '117254578';

// Ecwid API endpoints
const ECWID_API_BASE = `https://app.ecwid.com/api/v3/${ECWID_STORE_ID}`;
const INSTANT_SITE_API = `https://vuega.ecwid.com/store/${ECWID_STORE_ID}`;

// VARIANT A: Free Product Testers
const NEW_HERO_HTML = `<p><strong>Join 1000+ San Antonio Members as a Free Product Tester</strong></p>
<p><br></p>
<p>✓ Get Premium THCa Products FREE</p>
<p>✓ Access Exclusive Members-Only Lounge</p>
<p>✓ Secure Biometric Age Verification (21+)</p>
<p><br></p>
<p><strong>Step 1) <em>Verify Your Age & ID</em></strong></p>
<p><strong>Step 2) <em>Agree to Become a Member</em></strong></p>
<p><strong>Step 3) <em>Get Your First FREE Gram!</em></strong></p>
<p><br></p>
<p><strong>**</strong><em>& Another FREE Gram every time You Review our Flower's Look, Smell, Taste & Effect online!</em></p>`;

const NEW_HEADLINE = 'Free Product Testers Program';
const NEW_TAGLINE = '"Come for flower, stay for the good vibes"';

async function updateInstantSiteContent() {
  console.log('🚀 Updating Ecwid Instant Site Homepage\n');

  try {
    // Try to update via Instant Site API
    const updatePayload = {
      tileId: 'cover-HaXq6F',
      type: 'COVER',
      content: {
        headline: NEW_HEADLINE,
        tagline: NEW_TAGLINE,
        description: NEW_HERO_HTML
      }
    };

    console.log('Attempting Instant Site API update...');
    const response = await axios.put(
      `${INSTANT_SITE_API}/tiles/cover-HaXq6F`,
      updatePayload,
      {
        headers: {
          'Authorization': `Bearer ${PERSONAL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS! Homepage updated');
    console.log(response.data);
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }

    // Try alternative endpoint
    try {
      console.log('\nTrying alternative Ecwid Store API...');
      const storeInfoResponse = await axios.get(
        `${ECWID_API_BASE}/profile`,
        {
          headers: {
            'Authorization': `Bearer ${PERSONAL_TOKEN}`
          }
        }
      );

      console.log('Store profile fetched:', storeInfoResponse.data.generalInfo.storeUrl);
      console.log('\n⚠️ Direct Instant Site API not accessible with current token');
      console.log('\n📋 MANUAL UPDATE REQUIRED:');
      console.log('\n1. Login: https://my.business.shop/store/117254578');
      console.log('2. Go to: Instant Site > Edit Site');
      console.log('3. Click on hero section');
      console.log('4. Replace description with:\n');
      console.log(NEW_HERO_HTML.replace(/<[^>]+>/g, ''));
      console.log('\n5. Save and publish');

    } catch (error2) {
      console.error('\n❌ Ecwid Store API also failed');
      console.error('Token may not have permission for Instant Site updates');
      console.log('\n📋 ADMIN UI ACCESS REQUIRED');
      console.log('Log into: https://my.business.shop/store/117254578');
      console.log('Navigate to: Instant Site > Edit Site > Cover Section');
    }
  }
}

async function main() {
  await updateInstantSiteContent();
}

main().catch(console.error);
