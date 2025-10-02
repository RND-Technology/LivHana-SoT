#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { BigQuery } = require('@google-cloud/bigquery');
const axios = require('axios');

// BigQuery setup
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BQ_DATASET || 'analytics';
const bigquery = new BigQuery({ projectId: PROJECT_ID });

// Square setup
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const SQUARE_API_BASE = process.env.SQUARE_API_BASE || 'https://connect.squareup.com/v2';
const SQUARE_API_VERSION = process.env.SQUARE_API_VERSION || '2024-06-15';

if (!SQUARE_ACCESS_TOKEN) {
  console.error('❌ SQUARE_ACCESS_TOKEN not found in environment');
  process.exit(1);
}

const squareClient = axios.create({
  baseURL: SQUARE_API_BASE,
  headers: {
    'Square-Version': SQUARE_API_VERSION,
    'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function syncPayments() {
  console.log('💰 Syncing Square payments...');

  const table = bigquery.dataset(DATASET).table('square_payments');
  const payments = [];

  try {
    // Fetch ALL payments (last 2 years)
    const beginTime = new Date();
    beginTime.setFullYear(beginTime.getFullYear() - 2);

    let cursor = null;
    let totalFetched = 0;

    do {
      const params = {
        begin_time: beginTime.toISOString(),
        end_time: new Date().toISOString(),
        location_id: SQUARE_LOCATION_ID,
        limit: 100
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await squareClient.get('/payments', { params });
      const batch = response.data.payments || [];
      totalFetched += batch.length;

      for (const payment of batch) {
        payments.push({
          id: payment.id,
          amount: payment.amount_money?.amount || 0,
          currency: payment.amount_money?.currency || 'USD',
          status: payment.status,
          customer_id: payment.customer_id || null,
          location_id: payment.location_id || null,
          created_at: payment.created_at,
          updated_at: payment.updated_at || null,
          source_type: payment.source_type || null,
          card_brand: payment.card_details?.card?.card_brand || null,
          receipt_url: payment.receipt_url || null
        });
      }

      cursor = response.data.cursor;
      console.log(`   Fetched ${totalFetched} payments...`);

    } while (cursor);

    // Insert into BigQuery in batches of 1000
    if (payments.length > 0) {
      const BATCH_SIZE = 1000;
      let inserted = 0;
      for (let i = 0; i < payments.length; i += BATCH_SIZE) {
        const batch = payments.slice(i, i + BATCH_SIZE);
        await table.insert(batch, { skipInvalidRows: true, ignoreUnknownValues: true });
        inserted += batch.length;
        console.log(`   Inserted ${inserted}/${payments.length} payments...`);
      }
      console.log(`✅ Inserted ${payments.length} payments into BigQuery`);
    } else {
      console.log('⚠️  No payments found');
    }

    return payments.length;
  } catch (error) {
    console.error('❌ Error syncing payments:', error.response?.data || error.message);
    throw error;
  }
}

async function syncCatalog() {
  console.log('📦 Syncing Square catalog items...');

  const table = bigquery.dataset(DATASET).table('square_items');
  const items = [];

  try {
    let cursor = null;
    let totalFetched = 0;

    do {
      const params = {
        types: 'ITEM',
        limit: 100
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await squareClient.get('/catalog/list', { params });
      const batch = response.data.objects || [];
      totalFetched += batch.length;

      for (const item of batch) {
        if (item.type === 'ITEM') {
          items.push({
            id: item.id,
            name: item.item_data?.name || 'Unknown',
            category: item.item_data?.category_id || null,
            sku: item.item_data?.variations?.[0]?.item_variation_data?.sku || null,
            price: item.item_data?.variations?.[0]?.item_variation_data?.price_money?.amount || null,
            available: item.item_data?.available_online || false,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || null
          });
        }
      }

      cursor = response.data.cursor;
      console.log(`   Fetched ${totalFetched} items...`);

    } while (cursor);

    // Insert into BigQuery in batches of 1000
    if (items.length > 0) {
      const BATCH_SIZE = 1000;
      let inserted = 0;
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        await table.insert(batch, { skipInvalidRows: true, ignoreUnknownValues: true });
        inserted += batch.length;
        console.log(`   Inserted ${inserted}/${items.length} items...`);
      }
      console.log(`✅ Inserted ${items.length} items into BigQuery`);
    } else {
      console.log('⚠️  No items found');
    }

    return items.length;
  } catch (error) {
    console.error('❌ Error syncing catalog:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Square → BigQuery sync...');
  console.log(`   Project: ${PROJECT_ID}`);
  console.log(`   Dataset: ${DATASET}`);
  console.log(`   Location: ${SQUARE_LOCATION_ID || 'all'}`);
  console.log('');

  try {
    const paymentCount = await syncPayments();
    const itemCount = await syncCatalog();

    console.log('');
    console.log('🎉 Sync complete!');
    console.log(`   ${paymentCount} payments synced`);
    console.log(`   ${itemCount} items synced`);
    console.log(`   Time: ${new Date().toISOString()}`);
  } catch (error) {
    console.error('💥 Sync failed:', error.message);
    process.exit(1);
  }
}

main();
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
