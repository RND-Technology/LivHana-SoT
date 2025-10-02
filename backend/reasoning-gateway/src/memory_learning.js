import { MemoryLearningEngine } from '../../common/memory/learning-engine.js';
import { VectorEmbeddingService } from '../../common/memory/vector-embeddings.js';
import { BigQueryMemoryAdapter } from '../../common/memory/bigquery-adapter.js';

let engineInstance = null;
let vectorInstance = null;
let bigQueryInstance = null;

export const getMemoryLearningEngine = async ({ logger }) => {
  if (!engineInstance) {
    engineInstance = await MemoryLearningEngine.create({ logger });
  }
  return engineInstance;
};

export const getVectorEmbeddingService = async ({ logger }) => {
  if (!vectorInstance && process.env.ENABLE_VECTOR_EMBEDDINGS === 'true') {
    try {
      vectorInstance = await VectorEmbeddingService.create({ logger });
    } catch (error) {
      logger?.warn?.({ error: error.message }, 'Vector service unavailable');
    }
  }
  return vectorInstance;
};

export const getBigQueryAdapter = async ({ logger }) => {
  if (!bigQueryInstance && process.env.ENABLE_BIGQUERY_MEMORY === 'true') {
    try {
      bigQueryInstance = await BigQueryMemoryAdapter.create({ logger });
    } catch (error) {
      logger?.warn?.({ error: error.message }, 'BigQuery adapter unavailable');
    }
  }
  return bigQueryInstance;
};

export const enrichReasoningContext = async ({ customerId, sessionId, prompt, logger }) => {
  try {
    const memoryEngine = await getMemoryLearningEngine({ logger });
    const vectorService = await getVectorEmbeddingService({ logger });

    const context = await memoryEngine.getContext(customerId, {
      includeSession: true,
      sessionId,
      depth: 'summary',
    });

    let vectorContext = null;
    if (vectorService) {
      vectorContext = await vectorService.findRelevantContext(customerId, prompt, {
        includeProducts: true,
        includeConversations: true,
        limit: 3,
      });
    }

    const enrichedPrompt = buildEnrichedPrompt(prompt, context, vectorContext);

    return {
      enrichedPrompt,
      context,
      vectorContext,
    };
  } catch (error) {
    logger?.error?.({ error: error.message, customerId }, 'Failed to enrich reasoning context');
    return { enrichedPrompt: prompt, context: null, vectorContext: null };
  }
};

export const learnFromReasoningResult = async ({
  customerId,
  sessionId,
  prompt,
  response,
  metadata,
  logger,
}) => {
  try {
    const memoryEngine = await getMemoryLearningEngine({ logger });
    const vectorService = await getVectorEmbeddingService({ logger });
    const bigQueryAdapter = await getBigQueryAdapter({ logger });

    const interaction = {
      message: prompt,
      response,
      sessionId,
      timestamp: new Date().toISOString(),
      channel: 'reasoning-gateway',
      ...metadata,
    };

    const profile = await memoryEngine.learnFromInteraction(customerId, interaction);

    if (vectorService) {
      await vectorService.storeConversationEmbedding(customerId, interaction);
    }

    if (bigQueryAdapter) {
      await bigQueryAdapter.saveProfile(customerId, profile);
      await bigQueryAdapter.saveInteraction(customerId, interaction);
    }

    logger?.info({ customerId, sessionId }, 'Learned from reasoning result');

    return profile;
  } catch (error) {
    logger?.error?.({ error: error.message, customerId }, 'Failed to learn from reasoning result');
  }
};

function buildEnrichedPrompt(originalPrompt, context, vectorContext) {
  const parts = [originalPrompt];

  if (context?.preferences) {
    const prefs = [];
    if (context.preferences.strains?.length > 0) {
      const topStrains = context.preferences.strains
        .slice(0, 3)
        .map(s => s.value)
        .join(', ');
      prefs.push(`Preferred strains: ${topStrains}`);
    }
    if (context.preferences.effects?.length > 0) {
      const topEffects = context.preferences.effects
        .slice(0, 3)
        .map(e => e.value)
        .join(', ');
      prefs.push(`Desired effects: ${topEffects}`);
    }
    if (prefs.length > 0) {
      parts.push(`\n\nCustomer preferences: ${prefs.join('; ')}`);
    }
  }

  if (context?.recentTopics?.length > 0) {
    parts.push(`\nRecent topics discussed: ${context.recentTopics.join(', ')}`);
  }

  if (vectorContext?.synthesizedContext) {
    parts.push(`\nRelevant context: ${vectorContext.synthesizedContext}`);
  }

  if (context?.churnRisk && context.churnRisk > 0.5) {
    parts.push('\n\nNote: Customer shows signs of disengagement. Provide extra care and attention.');
  }

  return parts.join('');
}

export const getCustomerContext = async (customerId, options = {}) => {
  try {
    const memoryEngine = await getMemoryLearningEngine({ logger: options.logger });
    return await memoryEngine.getContext(customerId, options);
  } catch (error) {
    options.logger?.error?.({ error: error.message, customerId }, 'Failed to get customer context');
    return null;
  }
};

export const predictNextAction = async (customerId, options = {}) => {
  try {
    const memoryEngine = await getMemoryLearningEngine({ logger: options.logger });

    const nextPurchase = await memoryEngine.predictNextPurchase(customerId);
    const churnRisk = await memoryEngine.calculateChurnRisk(customerId);
    const recommendations = await memoryEngine.getRecommendations(customerId);

    return {
      nextPurchase,
      churnRisk,
      recommendations,
    };
  } catch (error) {
    options.logger?.error?.({ error: error.message, customerId }, 'Failed to predict next action');
    return null;
  }
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
