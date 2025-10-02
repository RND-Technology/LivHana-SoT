#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { BigQuery } = require('@google-cloud/bigquery');
const axios = require('axios');

// BigQuery setup
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BQ_DATASET || 'analytics';
const bigquery = new BigQuery({ projectId: PROJECT_ID });

// Lightspeed setup
const LIGHTSPEED_API_KEY = process.env.LIGHTSPEED_API_KEY;
const LIGHTSPEED_REFRESH_TOKEN = process.env.LIGHTSPEED_REFRESH_TOKEN;
const LIGHTSPEED_CLIENT_ID = process.env.LIGHTSPEED_CLIENT_ID;
const LIGHTSPEED_CLIENT_SECRET = process.env.LIGHTSPEED_CLIENT_SECRET;
const LIGHTSPEED_ACCOUNT_ID = process.env.LIGHTSPEED_ACCOUNT_ID;
const LIGHTSPEED_API_BASE = process.env.LIGHTSPEED_API_BASE || 'https://api.lightspeedapp.com';
const USE_MOCK_DATA = process.env.LIGHTSPEED_USE_MOCK || 'true'; // Default to mock until real credentials are set

// Check if we have valid credentials
const hasValidAuth = (LIGHTSPEED_API_KEY || (LIGHTSPEED_CLIENT_SECRET && LIGHTSPEED_REFRESH_TOKEN));

if (!LIGHTSPEED_ACCOUNT_ID) {
  console.error('❌ LIGHTSPEED_ACCOUNT_ID not found in environment');
  process.exit(1);
}

if (!hasValidAuth && USE_MOCK_DATA !== 'true') {
  console.error('❌ Lightspeed authentication not configured');
  console.error('   Need one of:');
  console.error('   - LIGHTSPEED_API_KEY (for Basic Auth)');
  console.error('   - LIGHTSPEED_CLIENT_SECRET + LIGHTSPEED_REFRESH_TOKEN (for OAuth2)');
  console.error('   Or set LIGHTSPEED_USE_MOCK=true to use mock data for testing');
  process.exit(1);
}

let lightspeedAccessToken = null;

// OAuth2 authentication with refresh token
async function authenticate() {
  if (LIGHTSPEED_API_KEY) {
    console.log('🔐 Using API Key authentication');
    return LIGHTSPEED_API_KEY;
  }

  if (LIGHTSPEED_CLIENT_SECRET && LIGHTSPEED_REFRESH_TOKEN) {
    console.log('🔐 Refreshing access token...');
    try {
      const response = await axios.post('https://cloud.lightspeedapp.com/oauth/access_token.php',
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: LIGHTSPEED_CLIENT_ID,
          client_secret: LIGHTSPEED_CLIENT_SECRET,
          refresh_token: LIGHTSPEED_REFRESH_TOKEN
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      lightspeedAccessToken = response.data.access_token;
      console.log('✅ Authentication successful');
      return lightspeedAccessToken;
    } catch (error) {
      console.error('❌ Authentication failed:', error.response?.data || error.message);
      throw error;
    }
  }

  throw new Error('No valid authentication method configured');
}

// Create Lightspeed API client
function createLightspeedClient() {
  const authHeader = LIGHTSPEED_API_KEY
    ? `Basic ${Buffer.from(`${LIGHTSPEED_API_KEY}:apikey`).toString('base64')}`
    : `Bearer ${lightspeedAccessToken}`;

  return axios.create({
    baseURL: `${LIGHTSPEED_API_BASE}/API/V3/Account/${LIGHTSPEED_ACCOUNT_ID}`,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 30000
  });
}

// Generate mock data for testing
function generateMockTransactions(count = 50) {
  console.log(`⚠️  Using mock data (${count} transactions)`);
  const transactions = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 730); // Random day in last 2 years
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const amount = (Math.random() * 200 + 10).toFixed(2);
    const tax = (parseFloat(amount) * 0.08).toFixed(2);
    const total = (parseFloat(amount) + parseFloat(tax)).toFixed(2);

    transactions.push({
      id: `mock-txn-${Date.now()}-${i}`,
      amount: parseFloat(amount),
      tax: parseFloat(tax),
      total: parseFloat(total),
      customer_id: Math.random() > 0.5 ? `cust-${Math.floor(Math.random() * 100)}` : null,
      status: Math.random() > 0.1 ? 'COMPLETED' : 'PENDING',
      created_at: date.toISOString(),
      updated_at: date.toISOString()
    });
  }

  return transactions;
}

