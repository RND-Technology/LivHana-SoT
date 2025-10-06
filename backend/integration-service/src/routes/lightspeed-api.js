import express from 'express';
import { createLogger } from '../../common/logging/index.js';
import LightspeedClient from '../lib/lightspeed-client.js';

const router = express.Router();
const logger = createLogger('lightspeed-api');

// Initialize LightSpeed client
let lightspeedClient = null;

function getLightspeedClient() {
  if (!lightspeedClient) {
    try {
      lightspeedClient = new LightspeedClient();
      logger.info('LightSpeed client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize LightSpeed client', { error: error.message });
      throw error;
    }
  }
  return lightspeedClient;
}

// GET /api/lightspeed/products
router.get('/products', async (req, res) => {
  try {
    logger.info('Fetching LightSpeed products');

    const client = getLightspeedClient();
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const products = await client.getProducts({ limit, offset });

    res.json({
      success: true,
      products,
      count: products.length,
      source: 'lightspeed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch LightSpeed products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// GET /api/lightspeed/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching LightSpeed product: ${id}`);

    const client = getLightspeedClient();
    const product = await client.getProduct(id);

    res.json({
      success: true,
      product,
      source: 'lightspeed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to fetch product ${req.params.id}:`, error);

    // Return 404 if product not found
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// GET /api/lightspeed/categories
router.get('/categories', async (req, res) => {
  try {
    logger.info('Fetching LightSpeed categories');

    const client = getLightspeedClient();
    const categories = await client.getCategories();

    res.json({
      success: true,
      categories,
      source: 'lightspeed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

export default router;

// Optimized: 2025-10-03
// LightSpeed API routes for product catalog
