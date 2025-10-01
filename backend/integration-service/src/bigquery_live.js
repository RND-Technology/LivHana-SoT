const express = require('express');
const { BigQuery } = require('@google-cloud/bigquery');
const { createLogger } = require('../../common/logging');

const router = express.Router();
const logger = createLogger('bigquery-live');

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BQ_DATASET || 'commerce';
const LOCATION = process.env.BQ_LOCATION || 'US';
const PAYMENTS_TABLE = process.env.BQ_TABLE_PAYMENTS || 'square_payments';
const ITEMS_TABLE = process.env.BQ_TABLE_ITEMS || 'square_items';
const CACHE_TTL_MS = Number(process.env.BQ_CACHE_TTL_MS || 30_000);

const bigQueryEnabled = Boolean(
  PROJECT_ID &&
  process.env.GOOGLE_APPLICATION_CREDENTIALS &&
  process.env.BIGQUERY_ENABLED !== 'false'
);

let client;
if (bigQueryEnabled) {
  try {
    client = new BigQuery({ projectId: PROJECT_ID });
    logger.info('BigQuery client initialised');
  } catch (error) {
    logger.error('Failed to initialise BigQuery client', error);
  }
}

const cache = {
  dashboard: null,
  historical: null,
  products: null,
  expiresAt: 0,
  lastError: null,
  lastRefresh: null,
  mode: bigQueryEnabled ? 'live' : 'mock'
};

const mockResponse = {
  dashboard: {
    lastUpdate: new Date().toISOString(),
    metrics: {
      todayRevenue: 0,
      weekRevenue: 0,
      monthRevenue: 0,
      yearRevenue: 0,
      totalTransactions: 0,
      totalCustomers: 0,
      avgOrderValue: 0
    },
    topProducts: [],
    recentTransactions: []
  },
  historical: {
    historical: [],
    daily: [],
    monthly: []
  },
  products: {
    products: [],
    topSellers: []
  }
};

const buildTableRef = (table) => `\`${PROJECT_ID}.${DATASET}.${table}\``;

async function fetchDashboardData() {
  const paymentsQuery = `
    SELECT
      id,
      amount,
      currency,
      status,
      customer_id,
      TIMESTAMP(created_at) as created_at
    FROM ${buildTableRef(PAYMENTS_TABLE)}
    WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 180 DAY)
    ORDER BY created_at DESC
    LIMIT 1000
  `;

  const [payments] = await client.query({ query: paymentsQuery, location: LOCATION });
  const totalTransactions = payments.length;
  const totalCustomers = new Set(payments.map((p) => p.customer_id).filter(Boolean)).size;

  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const sumByFilter = (filterFn) =>
    payments
      .filter((p) => filterFn(new Date(p.created_at).getTime()))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0) / 100;

  const todayRevenue = sumByFilter((ts) => ts >= dayAgo);
  const weekRevenue = sumByFilter((ts) => ts >= weekAgo);
  const monthRevenue = sumByFilter((ts) => ts >= monthAgo);
  const yearRevenue = sumByFilter(() => true);

  const avgOrderValue = totalTransactions ? yearRevenue / totalTransactions : 0;

  const recentTransactions = payments.slice(0, 25).map((p) => ({
    id: p.id,
    amount: Number(p.amount || 0) / 100,
    created_at: p.created_at,
    status: p.status,
    customer_id: p.customer_id
  }));

  return {
    lastUpdate: new Date().toISOString(),
    metrics: {
      todayRevenue,
      weekRevenue,
      monthRevenue,
      yearRevenue,
      totalTransactions,
      totalCustomers,
      avgOrderValue
    },
    topProducts: [],
    recentTransactions
  };
}

