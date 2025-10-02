const express = require('express');
const { BigQuery } = require('@google-cloud/bigquery');
const { createClient } = require('redis');
const { createLogger } = require('../../common/logging');

const router = express.Router();
const logger = createLogger('bigquery-live');

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BQ_DATASET || 'commerce';
const LOCATION = process.env.BQ_LOCATION || 'US';
const PAYMENTS_TABLE = process.env.BQ_TABLE_PAYMENTS || 'square_payments';
const ITEMS_TABLE = process.env.BQ_TABLE_ITEMS || 'square_items';
const CACHE_TTL_MS = Number(process.env.BQ_CACHE_TTL_MS || 30_000);
const CACHE_NAMESPACE = 'bigquery:cache:';
const STALE_WHILE_REVALIDATE_MS = Number(process.env.BQ_STALE_REVALIDATE_MS || 60_000);

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

// Redis client setup
let redisClient = null;
let redisAvailable = false;

const initRedisClient = async () => {
  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT;

  if (!redisHost || !redisPort) {
    logger.warn('Redis not configured (REDIS_HOST/REDIS_PORT missing) - using in-memory cache');
    return null;
  }

  try {
    const client = createClient({
      socket: {
        host: redisHost,
        port: Number(redisPort),
      },
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
    });

    client.on('error', (error) => {
      logger.error('Redis client error', error);
      redisAvailable = false;
    });

    client.on('connect', () => {
      logger.info('Redis client connected');
      redisAvailable = true;
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
      redisAvailable = true;
    });

    client.on('reconnecting', () => {
      logger.warn('Redis client reconnecting');
    });

    await client.connect();
    logger.info('Redis cache client initialized');
    return client;
  } catch (error) {
    logger.error('Failed to initialize Redis client - falling back to in-memory cache', error);
    return null;
  }
};

// In-memory fallback cache
const inMemoryCache = {
  dashboard: null,
  historical: null,
  products: null,
  expiresAt: 0,
  lastError: null,
  lastRefresh: null,
  mode: bigQueryEnabled ? 'live' : 'mock'
};

// Cache statistics
const cacheStats = {
  hits: 0,
  misses: 0,
  errors: 0,
  totalRequests: 0,
  responseTimeMs: [],
  lastReset: Date.now(),
  redisAvailable: false,
};

// Helper to calculate cache metrics
const getCacheMetrics = () => {
  const totalRequests = cacheStats.totalRequests || 1; // Avoid division by zero
  const hitRate = (cacheStats.hits / totalRequests) * 100;
  const missRate = (cacheStats.misses / totalRequests) * 100;
  const avgResponseTime = cacheStats.responseTimeMs.length > 0
    ? cacheStats.responseTimeMs.reduce((a, b) => a + b, 0) / cacheStats.responseTimeMs.length
    : 0;

  return {
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    errors: cacheStats.errors,
    totalRequests: cacheStats.totalRequests,
    hitRate: hitRate.toFixed(2) + '%',
    missRate: missRate.toFixed(2) + '%',
    avgResponseTimeMs: avgResponseTime.toFixed(2),
    redisAvailable: cacheStats.redisAvailable,
    uptimeSeconds: Math.floor((Date.now() - cacheStats.lastReset) / 1000),
  };
};

// Log cache metrics every 60 seconds
setInterval(() => {
  const metrics = getCacheMetrics();
  logger.info({ metrics }, 'Cache performance metrics');
}, 60_000);

