import 'dotenv/config';
import squarePkg from 'square';
import { createLogger } from '../common/logging/index.js';

const logger = createLogger('fetch-square-orders');

/**
 * Fetch Square Orders with line items for Brickweed analysis
 * Date range: September 1, 2024 - October 1, 2025
 */

const squareClient = new squarePkg.Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: 'production'
});

async function fetchBrickweedOrders() {
  try {
    console.log('🔍 Fetching Square Orders for Brickweed Analysis');
    console.log('📅 Period: September 1, 2024 - October 1, 2025\n');

    const locationId = process.env.SQUARE_LOCATION_ID;

    // Search orders with line items
    const { result } = await squareClient.ordersApi.searchOrders({
      locationIds: [locationId],
      query: {
        filter: {
          dateTimeFilter: {
            createdAt: {
              startAt: '2024-09-01T00:00:00Z',
              endAt: '2025-10-01T23:59:59Z'
            }
          },
          stateFilter: {
            states: ['COMPLETED']
          }
        }
      },
      limit: 500
    });

    const orders = result.orders || [];
    console.log(`✅ Fetched ${orders.length} orders\n`);

    // Filter orders containing "brick" or "weed" in line items
    const brickweedOrders = [];
    const productSales = {};

    for (const order of orders) {
      if (!order.lineItems) continue;

      for (const item of order.lineItems) {
        const itemName = item.name || '';
        const itemVariation = item.variationName || '';
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
              netSales: 0
            };
          }

          const quantity = parseInt(item.quantity) || 0;
          const grossAmount = parseInt(item.grossSalesMoney?.amount || 0) / 100;
          const totalDiscount = parseInt(item.totalDiscountMoney?.amount || 0) / 100;
          const netAmount = grossAmount - totalDiscount;

          productSales[productKey].quantity += quantity;
          productSales[productKey].grossSales += grossAmount;
          productSales[productKey].netSales += netAmount;

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
      console.log(`   Net Sales: $${product.netSales.toFixed(2)}\n`);
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

    // Categorize by weight
    console.log('\n📦 BREAKDOWN BY WEIGHT CATEGORY:\n');

    const categories = {
      grams: { regex: /\b\d+\s*g\b|gram/i, items: [], quantity: 0, netSales: 0 },
      eighths: { regex: /eighth|1\/8|⅛|3\.5\s*g/i, items: [], quantity: 0, netSales: 0 },
      quarters: { regex: /quarter|1\/4|¼|7\s*g/i, items: [], quantity: 0, netSales: 0 },
      ounces: { regex: /ounce|oz|28\s*g/i, items: [], quantity: 0, netSales: 0 }
    };

    sortedProducts.forEach(product => {
      const fullName = `${product.name} ${product.variation}`;
      let categorized = false;

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
        categories.grams.items.push(product);
        categories.grams.quantity += product.quantity;
        categories.grams.netSales += product.netSales;
      }
    });

    for (const [category, data] of Object.entries(categories)) {
      if (data.items.length === 0) continue;

      const percentage = (data.netSales / totalNet * 100).toFixed(1);
      console.log(`${category.toUpperCase()}`);
      console.log(`  Products: ${data.items.length}`);
      console.log(`  Units: ${data.quantity}`);
      console.log(`  Net Sales: $${data.netSales.toFixed(2)}`);
      console.log(`  % of Total: ${percentage}%\n`);
    }

  } catch (error) {
    logger.error('Failed to fetch Square orders', {
      error: error.message,
      stack: error.stack
    });
    console.error('❌ Error:', error.message);
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
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
