import axios from 'axios';

/**
 * Bulk update script to remove "weed" from product names via HTTP API
 * Replaces "Brick Weed" → "Brick Flower"
 */

const API_BASE = 'http://localhost:3005/api/lightspeed';

async function fixWeedProducts() {
  try {
    console.log('🚀 Starting bulk update to remove "weed" from products...\n');

    // Fetch all products
    console.log('📥 Fetching products from LightSpeed...');
    const response = await axios.get(`${API_BASE}/products`, {
      params: { limit: 200 }
    });

    if (!response.data.success) {
      throw new Error('Failed to fetch products');
    }

    const allProducts = response.data.products;
    console.log(`✅ Fetched ${allProducts.length} products\n`);

    // Filter products containing "weed"
    const weedProducts = allProducts.filter(p =>
      p.name && p.name.toLowerCase().includes('weed')
    );

    console.log(`🔍 Found ${weedProducts.length} products with "weed" in name\n`);

    if (weedProducts.length === 0) {
      console.log('✨ No products found with "weed" - all compliant!');
      return;
    }

    // Display products to be updated
    console.log('📋 Products to be updated:');
    weedProducts.forEach((p, i) => {
      const newName = p.name
        .replace(/Brick Weed/gi, 'Brick Flower')
        .replace(/\bweed\b/gi, 'flower');
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      → ${newName}`);
    });

    console.log(`\n⚠️  About to update ${weedProducts.length} products...\n`);

    // Update each product
    let successCount = 0;
    let failCount = 0;

    for (const product of weedProducts) {
      const originalName = product.name;
      const newName = originalName
        .replace(/Brick Weed/gi, 'Brick Flower')
        .replace(/\bweed\b/gi, 'flower');

      try {
        console.log(`📝 Updating: ${originalName}`);

        await axios.put(`${API_BASE}/products/${product.id}`, {
          name: newName
        });

        successCount++;
        console.log(`   ✅ Success → ${newName}\n`);
      } catch (error) {
        failCount++;
        console.error(`   ❌ Failed: ${error.response?.data?.message || error.message}\n`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed:  ${failCount}`);
    console.log(`📝 Total:   ${weedProducts.length}`);
    console.log('='.repeat(60) + '\n');

    if (successCount === weedProducts.length) {
      console.log('🎉 All products updated successfully!');
    } else if (successCount > 0) {
      console.log('⚠️  Some products updated, but some failed. Check logs above.');
    } else {
      console.log('❌ All updates failed. Check integration-service logs.');
    }

  } catch (error) {
    console.error(`\n❌ Script failed: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
console.log('🌟 LightSpeed Product Compliance Updater');
console.log('   Removing "weed" terminology for Texas compliance\n');

fixWeedProducts()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  });
