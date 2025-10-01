import OpenAI from 'openai';
import { createClient } from 'redis';

export class VectorEmbeddingService {
  constructor({ logger, redisClient, openaiClient }) {
    this.logger = logger;
    this.redisClient = redisClient;
    this.openaiClient = openaiClient;
    this.embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    this.embeddingDimension = Number(process.env.EMBEDDING_DIMENSION || 1536);
    this.cache = new Map();
  }

  static async create({ logger }) {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY required for vector embeddings');
    }

    const openaiClient = new OpenAI({ apiKey: openaiApiKey });

    const redisUrl = process.env.MEMORY_REDIS_URL;
    let redisClient = null;

    if (redisUrl) {
      try {
        redisClient = createClient({ url: redisUrl });
        redisClient.on('error', (error) =>
          logger?.error?.({ error: error.message }, 'Vector Redis error')
        );
        if (!redisClient.isOpen) {
          await redisClient.connect();
        }

        try {
          await redisClient.ft.create(
            'idx:product_embeddings',
            {
              '$.product_id': { type: 'TAG', AS: 'product_id' },
              '$.name': { type: 'TEXT', AS: 'name' },
              '$.embedding': {
                type: 'VECTOR',
                ALGORITHM: 'FLAT',
                TYPE: 'FLOAT32',
                DIM: Number(process.env.EMBEDDING_DIMENSION || 1536),
                DISTANCE_METRIC: 'COSINE',
                AS: 'embedding',
              },
            },
            {
              ON: 'JSON',
              PREFIX: 'product:embedding:',
            }
          );
          logger?.info('Created Redis vector index for products');
        } catch (error) {
          if (!error.message.includes('Index already exists')) {
            logger?.warn?.({ error: error.message }, 'Failed to create vector index');
          }
        }

        try {
          await redisClient.ft.create(
            'idx:conversation_embeddings',
            {
              '$.customer_id': { type: 'TAG', AS: 'customer_id' },
              '$.timestamp': { type: 'NUMERIC', AS: 'timestamp' },
              '$.embedding': {
                type: 'VECTOR',
                ALGORITHM: 'FLAT',
                TYPE: 'FLOAT32',
                DIM: Number(process.env.EMBEDDING_DIMENSION || 1536),
                DISTANCE_METRIC: 'COSINE',
                AS: 'embedding',
              },
            },
            {
              ON: 'JSON',
              PREFIX: 'conversation:embedding:',
            }
          );
          logger?.info('Created Redis vector index for conversations');
        } catch (error) {
          if (!error.message.includes('Index already exists')) {
            logger?.warn?.({ error: error.message }, 'Failed to create conversation vector index');
          }
        }
      } catch (error) {
        logger?.warn?.({ error: error.message }, 'Vector embeddings without Redis');
      }
    }

