#!/usr/bin/env node

/**
 * ECWID API CLIENT - PROGRAMMATIC ACCESS
 *
 * Tier 1 Solution: Direct API access to Ecwid for automated changes
 *
 * SETUP:
 * 1. Get API token from Ecwid:
 *    - Go to https://my.ecwid.com/cp/
 *    - Apps → API → Create new token
 *    - Copy token
 *
 * 2. Set environment variable:
 *    export ECWID_API_TOKEN="your-token-here"
 *    export ECWID_STORE_ID="your-store-id"
 *
 * 3. Run:
 *    node automation/ecwid-api-client.js
 *
 * API DOCS: https://api-docs.ecwid.com/
 */

import fetch from 'node-fetch';

const ECWID_API_BASE = 'https://app.ecwid.com/api/v3';

class EcwidAPIClient {
  constructor(storeId, apiToken) {
    this.storeId = storeId;
    this.apiToken = apiToken;
    this.baseUrl = `${ECWID_API_BASE}/${storeId}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ecwid API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Get store profile
  async getStoreProfile() {
    return this.request('/profile');
  }

  // Get current design settings (part of profile)
  async getDesignSettings() {
    const profile = await this.request('/profile');
    return profile.design || {};
  }

  // Update custom CSS
  async updateCustomCSS(css) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify({
        design: {
          customCSS: css
        }
      })
    });
  }

  // Get all categories
  async getCategories() {
    return this.request('/categories');
  }

  // Update category (e.g., add description with styling)
  async updateCategory(categoryId, data) {
    return this.request(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

// CSS FIX for categories
const CATEGORY_FIX_CSS = `
/* CATEGORY BOX TEXT FIX - Added by API automation */
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

.ec-store .grid-category:hover .grid-category__title,
.ec-store .category-card:hover .category-card__title {
  color: #2D5F3F !important;
}

@media (max-width: 768px) {
  .ec-store .grid-category__title,
  .ec-store .category-card__title {
    color: #000000 !important;
    font-size: 16px !important;
    font-weight: 700 !important;
  }
}
/* END API FIX */
`;

async function fixCategoriesViaAPI() {
  console.log('🚀 Ecwid API Category Fix');
  console.log('');

  const storeId = process.env.ECWID_STORE_ID;
  const apiToken = process.env.ECWID_API_TOKEN;

  if (!storeId || !apiToken) {
    console.error('❌ ERROR: Missing API credentials');
    console.error('');
    console.error('Set environment variables:');
    console.error('  export ECWID_STORE_ID="your-store-id"');
    console.error('  export ECWID_API_TOKEN="your-api-token"');
    console.error('');
    console.error('Get API token:');
    console.error('  1. Go to https://my.ecwid.com/cp/');
    console.error('  2. Apps → API → Create new token');
    console.error('  3. Grant "Update store profile" permission');
    console.error('');
    process.exit(1);
  }

  const client = new EcwidAPIClient(storeId, apiToken);

  try {
    // Step 1: Get current profile
    console.log('📊 Fetching store profile...');
    const profile = await client.getStoreProfile();
    console.log('✅ Store:', profile.generalInfo.storeUrl);
    console.log('');

    // Step 2: Get current design settings
    console.log('🎨 Fetching design settings...');
    const design = await client.getDesignSettings();
    const currentCSS = design.customCSS || '';
    console.log('📄 Current CSS length:', currentCSS.length, 'characters');
    console.log('');

    // Step 3: Check if fix already applied
    if (currentCSS.includes('CATEGORY BOX TEXT FIX')) {
      console.log('✅ Fix already applied!');
      console.log('');
      console.log('To remove fix, go to:');
      console.log('https://my.ecwid.com/cp/ → Design → Custom CSS');
      console.log('');
      return;
    }

    // Step 4: Append fix
    console.log('💉 Injecting CSS fix...');
    const newCSS = currentCSS + '\n\n' + CATEGORY_FIX_CSS;

    await client.updateCustomCSS(newCSS);
    console.log('✅ CSS fix applied successfully');
    console.log('');

    // Step 5: Verify
    console.log('🔍 Verifying changes...');
    const updated = await client.getDesignSettings();
    console.log('📄 New CSS length:', updated.customCSS.length, 'characters');
    console.log('');

    console.log('🎉 FIX COMPLETE!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit: https://reggieanddro.com/products');
    console.log('2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)');
    console.log('3. Verify category boxes show text');
    console.log('4. Test on mobile');
    console.log('');

  } catch (error) {
    console.error('❌ API FAILED');
    console.error('');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('401')) {
      console.error('🔐 Authentication failed. Check your API token.');
    } else if (error.message.includes('403')) {
      console.error('🚫 Permission denied. Token needs "Update store profile" permission.');
    }

    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixCategoriesViaAPI().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default EcwidAPIClient;
