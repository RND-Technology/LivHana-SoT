import { Router } from 'express';

export const createProductRouter = ({ logger }) => {
  const router = Router();

  router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    logger.info({ productId }, 'Fetching product data');
    res.status(200).json({
      productId,
      name: 'Grape Gas',
      inventory: { available: 16, status: 'Almost gone' },
      pricing: [{ sku: '1g', price: 18 }, { sku: '1/8oz', price: 55 }],
    });
  });

  router.get('/:productId/reviews', async (req, res) => {
    const { productId } = req.params;
    logger.info({ productId }, 'Fetching reviews');
    res.status(200).json({
      reviews: [],
      metrics: { look: 4.5, smell: 4.5, taste: 4.5, effect: 4.5 },
    });
  });

  router.post('/:productId/reviews', async (req, res) => {
    const { productId } = req.params;
    const { memberId } = req.body;
    logger.info({ productId, memberId }, 'Submitting review');
    res.status(201).json({ status: 'queued', loyalty: { pointsAwarded: 100, freeGramCredits: 1 } });
  });

  return router;
};
// Last optimized: 2025-10-02