    return new VectorEmbeddingService({ logger, redisClient, openaiClient });
  }

  async generateEmbedding(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for embedding generation');
    }

    const cacheKey = this.hashText(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.openaiClient.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });

      const embedding = response.data[0].embedding;

      this.cache.set(cacheKey, embedding);
      if (this.cache.size > 1000) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return embedding;
    } catch (error) {
      this.logger?.error?.({ error: error.message, text: text.slice(0, 100) }, 'Failed to generate embedding');
      throw error;
    }
  }

  async storeProductEmbedding(product) {
    const { productId, name, description, strain, effects, category } = product;

    const embeddingText = [
      name,
      description,
      strain,
      effects?.join(' '),
      category,
    ]
      .filter(Boolean)
      .join(' ');

    const embedding = await this.generateEmbedding(embeddingText);

    const embeddingData = {
      product_id: productId,
      name,
      strain,
      effects,
      category,
      embedding,
      created_at: new Date().toISOString(),
    };

    if (this.redisClient) {
      try {
        const key = `product:embedding:${productId}`;
        await this.redisClient.json.set(key, '$', embeddingData);
        await this.redisClient.expire(key, Number(process.env.VECTOR_TTL_DAYS ?? 365) * 86400);
      } catch (error) {
        this.logger?.error?.({ error: error.message, productId }, 'Failed to store product embedding');
      }
    }

    return embeddingData;
  }

  async storeConversationEmbedding(customerId, conversation) {
    const { message, response, sessionId, timestamp } = conversation;

    const embeddingText = [message, response].filter(Boolean).join(' ');
    const embedding = await this.generateEmbedding(embeddingText);

    const embeddingData = {
      customer_id: customerId,
      session_id: sessionId,
      message,
      response,
      embedding,
      timestamp: timestamp || new Date().toISOString(),
    };

    if (this.redisClient) {
      try {
        const key = `conversation:embedding:${customerId}:${Date.now()}`;
        await this.redisClient.json.set(key, '$', embeddingData);
        await this.redisClient.expire(key, Number(process.env.CONVERSATION_VECTOR_TTL_DAYS ?? 90) * 86400);
      } catch (error) {
        this.logger?.error?.({ error: error.message, customerId }, 'Failed to store conversation embedding');
      }
    }

    return embeddingData;
  }

  async findSimilarProducts(queryText, options = {}) {
    const { limit = 10, minScore = 0.7, filters = {} } = options;

    if (!this.redisClient) {
      this.logger?.warn('Redis not available for vector search');
      return [];
    }

    const queryEmbedding = await this.generateEmbedding(queryText);

    try {
      const queryVector = Buffer.from(new Float32Array(queryEmbedding).buffer);

      let query = `*`;
      if (filters.category) {
        query = `@category:{${filters.category}}`;
      }
      if (filters.strain) {
        query += ` @strain:{${filters.strain}}`;
      }

      const results = await this.redisClient.ft.search('idx:product_embeddings', query, {
        PARAMS: {
          vec: queryVector,
        },
        SORTBY: {
          BY: 'embedding',
          DIRECTION: 'ASC',
        },
        DIALECT: 2,
        RETURN: ['product_id', 'name', 'strain', 'effects', 'category'],
        LIMIT: {
          from: 0,
          size: limit,
        },
      });

      return results.documents
        .map(doc => ({
          productId: doc.value.product_id,
          name: doc.value.name,
          strain: doc.value.strain,
          effects: doc.value.effects,
          category: doc.value.category,
          score: 1 - parseFloat(doc.value.__embedding_score || 0),
        }))
        .filter(result => result.score >= minScore);
    } catch (error) {
      this.logger?.error?.({ error: error.message, queryText }, 'Vector search failed');
      return [];
    }
  }

  async findSimilarConversations(customerId, queryText, options = {}) {
    const { limit = 5, daysBack = 90 } = options;

    if (!this.redisClient) {
      this.logger?.warn('Redis not available for conversation search');
      return [];
    }

    const queryEmbedding = await this.generateEmbedding(queryText);

    try {
      const queryVector = Buffer.from(new Float32Array(queryEmbedding).buffer);
      const cutoffTimestamp = Date.now() - daysBack * 24 * 60 * 60 * 1000;

      const query = `@customer_id:{${customerId}} @timestamp:[${cutoffTimestamp} +inf]`;

      const results = await this.redisClient.ft.search('idx:conversation_embeddings', query, {
        PARAMS: {
          vec: queryVector,
        },
        SORTBY: {
          BY: 'embedding',
          DIRECTION: 'ASC',
        },
        DIALECT: 2,
        RETURN: ['message', 'response', 'timestamp', 'session_id'],
        LIMIT: {
          from: 0,
          size: limit,
        },
      });

      return results.documents.map(doc => ({
        message: doc.value.message,
        response: doc.value.response,
        timestamp: doc.value.timestamp,
        sessionId: doc.value.session_id,
        score: 1 - parseFloat(doc.value.__embedding_score || 0),
      }));
    } catch (error) {
      this.logger?.error?.({ error: error.message, customerId, queryText }, 'Conversation search failed');
      return [];
    }
  }

  async findRelevantContext(customerId, currentMessage, options = {}) {
    const { includeProducts = true, includeConversations = true, limit = 5 } = options;

    const context = {
      relevantProducts: [],
      similarConversations: [],
      synthesizedContext: '',
    };

    if (includeProducts) {
      context.relevantProducts = await this.findSimilarProducts(currentMessage, { limit });
    }

    if (includeConversations) {
      context.similarConversations = await this.findSimilarConversations(customerId, currentMessage, { limit });
    }

    context.synthesizedContext = this.synthesizeContext(context);

    return context;
  }

  synthesizeContext(context) {
    const parts = [];

    if (context.relevantProducts.length > 0) {
      const productNames = context.relevantProducts
        .slice(0, 3)
        .map(p => `${p.name} (${p.strain})`)
        .join(', ');
      parts.push(`Relevant products: ${productNames}`);
    }

    if (context.similarConversations.length > 0) {
      const recentTopics = context.similarConversations
        .slice(0, 2)
        .map(c => c.message?.substring(0, 100))
        .filter(Boolean)
        .join('; ');
      if (recentTopics) {
        parts.push(`Previous topics: ${recentTopics}`);
      }
    }

    return parts.join(' | ');
  }

  async semanticSearch(queryText, searchType = 'products', options = {}) {
    if (searchType === 'products') {
      return await this.findSimilarProducts(queryText, options);
    } else if (searchType === 'conversations') {
      return await this.findSimilarConversations(options.customerId, queryText, options);
    } else {
      throw new Error(`Unknown search type: ${searchType}`);
    }
  }

  async batchStoreProductEmbeddings(products) {
    const results = [];
    for (const product of products) {
      try {
        const result = await this.storeProductEmbedding(product);
        results.push({ productId: product.productId, success: true, result });
      } catch (error) {
        this.logger?.error?.({ error: error.message, productId: product.productId }, 'Batch embedding failed');
        results.push({ productId: product.productId, success: false, error: error.message });
      }
    }
    return results;
  }

  hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  async close() {
    if (this.redisClient && this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
  }
}
