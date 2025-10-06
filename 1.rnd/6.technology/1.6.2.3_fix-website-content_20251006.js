#!/usr/bin/env node
/**
 * Fix Reggie & Dro website content for Texas Takeover
 * - Remove all "weed" language
 * - Add proper strain names and ingredients
 * - Ensure Texas compliance (21+, Hemp, THCa)
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const LightspeedClient = (await import('./src/lib/lightspeed-client.js')).default;

// Product fixes mapping
const productFixes = {
  // Category: "LEGAL Brick Weed" → "Budget Hemp Flower"
  'brick weed': {
    categoryReplacement: 'Budget Hemp Flower (THCa)',
    descriptionTemplate: (strain) => `Budget-friendly hemp flower with high THCa content. ${strain ? `Strain: ${strain}. ` : ''}Ingredients: Dried hemp flower, naturally grown. Lab-tested for potency and purity. 21+ only. Contains <0.3% Delta-9 THC (compliant with 2018 Farm Bill).`
  },

  // General "weed" replacements
  'weed': {
    replacement: 'hemp flower',
    description: 'Premium hemp flower rich in THCa cannabinoids'
  },

  'legal weed': {
    replacement: 'legal hemp',
    description: 'Farm Bill compliant hemp products'
  },

  'free weed': {
    replacement: 'member benefits',
    description: 'Exclusive member perks and rewards'
  }
};

// Strain information for products
const strainInfo = {
  'top shelf': {
    strains: ['Wedding Cake', 'Gelato', 'Purple Punch', 'Zkittlez'],
    description: 'Premium craft hemp flower, hand-selected for superior quality. High THCa content (20-30%). Ingredients: Organically grown hemp flower. Lab-tested COAs available. 21+ only.'
  },
  'mid shelf': {
    strains: ['Blue Dream', 'Sour Diesel', 'OG Kush', 'Girl Scout Cookies'],
    description: 'Quality hemp flower at an excellent value. Moderate to high THCa content (15-25%). Ingredients: Naturally grown hemp flower. Lab-tested for potency. 21+ only.'
  },
  'low shelf': {
    strains: ['Northern Lights', 'White Widow', 'AK-47', 'Jack Herer'],
    description: 'Budget-friendly hemp flower with reliable potency. THCa content (10-20%). Ingredients: Hemp flower, outdoor grown. Lab-tested. 21+ only.'
  }
};

async function fixWebsiteContent() {
  console.log('🔧 Fixing Reggie & Dro Website Content...\n');

  try {
    const client = new LightspeedClient();
    console.log('✅ Connected to LightSpeed API\n');

    // Step 1: Fetch all products
    console.log('📦 Fetching all products...');
    const products = await client.getProducts({ limit: 200 });
    console.log(`✅ Found ${products.length} products\n`);

    // Step 2: Identify products needing fixes
    console.log('🔍 Analyzing products for compliance issues...\n');
    const productsToFix = [];

    for (const product of products) {
      const issues = [];
      const fixes = {};

      // Check name for "weed"
      if (product.name.toLowerCase().includes('weed')) {
        issues.push(`Name contains "weed": ${product.name}`);
        fixes.name = product.name.replace(/weed/gi, 'hemp flower');
      }

      // Check description for "weed"
      if (product.description?.toLowerCase().includes('weed')) {
        issues.push('Description contains "weed"');
        fixes.description = product.description.replace(/weed/gi, 'hemp flower');
      }

      // Check for missing ingredients
      if (!product.description?.toLowerCase().includes('ingredients:')) {
        issues.push('Missing ingredients');
        fixes.needsIngredients = true;
      }

      // Check for missing 21+ disclaimer
      if (!product.description?.includes('21+')) {
        issues.push('Missing 21+ disclaimer');
        fixes.needs21Plus = true;
      }

      if (issues.length > 0) {
        productsToFix.push({
          product,
          issues,
          fixes
        });

        console.log(`❌ Product: ${product.name} (ID: ${product.id})`);
        issues.forEach(issue => console.log(`   - ${issue}`));
        console.log('');
      }
    }

    console.log(`\n📊 Summary: ${productsToFix.length} products need fixes\n`);

    if (productsToFix.length === 0) {
      console.log('✨ All products are compliant! No fixes needed.\n');
      return;
    }

    // Step 3: Apply fixes (DRY RUN first)
    console.log('🧪 DRY RUN - Proposed changes:\n');
    console.log('=' .repeat(80));

    for (const { product, fixes } of productsToFix) {
      console.log(`\n📝 Product: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Current Description: ${product.description || 'N/A'}`);

      // Generate improved description
      let newDescription = product.description || '';

      // Fix "weed" references
      if (fixes.description) {
        newDescription = fixes.description;
      }

      // Add ingredients if missing
      if (fixes.needsIngredients) {
        const category = product.category.toLowerCase();
        let ingredientText = 'Ingredients: Dried hemp flower (Cannabis sativa L.), naturally grown.';

        if (category.includes('pre-roll')) {
          ingredientText = 'Ingredients: Hemp flower (Cannabis sativa L.), hemp rolling paper.';
        }

        newDescription += `\n\n${ingredientText}`;
      }

      // Add 21+ disclaimer
      if (fixes.needs21Plus) {
        newDescription += '\n\n21+ only. Contains <0.3% Delta-9 THC (Farm Bill compliant).';
      }

      // Add COA reference
      if (!newDescription.includes('COA') && !newDescription.includes('lab-tested')) {
        newDescription += ' Lab-tested COAs available upon request.';
      }

      console.log(`   New Description: ${newDescription.trim()}`);
      console.log('-'.repeat(80));
    }

    console.log('\n\n⚠️  DRY RUN COMPLETE - No changes applied yet');
    console.log('\nTo apply these changes, run:');
    console.log('  node fix-website-content.js --apply\n');
    console.log('Or to update specific product:');
    console.log('  node fix-website-content.js --apply --id PRODUCT_ID\n');

    // Check if --apply flag is set
    const applyChanges = process.argv.includes('--apply');
    const targetId = process.argv.includes('--id') ? process.argv[process.argv.indexOf('--id') + 1] : null;

    if (applyChanges) {
      console.log('\n🚀 APPLYING CHANGES...\n');
      let updateCount = 0;
      let errorCount = 0;

      const toUpdate = targetId
        ? productsToFix.filter(p => p.product.id === targetId)
        : productsToFix;

      console.log(`Updating ${toUpdate.length} products...\n`);

      for (const { product, fixes } of toUpdate) {
        try {
          // Generate improved description
          let newDescription = product.description || '';

          // Fix "weed" references
          if (fixes.description) {
            newDescription = fixes.description;
          }

          // Add ingredients if missing
          if (fixes.needsIngredients && !newDescription.includes('Ingredients:')) {
            const category = (product.category || '').toLowerCase();
            let ingredientText = 'Ingredients: Dried hemp flower (Cannabis sativa L.), naturally grown.';

            if (category.includes('pre-roll')) {
              ingredientText = 'Ingredients: Hemp flower (Cannabis sativa L.), hemp rolling paper.';
            } else if (category.includes('gummies') || category.includes('edible')) {
              ingredientText = 'Ingredients: See product packaging for full ingredient list.';
            }

            newDescription += `\n\n${ingredientText}`;
          }

          // Add 21+ disclaimer
          if (fixes.needs21Plus && !newDescription.includes('21+')) {
            newDescription += '\n\n21+ only. Contains <0.3% Delta-9 THC (Farm Bill compliant).';
          }

          // Add COA reference
          if (!newDescription.includes('COA') && !newDescription.includes('lab-tested') && !newDescription.includes('Labs')) {
            newDescription += ' Lab-tested COAs available upon request.';
          }

          // Update product name if needed
          const newName = fixes.name || product.name;

          // Prepare update payload
          const updatePayload = {
            description: newDescription.trim()
          };

          // Only update name if it changed
          if (newName !== product.name) {
            updatePayload.name = newName;
          }

          // Call API to update
          await client.updateProduct(product.id, updatePayload);

          updateCount++;
          console.log(`✅ Updated: ${product.name} (${updateCount}/${toUpdate.length})`);

          // Rate limit: 2 requests per second
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to update ${product.name}:`, error.message);
        }
      }

      console.log(`\n\n✨ UPDATE COMPLETE`);
      console.log(`   ✅ Success: ${updateCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);
      console.log(`   📊 Total: ${toUpdate.length}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixWebsiteContent();
}
