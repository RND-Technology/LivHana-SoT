import 'dotenv/config';
import LightspeedClient from './src/lib/lightspeed-client.js';
import { createLogger } from '../common/logging/index.js';

const logger = createLogger('fix-weed-products');

/**
 * Bulk update script to remove "weed" from product names
 * Replaces "Brick Weed" → "Brick Flower"
 * Replaces "weed" → "flower" (case insensitive)
 */

async function fixWeedProducts() {
  try {
    logger.info('Starting bulk update to remove "weed" from products...');

    const client = new LightspeedClient();

    // Fetch all products (up to 200)
    logger.info('Fetching products from LightSpeed...');
    const products = await client.getProducts({ limit: 200 });
    logger.info(`Fetched ${products.length} products`);

    // Filter products containing "weed" (case insensitive)
    const weedProducts = products.filter(p =>
      p.name && p.name.toLowerCase().includes('weed')
    );

    logger.info(`Found ${weedProducts.length} products with "weed" in name`);

    if (weedProducts.length === 0) {
      logger.info('No products found with "weed" - nothing to update!');
      return;
    }

    // Display products to be updated
    console.log('\n📋 Products to be updated:');
    weedProducts.forEach((p, i) => {
      const newName = p.name
        .replace(/Brick Weed/gi, 'Brick Flower')
        .replace(/\bweed\b/gi, 'flower');
      console.log(`${i + 1}. ${p.name} → ${newName}`);
    });

    console.log(`\n⚠️  About to update ${weedProducts.length} products...`);

    // Update each product
    let successCount = 0;
    let failCount = 0;

    for (const product of weedProducts) {
      const originalName = product.name;
      const newName = originalName
        .replace(/Brick Weed/gi, 'Brick Flower')
        .replace(/\bweed\b/gi, 'flower');

      try {
        logger.info(`Updating product ${product.id}: "${originalName}" → "${newName}"`);

        await client.updateProduct(product.id, {
          name: newName
        });

        successCount++;
        console.log(`✅ Updated: ${newName}`);
      } catch (error) {
        failCount++;
        logger.error(`Failed to update product ${product.id}`, {
          error: error.message,
          originalName
        });
        console.error(`❌ Failed: ${originalName} - ${error.message}`);
      }
    }

    // Summary
    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${weedProducts.length}`);

    logger.info('Bulk update complete!', {
      total: weedProducts.length,
      success: successCount,
      failed: failCount
    });

  } catch (error) {
    logger.error('Bulk update failed', {
      error: error.message,
      stack: error.stack
    });
    console.error(`\n❌ Script failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
fixWeedProducts()
  .then(() => {
    logger.info('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    logger.error('Script failed', { error: error.message });
    process.exit(1);
  });
