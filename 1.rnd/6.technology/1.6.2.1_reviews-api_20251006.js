import express from 'express';
import { createLogger } from '../../common/logging/index.js';

const router = express.Router();
const logger = createLogger('reviews-api');

// In-memory review storage (replace with BigQuery when ready)
const reviewsStore = new Map();

// Demo reviews generator
const getDemoReviews = (productId) => [
  {
    id: `${productId}-review-1`,
    productId,
    rating: 5,
    title: 'Amazing quality!',
    comment: 'Best product I\'ve tried. Effects are exactly as described.',
    name: 'Sarah M.',
    verified: true,
    helpful: 12,
    created: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: `${productId}-review-2`,
    productId,
    rating: 4,
    title: 'Great for relaxation',
    comment: 'Works well for evening use. Helps with sleep.',
    name: 'Mike D.',
    verified: true,
    helpful: 8,
    created: new Date(Date.now() - 86400000).toISOString()
  }
];

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    logger.info(`Fetching reviews for product: ${productId}`);

    // TODO: Replace with BigQuery query when dataset connected
    // const { BigQuery } = require('@google-cloud/bigquery');
    // const bigquery = new BigQuery();
    // const query = `SELECT * FROM cannabis_data.product_reviews WHERE product_id = @productId`;
    // const [rows] = await bigquery.query({ query, params: { productId } });

    const reviews = reviewsStore.get(productId) || getDemoReviews(productId);

    res.json({
      success: true,
      reviews,
      count: reviews.length,
      productId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to fetch reviews for ${req.params.productId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews',
      message: error.message
    });
  }
});

// POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const { productId, rating, title, comment, name } = req.body;

    if (!productId || !rating || !title || !comment || !name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: productId, rating, title, comment, name'
      });
    }

    logger.info(`Creating review for product: ${productId}`);

    const review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      rating: Number(rating),
      title,
      comment,
      name,
      verified: false, // Set to true when user is verified buyer
      helpful: 0,
      created: new Date().toISOString()
    };

    // TODO: Insert into BigQuery
    // const { BigQuery } = require('@google-cloud/bigquery');
    // const bigquery = new BigQuery();
    // await bigquery.dataset('cannabis_data').table('product_reviews').insert([review]);

    // Store in memory for now
    const existingReviews = reviewsStore.get(productId) || [];
    existingReviews.push(review);
    reviewsStore.set(productId, existingReviews);

    logger.info(`Review created: ${review.id}`);

    res.status(201).json({
      success: true,
      review,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    logger.error('Failed to create review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit review',
      message: error.message
    });
  }
});

// PUT /api/reviews/:reviewId/helpful
router.put('/:reviewId/helpful', async (req, res) => {
  try {
    const { reviewId } = req.params;
    logger.info(`Marking review ${reviewId} as helpful`);

    // Find and update review
    let found = false;
    for (const [productId, reviews] of reviewsStore.entries()) {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        review.helpful += 1;
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review marked as helpful'
    });
  } catch (error) {
    logger.error(`Failed to mark review ${req.params.reviewId} as helpful:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review',
      message: error.message
    });
  }
});

export default router;

// Optimized: 2025-10-03
// Product reviews API with BigQuery backend placeholder