function generateMockProducts(count = 25) {
  console.log(`⚠️  Using mock data (${count} products)`);
  const products = [];
  const categories = ['Flower', 'Pre-Rolls', 'Edibles', 'Concentrates', 'Vapes', 'Accessories'];
  const productNames = [
    'Blue Dream', 'OG Kush', 'Sour Diesel', 'Girl Scout Cookies', 'Gorilla Glue',
    'Wedding Cake', 'Purple Haze', 'Jack Herer', 'Granddaddy Purple', 'Northern Lights'
  ];

  for (let i = 0; i < count; i++) {
    const name = productNames[Math.floor(Math.random() * productNames.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const price = (Math.random() * 60 + 10).toFixed(2);
    const cost = (parseFloat(price) * 0.6).toFixed(2);

    products.push({
      id: `mock-prod-${Date.now()}-${i}`,
      name: `${name} - ${category}`,
      description: `Premium ${category.toLowerCase()} product`,
      category: category,
      price: parseFloat(price),
      cost: parseFloat(cost),
      quantity: Math.floor(Math.random() * 100),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return products;
}

async function syncTransactions() {
  console.log('💰 Syncing Lightspeed transactions...');

  const table = bigquery.dataset(DATASET).table('lightspeed_transactions');
  let transactions = [];

  try {
    // Use mock data if authentication is not configured
    if (USE_MOCK_DATA === 'true' || !hasValidAuth) {
      transactions = generateMockTransactions(50);
    } else {
      // Authenticate and fetch real data
      await authenticate();
      const client = createLightspeedClient();

      // Fetch ALL transactions (last 2 years)
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      let offset = 0;
      const limit = 100;
      let totalFetched = 0;
      let hasMore = true;

      while (hasMore) {
        const params = {
          load_relations: '["Customer"]',
          timeStamp: `>,${twoYearsAgo.toISOString()}`,
          limit: limit,
          offset: offset
        };

        const response = await client.get('/Sale.json', { params });
        const batch = response.data.Sale || [];

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        totalFetched += batch.length;

        for (const sale of batch) {
          transactions.push({
            id: String(sale.saleID),
            amount: parseFloat(sale.calcSubtotal || 0),
            tax: parseFloat(sale.calcTax || 0),
            total: parseFloat(sale.calcTotal || 0),
            customer_id: sale.customerID ? String(sale.customerID) : null,
            status: sale.completed === 'true' ? 'COMPLETED' : 'PENDING',
            created_at: sale.createTime || new Date().toISOString(),
            updated_at: sale.updateTime || null
          });
        }

        offset += limit;
        console.log(`   Fetched ${totalFetched} transactions...`);

        // Lightspeed has rate limits, so we check if we got less than limit
        if (batch.length < limit) {
          hasMore = false;
        }
      }
    }

    // Insert into BigQuery in batches of 1000
    if (transactions.length > 0) {
      const BATCH_SIZE = 1000;
      let inserted = 0;
      for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
        const batch = transactions.slice(i, i + BATCH_SIZE);
        await table.insert(batch, { skipInvalidRows: true, ignoreUnknownValues: true });
        inserted += batch.length;
        console.log(`   Inserted ${inserted}/${transactions.length} transactions...`);
      }
      console.log(`✅ Inserted ${transactions.length} transactions into BigQuery`);
    } else {
      console.log('⚠️  No transactions found');
    }

    return transactions.length;
  } catch (error) {
    console.error('❌ Error syncing transactions:', error.response?.data || error.message);
    throw error;
  }
}

async function syncProducts() {
  console.log('📦 Syncing Lightspeed products...');

  const table = bigquery.dataset(DATASET).table('lightspeed_products');
  let products = [];

  try {
    // Use mock data if authentication is not configured
    if (USE_MOCK_DATA === 'true' || !hasValidAuth) {
      products = generateMockProducts(25);
    } else {
      // Authenticate and fetch real data
      if (!lightspeedAccessToken) {
        await authenticate();
      }
      const client = createLightspeedClient();

      let offset = 0;
      const limit = 100;
      let totalFetched = 0;
      let hasMore = true;

      while (hasMore) {
        const params = {
          load_relations: '["ItemShops","Category"]',
          limit: limit,
          offset: offset
        };

        const response = await client.get('/Item.json', { params });
        const batch = response.data.Item || [];

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        totalFetched += batch.length;

        for (const item of batch) {
          // Get the default price and quantity
          const defaultShop = Array.isArray(item.ItemShops?.ItemShop)
            ? item.ItemShops.ItemShop[0]
            : item.ItemShops?.ItemShop;

          products.push({
            id: String(item.itemID),
            name: item.description || 'Unknown Product',
            description: item.longDescription || null,
            category: item.Category?.name || null,
            price: parseFloat(defaultShop?.defaultCost || item.defaultCost || 0),
            cost: parseFloat(defaultShop?.cost || item.cost || 0),
            quantity: parseInt(defaultShop?.qoh || 0),
            created_at: item.createTime || new Date().toISOString(),
            updated_at: item.updateTime || null
          });
        }

        offset += limit;
        console.log(`   Fetched ${totalFetched} products...`);

        // Lightspeed has rate limits, so we check if we got less than limit
        if (batch.length < limit) {
          hasMore = false;
        }
      }
    }

    // Insert into BigQuery in batches of 1000
    if (products.length > 0) {
      const BATCH_SIZE = 1000;
      let inserted = 0;
      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        await table.insert(batch, { skipInvalidRows: true, ignoreUnknownValues: true });
        inserted += batch.length;
        console.log(`   Inserted ${inserted}/${products.length} products...`);
      }
      console.log(`✅ Inserted ${products.length} products into BigQuery`);
    } else {
      console.log('⚠️  No products found');
    }

    return products.length;
  } catch (error) {
    console.error('❌ Error syncing products:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  const mode = (USE_MOCK_DATA === 'true' || !hasValidAuth) ? 'MOCK' : 'LIVE';

  console.log('🚀 Starting Lightspeed → BigQuery sync...');
  console.log(`   Mode: ${mode} ${mode === 'MOCK' ? '(set LIGHTSPEED_USE_MOCK=false and add credentials for live data)' : ''}`);
  console.log(`   Project: ${PROJECT_ID}`);
  console.log(`   Dataset: ${DATASET}`);
  console.log(`   Account: ${LIGHTSPEED_ACCOUNT_ID}`);
  console.log('');

  try {
    const transactionCount = await syncTransactions();
    const productCount = await syncProducts();

    console.log('');
    console.log('🎉 Sync complete!');
    console.log(`   Mode: ${mode}`);
    console.log(`   ${transactionCount} transactions synced`);
    console.log(`   ${productCount} products synced`);
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
