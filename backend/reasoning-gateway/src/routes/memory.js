import { Router } from 'express';
import { randomUUID } from 'crypto';
import { withRequestContext } from '../../../common/logging/context.js';
import { MemoryLearningEngine } from '../../../common/memory/learning-engine.js';
import { BigQueryMemoryAdapter } from '../../../common/memory/bigquery-adapter.js';
import { VectorEmbeddingService } from '../../../common/memory/vector-embeddings.js';

let memoryEngine = null;
let bigQueryAdapter = null;
let vectorService = null;

const initializeServices = async (logger) => {
  if (!memoryEngine) {
    memoryEngine = await MemoryLearningEngine.create({ logger });
    logger?.info('Memory Learning Engine initialized');
  }

  if (!bigQueryAdapter && process.env.ENABLE_BIGQUERY_MEMORY === 'true') {
    try {
      bigQueryAdapter = await BigQueryMemoryAdapter.create({ logger });
      logger?.info('BigQuery Memory Adapter initialized');
    } catch (error) {
      logger?.warn?.({ error: error.message }, 'BigQuery adapter initialization failed, continuing without it');
    }
  }

  if (!vectorService && process.env.ENABLE_VECTOR_EMBEDDINGS === 'true') {
    try {
      vectorService = await VectorEmbeddingService.create({ logger });
      logger?.info('Vector Embedding Service initialized');
    } catch (error) {
      logger?.warn?.({ error: error.message }, 'Vector service initialization failed, continuing without it');
    }
  }
};

