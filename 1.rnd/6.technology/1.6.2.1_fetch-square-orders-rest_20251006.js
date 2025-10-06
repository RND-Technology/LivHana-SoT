import 'dotenv/config';
import axios from 'axios';

/**
 * Fetch Square Orders with line items for Brickweed analysis using REST API
 * Date range: September 1, 2024 - October 1, 2025
 */

const SQUARE_API_BASE = 'https://connect.squareup.com/v2';
const ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const LOCATION_ID = process.env.SQUARE_LOCATION_ID;

async function fetchBrickweedOrders() {
  try {
    console.log('🔍 Fetching Square Orders for Brickweed Analysis');
    console.log('📅 Period: September 1, 2024 - October 1, 2025\n');

    // Search orders using REST API
    const response = await axios.post(`${SQUARE_API_BASE}/orders/search`, {
      location_ids: [LOCATION_ID],
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: '2024-09-01T00:00:00Z',
              end_at: '2025-10-01T23:59:59Z'
            }
          },
          state_filter: {
            states: ['COMPLETED']
          }
        }
      },
      limit: 500
    }, {
      headers: {
        'Square-Version': '2024-10-17',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const orders = response.data.orders || [];
    console.log(`✅ Fetched ${orders.length} orders\n`);

    // Filter orders containing "brick" or "weed" in line items
    const brickweedOrders = [];
    const productSales = {};

    for (const order of orders) {
      if (!order.line_items) continue;

      for (const item of order.line_items) {
        const itemName = item.name || '';
        const itemVariation = item.variation_name || '';
        const fullName = `${itemName} ${itemVariation}`.toLowerCase();

        if (fullName.includes('brick') || fullName.includes('weed')) {
          brickweedOrders.push(order);

          // Track product sales
          const productKey = `${itemName} - ${itemVariation}`;
          if (!productSales[productKey]) {
            productSales[productKey] = {
              name: itemName,
              variation: itemVariation,
              quantity: 0,
              grossSales: 0,
              netSales: 0,
              orders: []
            };
          }

          const quantity = parseInt(item.quantity) || 0;
          const grossAmount = parseInt(item.gross_sales_money?.amount || 0) / 100;
          const totalDiscount = parseInt(item.total_discount_money?.amount || 0) / 100;
          const netAmount = grossAmount - totalDiscount;

          productSales[productKey].quantity += quantity;
          productSales[productKey].grossSales += grossAmount;
          productSales[productKey].netSales += netAmount;
          productSales[productKey].orders.push(order.id);

          break; // Only count order once
        }
      }
    }

    console.log(`🎯 Found ${brickweedOrders.length} orders with Brick/Weed products\n`);
    console.log('📊 Product Sales Breakdown:\n');

    // Sort by net sales
    const sortedProducts = Object.values(productSales).sort((a, b) => b.netSales - a.netSales);

    sortedProducts.forEach((product, i) => {
      console.log(`${i + 1}. ${product.name} - ${product.variation}`);
      console.log(`   Quantity: ${product.quantity}`);
      console.log(`   Gross Sales: $${product.grossSales.toFixed(2)}`);
      console.log(`   Net Sales: $${product.netSales.toFixed(2)}`);
      console.log(`   Orders: ${product.orders.length}\n`);
    });

    // Calculate totals
    const totalQuantity = sortedProducts.reduce((sum, p) => sum + p.quantity, 0);
    const totalGross = sortedProducts.reduce((sum, p) => sum + p.grossSales, 0);
    const totalNet = sortedProducts.reduce((sum, p) => sum + p.netSales, 0);

    console.log('=' .repeat(60));
    console.log('💰 TOTALS');
    console.log('=' .repeat(60));
    console.log(`Total Units: ${totalQuantity}`);
    console.log(`Total Gross Sales: $${totalGross.toFixed(2)}`);
    console.log(`Total Net Sales: $${totalNet.toFixed(2)}`);
    console.log('=' .repeat(60));

    // Categorize by weight (check larger sizes first to avoid gram pattern matching)
    console.log('\n📦 BREAKDOWN BY WEIGHT CATEGORY:\n');

    const categories = {
      ounces: { regex: /\b1\s*oz|ounce|\(28g\)|28\s*g(?![.])/i, items: [], quantity: 0, netSales: 0 },
      quarters: { regex: /\b1\/4\s*oz|quarter|\(7g\)|7\s*g(?![.])/i, items: [], quantity: 0, netSales: 0 },
      eighths: { regex: /\b1\/8\s*oz|eighth|\(3\.5g\)|3\.5\s*g/i, items: [], quantity: 0, netSales: 0 },
      grams: { regex: /\b1\s*gram|gram(?!s)/i, items: [], quantity: 0, netSales: 0 }
    };

    sortedProducts.forEach(product => {
      const fullName = `${product.name} ${product.variation}`;
      let categorized = false;

      // Check categories in order (ounces -> quarters -> eighths -> grams)
      for (const [category, config] of Object.entries(categories)) {
        if (config.regex.test(fullName)) {
          config.items.push(product);
          config.quantity += product.quantity;
          config.netSales += product.netSales;
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        // Default to grams if no match
        categories.grams.items.push(product);
        categories.grams.quantity += product.quantity;
        categories.grams.netSales += product.netSales;
      }
    });

    for (const [category, data] of Object.entries(categories)) {
      if (data.items.length === 0) continue;

      const percentage = (data.netSales / totalNet * 100).toFixed(1);
      const avgPrice = data.quantity > 0 ? (data.netSales / data.quantity).toFixed(2) : '0.00';

      console.log(`${category.toUpperCase()}`);
      console.log(`  Products: ${data.items.length}`);
      console.log(`  Units: ${data.quantity}`);
      console.log(`  Net Sales: $${data.netSales.toFixed(2)}`);
      console.log(`  % of Total: ${percentage}%`);
      console.log(`  Avg Price/Unit: $${avgPrice}\n`);
    }

    // Estimate COGS (60% of net sales assumption)
    const estimatedCOGS = totalNet * 0.6;
    const estimatedGrossProfit = totalNet - estimatedCOGS;
    const estimatedMargin = (estimatedGrossProfit / totalNet * 100).toFixed(1);

    console.log('\n' + '=' .repeat(60));
    console.log('💵 FINANCIAL ESTIMATES');
    console.log('=' .repeat(60));
    console.log(`Total Net Sales: $${totalNet.toFixed(2)}`);
    console.log(`Estimated COGS (60%): $${estimatedCOGS.toFixed(2)}`);
    console.log(`Estimated Gross Profit: $${estimatedGrossProfit.toFixed(2)}`);
    console.log(`Estimated Margin: ${estimatedMargin}%`);
    console.log('=' .repeat(60));

    console.log('\n⚠️  NOTE: COGS estimates use 60% assumption. Actual costs may vary.');
    console.log('💡 TIP: These products need "Brick Weed" → "Brick Flower" renaming for compliance.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run
fetchBrickweedOrders()
  .then(() => {
    console.log('\n✨ Analysis complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  });
