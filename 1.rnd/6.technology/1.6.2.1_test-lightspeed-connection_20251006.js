#!/usr/bin/env node
/**
 * Quick test to verify LightSpeed API connection
 * Run: node test-lightspeed-connection.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the integration-service directory
dotenv.config({ path: join(__dirname, '.env') });

// Import after env is loaded
const LightspeedClient = (await import('./src/lib/lightspeed-client.js')).default;

async function testConnection() {
  console.log('🔍 Testing LightSpeed API Connection...\n');

  try {
    // Initialize client
    const client = new LightspeedClient();
    console.log('✅ LightSpeed client initialized');
    console.log(`   Account ID: ${process.env.LIGHTSPEED_ACCOUNT_ID}`);
    console.log(`   Auth Method: ${client.authMethod}\n`);

    // Test 1: Fetch outlets
    console.log('📦 Test 1: Fetching outlets...');
    const outlets = await client.getOutlets();
    console.log(`✅ Success! Found ${outlets.length} outlets:`);
    outlets.slice(0, 3).forEach(outlet => {
      console.log(`   - ${outlet.name} (${outlet.id})`);
    });
    console.log('');

    // Test 2: Fetch products (first 5)
    console.log('🛍️  Test 2: Fetching products (limit 5)...');
    const products = await client.getProducts({ limit: 5 });
    console.log(`✅ Success! Found ${products.length} products:`);
    products.forEach(product => {
      console.log(`   - ${product.name}`);
      console.log(`     Price: $${product.price.toFixed(2)} | Stock: ${product.quantity} | SKU: ${product.sku}`);
    });
    console.log('');

    // Test 3: Fetch single product
    if (products.length > 0) {
      const firstProductId = products[0].id;
      console.log(`📋 Test 3: Fetching single product (ID: ${firstProductId})...`);
      const product = await client.getProduct(firstProductId);
      console.log(`✅ Success! Retrieved: ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Description: ${product.description || 'N/A'}`);
      console.log('');
    }

    console.log('🎉 All tests passed! LightSpeed API is working correctly.\n');
    console.log('Next steps:');
    console.log('1. Start integration-service: npm start');
    console.log('2. Test routes: curl http://localhost:3005/api/lightspeed/products');
    console.log('3. Verify real data (no more demo products)');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify credentials in .env file');
    console.error('2. Check LIGHTSPEED_CLIENT_ID (API Key)');
    console.error('3. Check LIGHTSPEED_ACCOUNT_ID');
    console.error('4. Ensure you have API access from LightSpeed');
    process.exit(1);
  }
}

testConnection();