export const createMemoryRouter = ({ logger }) => {
  const router = Router();

  router.post('/learn', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    const { customerId, interaction } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }

    if (!interaction || typeof interaction !== 'object') {
      return res.status(400).json({ error: 'interaction object is required' });
    }

    try {
      const interactionId = randomUUID();
      const enrichedInteraction = {
        ...interaction,
        interactionId,
        timestamp: interaction.timestamp || new Date().toISOString(),
      };

      const profile = await memoryEngine.learnFromInteraction(customerId, enrichedInteraction);

      if (bigQueryAdapter) {
        await bigQueryAdapter.saveProfile(customerId, profile);
        await bigQueryAdapter.saveInteraction(customerId, enrichedInteraction);
      }

      if (vectorService && (enrichedInteraction.message || enrichedInteraction.response)) {
        await vectorService.storeConversationEmbedding(customerId, enrichedInteraction);
      }

      contextLogger?.info({ customerId, interactionId }, 'Learned from interaction');

      res.status(200).json({
        success: true,
        interactionId,
        profile: {
          totalInteractions: profile.conversationHistory.totalInteractions,
          engagement: profile.communication.engagement,
          churnRisk: profile.predictions.churnRisk,
        },
      });
    } catch (error) {
      contextLogger?.error?.({ error: error.message, customerId }, 'Failed to learn from interaction');
      res.status(500).json({ error: 'Failed to learn from interaction' });
    }
  });

  router.get('/context/:customerId', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    const { customerId } = req.params;
    const { sessionId, depth = 'summary', includeRecommendations = 'true' } = req.query;

    try {
      const context = await memoryEngine.getContext(customerId, {
        includeSession: !!sessionId,
        sessionId,
        depth,
      });

      if (depth === 'full' && includeRecommendations === 'true') {
        context.recommendations = await memoryEngine.getRecommendations(customerId);
      }

      if (vectorService && req.query.currentMessage) {
        context.vectorContext = await vectorService.findRelevantContext(
          customerId,
          req.query.currentMessage,
          {
            includeProducts: true,
            includeConversations: true,
            limit: 5,
          }
        );
      }

      contextLogger?.info({ customerId, depth }, 'Retrieved customer context');
      res.status(200).json(context);
    } catch (error) {
      contextLogger?.error?.({ error: error.message, customerId }, 'Failed to retrieve context');
      res.status(500).json({ error: 'Failed to retrieve context' });
    }
  });

  router.post('/predict/:customerId', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    const { customerId } = req.params;
    const { predictionType = 'all' } = req.body;

    try {
      const predictions = {};

      if (predictionType === 'all' || predictionType === 'next-purchase') {
        predictions.nextPurchase = await memoryEngine.predictNextPurchase(customerId);
      }

      if (predictionType === 'all' || predictionType === 'churn-risk') {
        predictions.churnRisk = await memoryEngine.calculateChurnRisk(customerId);
      }

      if (predictionType === 'all' || predictionType === 'recommendations') {
        predictions.recommendations = await memoryEngine.getRecommendations(customerId);
      }

      if (bigQueryAdapter) {
        for (const [type, value] of Object.entries(predictions)) {
          await bigQueryAdapter.savePrediction(customerId, {
            type,
            value,
            confidence: value.confidence || 0,
          });
        }
      }

      contextLogger?.info({ customerId, predictionType }, 'Generated predictions');
      res.status(200).json({ customerId, predictions });
    } catch (error) {
      contextLogger?.error?.({ error: error.message, customerId }, 'Failed to generate predictions');
      res.status(500).json({ error: 'Failed to generate predictions' });
    }
  });

  router.post('/purchase/:customerId', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    const { customerId } = req.params;
    const { purchase } = req.body;

    if (!purchase || !purchase.amount || !purchase.orderId) {
      return res.status(400).json({ error: 'Purchase object with amount and orderId is required' });
    }

    try {
      const enrichedPurchase = {
        ...purchase,
        timestamp: purchase.timestamp || new Date().toISOString(),
      };

      const profile = await memoryEngine.updatePurchaseHistory(customerId, enrichedPurchase);

      if (bigQueryAdapter) {
        await bigQueryAdapter.savePurchase(customerId, enrichedPurchase);
        await bigQueryAdapter.saveProfile(customerId, profile);
      }

      contextLogger?.info({ customerId, orderId: purchase.orderId }, 'Purchase recorded');

      res.status(200).json({
        success: true,
        lifetimeValue: profile.behavioral.lifetimeValue,
        totalPurchases: profile.behavioral.totalPurchases,
      });
    } catch (error) {
      contextLogger?.error?.({ error: error.message, customerId }, 'Failed to record purchase');
      res.status(500).json({ error: 'Failed to record purchase' });
    }
  });

  router.delete('/forget/:customerId', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    const { customerId } = req.params;
    const { reason = 'User requested deletion' } = req.body;

    try {
      await memoryEngine.forgetCustomer(customerId, reason);

      contextLogger?.info({ customerId, reason }, 'Customer data forgotten');

      res.status(200).json({
        success: true,
        customerId,
        message: 'Customer data has been deleted',
      });
    } catch (error) {
      contextLogger?.error?.({ error: error.message, customerId }, 'Failed to forget customer');
      res.status(500).json({ error: 'Failed to forget customer' });
    }
  });

  router.get('/profile/:customerId', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    const { customerId } = req.params;

    try {
      const profile = await memoryEngine.getProfile(customerId);

      contextLogger?.info({ customerId }, 'Retrieved customer profile');

      res.status(200).json({
        customerId,
        profile,
        lastUpdated: profile.updatedAt,
      });
    } catch (error) {
      contextLogger?.error?.({ error: error.message, customerId }, 'Failed to retrieve profile');
      res.status(500).json({ error: 'Failed to retrieve profile' });
    }
  });

  router.post('/vector/search', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    if (!vectorService) {
      return res.status(503).json({ error: 'Vector embedding service not available' });
    }

    const { query, searchType = 'products', options = {} } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query text is required' });
    }

    try {
      const results = await vectorService.semanticSearch(query, searchType, options);

      contextLogger?.info({ query, searchType, resultCount: results.length }, 'Vector search completed');

      res.status(200).json({
        query,
        searchType,
        results,
        count: results.length,
      });
    } catch (error) {
      contextLogger?.error?.({ error: error.message, query }, 'Vector search failed');
      res.status(500).json({ error: 'Vector search failed' });
    }
  });

  router.post('/vector/product', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    if (!vectorService) {
      return res.status(503).json({ error: 'Vector embedding service not available' });
    }

    const { product } = req.body;

    if (!product || !product.productId || !product.name) {
      return res.status(400).json({ error: 'Product object with productId and name is required' });
    }

    try {
      const result = await vectorService.storeProductEmbedding(product);

      contextLogger?.info({ productId: product.productId }, 'Product embedding stored');

      res.status(200).json({
        success: true,
        productId: product.productId,
        embeddingCreated: result.created_at,
      });
    } catch (error) {
      contextLogger?.error?.({ error: error.message, productId: product?.productId }, 'Failed to store product embedding');
      res.status(500).json({ error: 'Failed to store product embedding' });
    }
  });

  router.get('/analytics/insights', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    if (!bigQueryAdapter) {
      return res.status(503).json({ error: 'BigQuery analytics not available' });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    try {
      const insights = await bigQueryAdapter.aggregateInsights(startDate, endDate);

      contextLogger?.info({ startDate, endDate, dataPoints: insights.length }, 'Analytics insights retrieved');

      res.status(200).json({
        startDate,
        endDate,
        insights,
      });
    } catch (error) {
      contextLogger?.error?.({ error: error.message }, 'Failed to retrieve analytics insights');
      res.status(500).json({ error: 'Failed to retrieve analytics insights' });
    }
  });

  router.get('/analytics/churn-cohort', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    if (!bigQueryAdapter) {
      return res.status(503).json({ error: 'BigQuery analytics not available' });
    }

    const { riskThreshold = 0.7 } = req.query;

    try {
      const cohort = await bigQueryAdapter.queryChurnRiskCohort(parseFloat(riskThreshold));

      contextLogger?.info({ riskThreshold, cohortSize: cohort.length }, 'Churn cohort retrieved');

      res.status(200).json({
        riskThreshold: parseFloat(riskThreshold),
        cohort,
        totalAtRisk: cohort.length,
      });
    } catch (error) {
      contextLogger?.error?.({ error: error.message }, 'Failed to retrieve churn cohort');
      res.status(500).json({ error: 'Failed to retrieve churn cohort' });
    }
  });

  router.get('/analytics/ltv/:customerId', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    await initializeServices(contextLogger);

    if (!bigQueryAdapter) {
      return res.status(503).json({ error: 'BigQuery analytics not available' });
    }

    const { customerId } = req.params;

    try {
      const ltv = await bigQueryAdapter.queryCustomerLifetimeValue(customerId);

      if (!ltv) {
        return res.status(404).json({ error: 'No purchase history found for customer' });
      }

      contextLogger?.info({ customerId, totalSpent: ltv.total_spent }, 'LTV retrieved');

      res.status(200).json({
        customerId,
        ...ltv,
      });
    } catch (error) {
      contextLogger?.error?.({ error: error.message, customerId }, 'Failed to retrieve LTV');
      res.status(500).json({ error: 'Failed to retrieve LTV' });
    }
  });

  router.get('/health', async (req, res) => {
    try {
      const status = {
        memoryEngine: !!memoryEngine,
        bigQueryAdapter: !!bigQueryAdapter,
        vectorService: !!vectorService,
        redis: memoryEngine?.redisClient?.isOpen || false,
      };

      const allHealthy = status.memoryEngine;

      res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'healthy' : 'degraded',
        services: status,
      });
    } catch (error) {
      logger?.error?.({ error: error.message }, 'Health check failed');
      res.status(503).json({ error: 'Health check failed' });
    }
  });

  return router;
};

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