async function fetchHistoricalData() {
  const dailyQuery = `
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS transactions,
      SUM(amount) / 100 AS revenue,
      COUNT(DISTINCT customer_id) AS customers
    FROM ${buildTableRef(PAYMENTS_TABLE)}
    WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
    GROUP BY date
    ORDER BY date DESC
    LIMIT 180
  `;

  const monthlyQuery = `
    SELECT
      FORMAT_DATE('%Y-%m', DATE_TRUNC(created_at, MONTH)) AS month,
      COUNT(*) AS transactions,
      SUM(amount) / 100 AS revenue,
      COUNT(DISTINCT customer_id) AS customers
    FROM ${buildTableRef(PAYMENTS_TABLE)}
    WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 24 MONTH)
    GROUP BY month
    ORDER BY month DESC
    LIMIT 24
  `;

  const [daily] = await client.query({ query: dailyQuery, location: LOCATION });
  const [monthly] = await client.query({ query: monthlyQuery, location: LOCATION });

  return {
    historical: daily.slice(0, 90),
    daily,
    monthly
  };
}

async function fetchProductData() {
  const catalogQuery = `
    SELECT
      id,
      updated_at,
      JSON_VALUE(data, '$.item_data.name') AS name,
      JSON_VALUE(data, '$.item_data.description') AS description,
      JSON_VALUE(data, '$.item_data.variations[0].item_variation_data.price_money.amount') AS price_amount,
      JSON_VALUE(data, '$.item_data.variations[0].item_variation_data.sku') AS sku,
      JSON_VALUE(data, '$.item_data.categories[0].name') AS category
    FROM ${buildTableRef(ITEMS_TABLE)}
    WHERE JSON_VALUE(data, '$.item_data.name') IS NOT NULL
    ORDER BY updated_at DESC
    LIMIT 200
  `;

  const [items] = await client.query({ query: catalogQuery, location: LOCATION });

  return {
    products: items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price_amount ? Number(item.price_amount) / 100 : 0,
      sku: item.sku || '',
      category: item.category || 'Hemp Product',
      updated_at: item.updated_at
    })),
    topSellers: []
  };
}

async function refreshCache() {
  if (!bigQueryEnabled || !client) {
    cache.dashboard = mockResponse.dashboard;
    cache.historical = mockResponse.historical;
    cache.products = mockResponse.products;
    cache.mode = 'mock';
    cache.lastRefresh = new Date().toISOString();
    return;
  }

  try {
    const [dashboard, historical, products] = await Promise.all([
      fetchDashboardData(),
      fetchHistoricalData(),
      fetchProductData()
    ]);

    cache.dashboard = dashboard;
    cache.historical = historical;
    cache.products = products;
    cache.mode = 'live';
    cache.lastRefresh = new Date().toISOString();
    cache.lastError = null;
    cache.expiresAt = Date.now() + CACHE_TTL_MS;
  } catch (error) {
    cache.lastError = error.message;
    cache.mode = 'degraded';
    logger.error('Failed to refresh BigQuery cache', error);

    if (!cache.dashboard) {
      cache.dashboard = mockResponse.dashboard;
      cache.historical = mockResponse.historical;
    }

    if (!cache.products) {
      cache.products = mockResponse.products;
    }

    cache.expiresAt = Date.now() + CACHE_TTL_MS;
  }
}

async function ensureFreshCache() {
  if (!cache.lastRefresh || Date.now() > cache.expiresAt) {
    await refreshCache();
  }
}

router.get('/api/bigquery/dashboard', async (req, res) => {
  await ensureFreshCache();
  res.json({ ...cache.dashboard, mode: cache.mode, lastRefresh: cache.lastRefresh, error: cache.lastError });
});

router.get('/api/bigquery/historical', async (req, res) => {
  await ensureFreshCache();
  res.json({ ...cache.historical, mode: cache.mode, lastRefresh: cache.lastRefresh, error: cache.lastError });
});

router.get('/api/bigquery/products', async (req, res) => {
  await ensureFreshCache();
  res.json({ ...cache.products, mode: cache.mode, lastRefresh: cache.lastRefresh, error: cache.lastError });
});

const getBigQueryStatus = () => ({
  enabled: bigQueryEnabled && Boolean(client),
  mode: cache.mode,
  lastRefresh: cache.lastRefresh,
  lastError: cache.lastError
});

module.exports = {
  router,
  getBigQueryStatus
};
