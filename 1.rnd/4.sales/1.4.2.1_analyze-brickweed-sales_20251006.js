import { BigQuery } from '@google-cloud/bigquery';
import 'dotenv/config';

/**
 * Analyze "Brickweed" sales from Square data
 * Period: September 1, 2024 - October 1, 2025
 * Output: Total sales by weight category (G, E, Q, Z) with revenue/COGS
 */

const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID || 'reggieanddrodispensary',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

async function analyzeBrickweedSales() {
  try {
    console.log('🔍 Analyzing Brickweed Sales Data');
    console.log('📅 Period: September 1, 2024 - October 1, 2025\n');

    const query = `
      SELECT
        name,
        SUM(quantity) as total_quantity,
        SUM(gross_sales_money_amount / 100.0) as gross_sales,
        SUM(total_tax_money_amount / 100.0) as total_tax,
        SUM(total_discount_money_amount / 100.0) as total_discount,
        SUM(net_sales_money_amount / 100.0) as net_sales,
        COUNT(DISTINCT order_id) as num_orders,
        -- Estimate COGS (need actual cost data, using 40% markup assumption)
        SUM(net_sales_money_amount / 100.0) * 0.6 as estimated_cogs
      FROM
        \`reggieanddrodispensary.analytics.square_order_line_items\`
      WHERE
        created_at >= '2024-09-01'
        AND created_at <= '2025-10-01'
        AND (
          LOWER(name) LIKE '%brickweed%'
          OR LOWER(name) LIKE '%brick weed%'
          OR LOWER(variation_name) LIKE '%brickweed%'
        )
      GROUP BY
        name
      ORDER BY
        net_sales DESC
    `;

    console.log('🔎 Querying BigQuery...\n');
    const [rows] = await bigquery.query({ query });

    if (rows.length === 0) {
      console.log('❌ No Brickweed products found in Square data for this period');
      return;
    }

    console.log(`✅ Found ${rows.length} Brickweed product variants\n`);

    // Analyze by weight category
    const categories = {
      grams: { regex: /\b\d+\s*g\b/i, items: [], total_sales: 0, total_quantity: 0 },
      eighths: { regex: /\beighth|1\/8|⅛|\b3\.5\s*g\b/i, items: [], total_sales: 0, total_quantity: 0 },
      quarters: { regex: /\bquarter|1\/4|¼|\b7\s*g\b/i, items: [], total_sales: 0, total_quantity: 0 },
      ounces: { regex: /\bounce|oz|\b28\s*g\b/i, items: [], total_sales: 0, total_quantity: 0 }
    };

    let totalNetSales = 0;
    let totalQuantity = 0;
    let totalCOGS = 0;

    // Categorize products
    rows.forEach(row => {
      const netSales = parseFloat(row.net_sales || 0);
      const quantity = parseInt(row.total_quantity || 0);
      const cogs = parseFloat(row.estimated_cogs || 0);

      totalNetSales += netSales;
      totalQuantity += quantity;
      totalCOGS += cogs;

      let categorized = false;
      for (const [category, config] of Object.entries(categories)) {
        if (config.regex.test(row.name)) {
          config.items.push(row);
          config.total_sales += netSales;
          config.total_quantity += quantity;
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        // Default to grams if no category matched
        categories.grams.items.push(row);
        categories.grams.total_sales += netSales;
        categories.grams.total_quantity += quantity;
      }
    });

    // Display results
    console.log('=' .repeat(80));
    console.log('📊 BRICKWEED SALES ANALYSIS');
    console.log('=' .repeat(80) + '\n');

    console.log('🎯 SUMMARY BY WEIGHT CATEGORY:\n');

    for (const [category, data] of Object.entries(categories)) {
      if (data.items.length === 0) continue;

      const percentage = (data.total_sales / totalNetSales * 100).toFixed(1);
      const avgPrice = data.items.length > 0 ? (data.total_sales / data.total_quantity).toFixed(2) : 0;

      console.log(`\n📦 ${category.toUpperCase()}`);
      console.log(`   Items: ${data.items.length}`);
      console.log(`   Units Sold: ${data.total_quantity}`);
      console.log(`   Net Sales: $${data.total_sales.toFixed(2)}`);
      console.log(`   % of Total: ${percentage}%`);
      console.log(`   Avg Price/Unit: $${avgPrice}`);
    }

    console.log('\n' + '-'.repeat(80));
    console.log('\n💰 OVERALL TOTALS:\n');
    console.log(`   Total Units Sold: ${totalQuantity}`);
    console.log(`   Total Net Sales: $${totalNetSales.toFixed(2)}`);
    console.log(`   Estimated COGS: $${totalCOGS.toFixed(2)} (60% of sales)`);
    console.log(`   Estimated Gross Profit: $${(totalNetSales - totalCOGS).toFixed(2)}`);
    console.log(`   Estimated Margin: ${((totalNetSales - totalCOGS) / totalNetSales * 100).toFixed(1)}%`);

    console.log('\n' + '='.repeat(80));
    console.log('\n📋 DETAILED PRODUCT BREAKDOWN:\n');

    rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.name}`);
      console.log(`   Quantity: ${row.total_quantity} | Net Sales: $${parseFloat(row.net_sales).toFixed(2)} | Orders: ${row.num_orders}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n⚠️  NOTE: COGS estimates use 60% assumption. Actual costs may vary.');
    console.log('💡 TIP: These products need "Brick Weed" → "Brick Flower" renaming for compliance.\n');

  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run analysis
analyzeBrickweedSales()
  .then(() => {
    console.log('✨ Analysis complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