// Redis cache operations with stale-while-revalidate
const redisCache = {
  async get(key) {
    if (!redisClient || !redisAvailable) {
      return null;
    }

    const startTime = Date.now();
    try {
      const fullKey = CACHE_NAMESPACE + key;
      const data = await redisClient.get(fullKey);

      const responseTime = Date.now() - startTime;
      cacheStats.responseTimeMs.push(responseTime);
      if (cacheStats.responseTimeMs.length > 100) {
        cacheStats.responseTimeMs.shift(); // Keep last 100 samples
      }

      if (data) {
        const parsed = JSON.parse(data);
        cacheStats.hits++;
        cacheStats.totalRequests++;
        return parsed;
      }

      cacheStats.misses++;
      cacheStats.totalRequests++;
      return null;
    } catch (error) {
      cacheStats.errors++;
      cacheStats.totalRequests++;
      logger.error({ key, error: error.message }, 'Redis GET error');
      return null;
    }
  },

  async set(key, value, ttlMs = CACHE_TTL_MS) {
    if (!redisClient || !redisAvailable) {
      return false;
    }

    try {
      const fullKey = CACHE_NAMESPACE + key;
      const ttlSeconds = Math.ceil(ttlMs / 1000);
      await redisClient.setEx(fullKey, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      cacheStats.errors++;
      logger.error({ key, error: error.message }, 'Redis SET error');
      return false;
    }
  },

  async del(key) {
    if (!redisClient || !redisAvailable) {
      return false;
    }

    try {
      const fullKey = CACHE_NAMESPACE + key;
      await redisClient.del(fullKey);
      return true;
    } catch (error) {
      cacheStats.errors++;
      logger.error({ key, error: error.message }, 'Redis DEL error');
      return false;
    }
  },

  async getWithMetadata(key) {
    if (!redisClient || !redisAvailable) {
      return { value: null, ttl: 0 };
    }

    try {
      const fullKey = CACHE_NAMESPACE + key;
      const [data, ttl] = await Promise.all([
        redisClient.get(fullKey),
        redisClient.ttl(fullKey),
      ]);

      if (data) {
        return { value: JSON.parse(data), ttl };
      }

      return { value: null, ttl: 0 };
    } catch (error) {
      logger.error({ key, error: error.message }, 'Redis GET with metadata error');
      return { value: null, ttl: 0 };
    }
  },
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
  const startTime = Date.now();

  // OPTIMIZED: Push ALL aggregations to BigQuery, eliminate client-side filtering
  const metricsQuery = `
    WITH time_ranges AS (
      SELECT
        TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY) AS day_start,
        TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY) AS week_start,
        TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY) AS month_start,
        TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 365 DAY) AS year_start
    )
    SELECT
      -- Today metrics
      SUM(CASE WHEN created_at >= (SELECT day_start FROM time_ranges) THEN amount ELSE 0 END) / 100 AS todayRevenue,
      -- Week metrics
      SUM(CASE WHEN created_at >= (SELECT week_start FROM time_ranges) THEN amount ELSE 0 END) / 100 AS weekRevenue,
      -- Month metrics
      SUM(CASE WHEN created_at >= (SELECT month_start FROM time_ranges) THEN amount ELSE 0 END) / 100 AS monthRevenue,
      -- Year metrics (180 day window)
      SUM(amount) / 100 AS yearRevenue,
      COUNT(*) AS totalTransactions,
      COUNT(DISTINCT customer_id) AS totalCustomers,
      -- Average order value
      SAFE_DIVIDE(SUM(amount), COUNT(*)) / 100 AS avgOrderValue
    FROM ${buildTableRef(PAYMENTS_TABLE)}
    WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 180 DAY)
      AND status = 'COMPLETED'
  `;

  // OPTIMIZED: Separate query for recent transactions with specific columns only
  const recentQuery = `
    SELECT
      id,
      amount,
      created_at,
      status,
      customer_id
    FROM ${buildTableRef(PAYMENTS_TABLE)}
    WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      AND status = 'COMPLETED'
    ORDER BY created_at DESC
    LIMIT 25
  `;

  // Execute queries in parallel for maximum performance
  const [metricsResult, recentResult] = await Promise.all([
    client.query({ query: metricsQuery, location: LOCATION }),
    client.query({ query: recentQuery, location: LOCATION })
  ]);

  const metrics = metricsResult[0][0] || {};
  const recentTransactions = recentResult[0].map((p) => ({
    id: p.id,
    amount: Number(p.amount || 0) / 100,
    created_at: p.created_at,
    status: p.status,
    customer_id: p.customer_id
  }));

  const queryTime = Date.now() - startTime;
  logger.info(`Dashboard query completed in ${queryTime}ms`);

  return {
    lastUpdate: new Date().toISOString(),
    queryTimeMs: queryTime,
    metrics: {
      todayRevenue: Number(metrics.todayRevenue || 0),
      weekRevenue: Number(metrics.weekRevenue || 0),
      monthRevenue: Number(metrics.monthRevenue || 0),
      yearRevenue: Number(metrics.yearRevenue || 0),
      totalTransactions: Number(metrics.totalTransactions || 0),
      totalCustomers: Number(metrics.totalCustomers || 0),
      avgOrderValue: Number(metrics.avgOrderValue || 0)
    },
    topProducts: [],
    recentTransactions
  };
}

async function fetchHistoricalData() {
  const startTime = Date.now();

  // OPTIMIZED: Add status filter and performance tracking
  const dailyQuery = `
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS transactions,
      SUM(amount) / 100 AS revenue,
      COUNT(DISTINCT customer_id) AS customers
    FROM ${buildTableRef(PAYMENTS_TABLE)}
    WHERE DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
      AND status = 'COMPLETED'
    GROUP BY date
    ORDER BY date DESC
    LIMIT 180
  `;

  // OPTIMIZED: Add status filter for monthly aggregation
  const monthlyQuery = `
    SELECT
      FORMAT_DATE('%Y-%m', DATE_TRUNC(DATE(created_at), MONTH)) AS month,
      COUNT(*) AS transactions,
      SUM(amount) / 100 AS revenue,
      COUNT(DISTINCT customer_id) AS customers
    FROM ${buildTableRef(PAYMENTS_TABLE)}
    WHERE DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 24 MONTH)
      AND status = 'COMPLETED'
    GROUP BY month
    ORDER BY month DESC
    LIMIT 24
  `;

  const [daily, monthly] = await Promise.all([
    client.query({ query: dailyQuery, location: LOCATION }),
    client.query({ query: monthlyQuery, location: LOCATION })
  ]);

  const queryTime = Date.now() - startTime;
  logger.info(`Historical query completed in ${queryTime}ms`);

  return {
    historical: daily[0].slice(0, 90),
    daily: daily[0],
    monthly: monthly[0],
    queryTimeMs: queryTime
  };
}

async function fetchProductData() {
  const startTime = Date.now();

  // OPTIMIZED: Add performance tracking and filter only available products
  const catalogQuery = `
    SELECT
      id,
      name,
      category,
      sku,
      price,
      available,
      created_at,
      updated_at
    FROM ${buildTableRef(ITEMS_TABLE)}
    WHERE name IS NOT NULL
      AND available = true
    ORDER BY updated_at DESC
    LIMIT 200
  `;

  const [items] = await client.query({ query: catalogQuery, location: LOCATION });

  const queryTime = Date.now() - startTime;
  logger.info(`Product query completed in ${queryTime}ms`);

  return {
    products: items.map((item) => ({
      id: item.id,
      name: item.name,
      description: '',
      price: item.price ? Number(item.price) / 100 : 0,
      sku: item.sku || '',
      category: item.category || 'Hemp Product',
      updated_at: item.updated_at
    })),
    topSellers: [],
    queryTimeMs: queryTime
  };
}

// Stale-while-revalidate cache refresh with Redis
async function refreshCacheForKey(key, fetchFn) {
  if (!bigQueryEnabled || !client) {
    const mockData = mockResponse[key];
    await redisCache.set(key, mockData);
    inMemoryCache[key] = mockData;
    inMemoryCache.mode = 'mock';
    inMemoryCache.lastRefresh = new Date().toISOString();
    return mockData;
  }

  try {
    const data = await fetchFn();

    // Store in Redis with extended TTL for stale-while-revalidate
    await redisCache.set(key, data, CACHE_TTL_MS + STALE_WHILE_REVALIDATE_MS);

    // Also update in-memory fallback
    inMemoryCache[key] = data;
    inMemoryCache.mode = 'live';
    inMemoryCache.lastRefresh = new Date().toISOString();
    inMemoryCache.lastError = null;

    return data;
  } catch (error) {
    logger.error({ key, error: error.message }, 'Failed to refresh cache for key');
    inMemoryCache.lastError = error.message;
    inMemoryCache.mode = 'degraded';

    // Return stale data if available
    const staleData = await redisCache.get(key) || inMemoryCache[key] || mockResponse[key];
    return staleData;
  }
}

// Get data with stale-while-revalidate pattern
async function getCachedData(key, fetchFn) {
  // Try Redis first
  const cached = await redisCache.getWithMetadata(key);

  if (cached.value) {
    // If TTL is low (within revalidation window), trigger background refresh
    const ttlMs = cached.ttl * 1000;
    if (ttlMs > 0 && ttlMs < (CACHE_TTL_MS / 2)) {
      // Background refresh - don't await
      logger.info({ key, ttl: ttlMs }, 'Triggering background cache refresh (low TTL)');
      refreshCacheForKey(key, fetchFn).catch(err =>
        logger.error({ key, error: err.message }, 'Background refresh failed')
      );
    }
    return cached.value;
  }

  // Check in-memory fallback
  if (inMemoryCache[key] && inMemoryCache.expiresAt > Date.now()) {
    cacheStats.hits++;
    cacheStats.totalRequests++;
    return inMemoryCache[key];
  }

  // Cache miss - fetch and store
  logger.info({ key }, 'Cache miss - fetching fresh data');
  return await refreshCacheForKey(key, fetchFn);
}

// Unified cache getter functions
async function getDashboardData() {
  return getCachedData('dashboard', fetchDashboardData);
}

async function getHistoricalData() {
  return getCachedData('historical', fetchHistoricalData);
}

async function getProductData() {
  return getCachedData('products', fetchProductData);
}

// API Routes
router.get('/api/bigquery/dashboard', async (req, res) => {
  try {
    const data = await getDashboardData();
    res.json({
      ...data,
      mode: inMemoryCache.mode,
      lastRefresh: inMemoryCache.lastRefresh,
      error: inMemoryCache.lastError,
      cached: true
    });
  } catch (error) {
    logger.error('Dashboard endpoint error', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/bigquery/historical', async (req, res) => {
  try {
    const data = await getHistoricalData();
    res.json({
      ...data,
      mode: inMemoryCache.mode,
      lastRefresh: inMemoryCache.lastRefresh,
      error: inMemoryCache.lastError,
      cached: true
    });
  } catch (error) {
    logger.error('Historical endpoint error', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/bigquery/products', async (req, res) => {
  try {
    const data = await getProductData();
    res.json({
      ...data,
      mode: inMemoryCache.mode,
      lastRefresh: inMemoryCache.lastRefresh,
      error: inMemoryCache.lastError,
      cached: true
    });
  } catch (error) {
    logger.error('Products endpoint error', error);
    res.status(500).json({ error: error.message });
  }
});

// Cache statistics endpoint
router.get('/api/bigquery/cache-stats', (req, res) => {
  const metrics = getCacheMetrics();
  res.json({
    status: 'operational',
    cache: {
      backend: redisAvailable ? 'redis' : 'in-memory',
      ...metrics
    },
    config: {
      ttlSeconds: Math.floor(CACHE_TTL_MS / 1000),
      staleWhileRevalidateSeconds: Math.floor(STALE_WHILE_REVALIDATE_MS / 1000),
      namespace: CACHE_NAMESPACE
    },
    timestamp: new Date().toISOString()
  });
});

// Cache invalidation endpoint (useful for manual refresh)
router.post('/api/bigquery/cache/invalidate', async (req, res) => {
  try {
    await Promise.all([
      redisCache.del('dashboard'),
      redisCache.del('historical'),
      redisCache.del('products')
    ]);

    // Clear in-memory cache too
    inMemoryCache.dashboard = null;
    inMemoryCache.historical = null;
    inMemoryCache.products = null;

    logger.info('Cache invalidated successfully');
    res.json({ success: true, message: 'Cache invalidated' });
  } catch (error) {
    logger.error('Cache invalidation error', error);
    res.status(500).json({ error: error.message });
  }
});

const getBigQueryStatus = () => ({
  enabled: bigQueryEnabled && Boolean(client),
  mode: inMemoryCache.mode,
  lastRefresh: inMemoryCache.lastRefresh,
  lastError: inMemoryCache.lastError,
  cacheBackend: redisAvailable ? 'redis' : 'in-memory'
});

// Initialize Redis client and eager cache on startup
(async () => {
  try {
    redisClient = await initRedisClient();
    cacheStats.redisAvailable = redisAvailable;

    if (redisAvailable) {
      logger.info('Redis cache initialized successfully');
    }

    // Eager cache initialization on startup (prevent cold start delays)
    if (bigQueryEnabled && client) {
      await Promise.all([
        refreshCacheForKey('dashboard', fetchDashboardData),
        refreshCacheForKey('historical', fetchHistoricalData),
        refreshCacheForKey('products', fetchProductData)
      ]);
      logger.info('BigQuery cache pre-initialized on startup');
    }
  } catch (error) {
    logger.error('Startup initialization error', error);
  }
})();

module.exports = {
  router,
  getBigQueryStatus
};
