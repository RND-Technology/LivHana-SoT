#!/usr/bin/env node
require('dotenv').config({ path: '../.env' });
const { BigQuery } = require('@google-cloud/bigquery');

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BQ_DATASET || 'analytics';
const LOCATION = process.env.BQ_LOCATION || 'US';

const bigquery = new BigQuery({ projectId: PROJECT_ID });

const SCHEMA = {
  square_payments: [
    { name: 'id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'amount', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'currency', type: 'STRING', mode: 'REQUIRED' },
    { name: 'status', type: 'STRING', mode: 'REQUIRED' },
    { name: 'customer_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'location_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'updated_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'source_type', type: 'STRING', mode: 'NULLABLE' },
    { name: 'card_brand', type: 'STRING', mode: 'NULLABLE' },
    { name: 'receipt_url', type: 'STRING', mode: 'NULLABLE' }
  ],
  square_items: [
    { name: 'id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'name', type: 'STRING', mode: 'REQUIRED' },
    { name: 'category', type: 'STRING', mode: 'NULLABLE' },
    { name: 'sku', type: 'STRING', mode: 'NULLABLE' },
    { name: 'price', type: 'INTEGER', mode: 'NULLABLE' },
    { name: 'available', type: 'BOOLEAN', mode: 'NULLABLE' },
    { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'updated_at', type: 'TIMESTAMP', mode: 'NULLABLE' }
  ],
  lightspeed_transactions: [
    { name: 'id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'amount', type: 'FLOAT', mode: 'REQUIRED' },
    { name: 'tax', type: 'FLOAT', mode: 'NULLABLE' },
    { name: 'total', type: 'FLOAT', mode: 'REQUIRED' },
    { name: 'customer_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'status', type: 'STRING', mode: 'REQUIRED' },
    { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'updated_at', type: 'TIMESTAMP', mode: 'NULLABLE' }
  ],
  lightspeed_products: [
    { name: 'id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'name', type: 'STRING', mode: 'REQUIRED' },
    { name: 'description', type: 'STRING', mode: 'NULLABLE' },
    { name: 'category', type: 'STRING', mode: 'NULLABLE' },
    { name: 'price', type: 'FLOAT', mode: 'REQUIRED' },
    { name: 'cost', type: 'FLOAT', mode: 'NULLABLE' },
    { name: 'quantity', type: 'INTEGER', mode: 'NULLABLE' },
    { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'updated_at', type: 'TIMESTAMP', mode: 'NULLABLE' }
  ]
};

async function setupBigQuery() {
  console.log('🚀 Setting up BigQuery schema...');
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Dataset: ${DATASET}`);
  console.log(`Location: ${LOCATION}`);

  // 1. Create dataset if not exists
  try {
    await bigquery.dataset(DATASET).get({ autoCreate: true });
    console.log(`✅ Dataset ${DATASET} ready`);
  } catch (error) {
    console.error(`❌ Failed to create dataset:`, error.message);
    process.exit(1);
  }

  // 2. Create tables
  for (const [tableName, schema] of Object.entries(SCHEMA)) {
    try {
      const table = bigquery.dataset(DATASET).table(tableName);
      const [exists] = await table.exists();

      if (!exists) {
        await table.create({
          schema: { fields: schema },
          location: LOCATION
        });
        console.log(`✅ Created table: ${tableName}`);
      } else {
        console.log(`✅ Table exists: ${tableName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create table ${tableName}:`, error.message);
    }
  }

  console.log('🎉 BigQuery schema setup complete!');
}

setupBigQuery().catch(console.error);
// Last optimized: 2025-10-02
