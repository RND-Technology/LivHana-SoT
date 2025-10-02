import express from 'express';
import axios from 'axios';
import { createLogger } from '../../common/logging/index.js';

const router = express.Router();
const logger = createLogger('square-catalog');

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const SQUARE_API_BASE = process.env.SQUARE_API_BASE || 'https://connect.squareup.com/v2';

const squareEnabled = Boolean(SQUARE_ACCESS_TOKEN && SQUARE_LOCATION_ID);
let mode = squareEnabled ? 'live' : 'mock';

const squareClient = squareEnabled
  ? axios.create({
      baseURL: SQUARE_API_BASE,
      headers: {
        'Square-Version': process.env.SQUARE_API_VERSION || '2024-06-15',
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
  : null;

const mockObjects = [
  {
    type: 'ITEM',
    id: 'LWXZKKXZ5FHBXQKJNINU4LNP',
    item_data: {
      name: 'Premium Indoor THCA Flower - 3.5g',
      description: 'Top shelf THCA flower. Lab tested at THCA: 23.5%. Grown in Texas.',
      categories: [{ name: 'THCA Flower' }],
      variations: [{
        id: 'VAR-THCA-35',
        item_variation_data: {
          price_money: { amount: 4500, currency: 'USD' },
          sku: 'THCA-IND-35'
        }
      }]
    }
  },
  {
    type: 'ITEM',
    id: 'MJYF7GQWQZ4ZAG5WNWVHQXMD',
    item_data: {
      name: 'Premium CBD Hemp Flower - 7g',
      description: 'Craft hemp CBD flower. CBD: 16.8%, Total THC: <0.3%.',
      categories: [{ name: 'CBD Flower' }],
      variations: [{
        id: 'VAR-CBD-7',
        item_variation_data: {
          price_money: { amount: 3500, currency: 'USD' },
          sku: 'CBD-OUT-7'
        }
      }]
    }
  },
  {
    type: 'ITEM',
    id: 'QRST3456UVWX7890YZAB1234',
    item_data: {
      name: 'Delta-8 THC Gummies - 25mg',
      description: 'Premium Delta-8 THC gummies. 25mg per gummy, 10 count.',
      categories: [{ name: 'Edibles' }],
      variations: [{
        id: 'VAR-D8-25',
        item_variation_data: {
          price_money: { amount: 2999, currency: 'USD' },
          sku: 'D8-GUM-250'
        }
      }]
    }
  }
];

const transformSquareObjects = (objects = []) =>
  objects
    .filter((obj) => obj.type === 'ITEM')
    .map((item) => {
      const variation = item.item_data?.variations?.[0]?.item_variation_data || {};
      return {
        id: item.id,
        name: item.item_data?.name || 'Unnamed Product',
        description: item.item_data?.description || '',
        price: variation.price_money?.amount ? variation.price_money.amount / 100 : 0,
        currency: variation.price_money?.currency || 'USD',
        sku: variation.sku || '',
        category: item.item_data?.categories?.[0]?.name || 'Hemp Product',
        image: item.item_data?.image_url || null,
        inventory: variation.inventory_count ?? null,
        attributes: item.custom_attribute_values || [],
        updated_at: item.updated_at
      };
    });

async function fetchSquareCatalog() {
  if (!squareClient) {
    return {
      objects: mockObjects,
      products: transformSquareObjects(mockObjects),
      source: 'mock'
    };
  }

  try {
    const { data } = await squareClient.get('/catalog/list', {
      params: {
        types: 'ITEM',
        location_ids: SQUARE_LOCATION_ID
      }
    });

    const objects = data.objects || [];
    mode = 'live';

    return {
      objects,
      products: transformSquareObjects(objects),
      source: 'square'
    };
  } catch (error) {
    mode = 'degraded';
    logger.error('Square catalog fetch failed; returning mock data', error);
    return {
      objects: mockObjects,
      products: transformSquareObjects(mockObjects),
      source: 'mock',
      error: error.message
    };
  }
}

router.get('/api/square/catalog', async (req, res) => {
  const payload = await fetchSquareCatalog();
  res.json({ success: true, ...payload });
});

router.get('/api/square/transactions', async (req, res) => {
  if (!squareClient) {
    return res.json({
      source: 'mock',
      totalRevenue: 892345.67,
      transactionCount: 12847,
      averageOrder: 69.42,
      recentTransactions: []
    });
  }

  try {
    const { data } = await squareClient.post('/payments/search', {
      location_ids: [SQUARE_LOCATION_ID],
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              end_at: new Date().toISOString()
            }
          }
        }
      }
    });

    const payments = data.payments || [];
    const total = payments.reduce((sum, payment) => sum + (payment.amount_money?.amount || 0), 0) / 100;
    const average = payments.length ? total / payments.length : 0;

    return res.json({
      source: 'square',
      totalRevenue: Number(total.toFixed(2)),
      transactionCount: payments.length,
      averageOrder: Number(average.toFixed(2)),
      recentTransactions: payments.slice(0, 25).map((payment) => ({
        id: payment.id,
        amount: (payment.amount_money?.amount || 0) / 100,
        status: payment.status,
        created: payment.created_at
      }))
    });
  } catch (error) {
    mode = 'degraded';
    logger.error('Square transactions fetch failed', error);
    return res.status(502).json({
      source: 'square',
      error: 'Square transactions unavailable',
      message: error.message
    });
  }
});

export default {
  router,
  isLive: () => squareEnabled,
  getMode: () => mode
};
// Last optimized: 2025-10-02
