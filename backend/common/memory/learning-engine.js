import { createClient } from 'redis';
import crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_LENGTH = 32;

const encrypt = (text, key) => {
  if (!key) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

const decrypt = (encryptedData, key) => {
  if (!key || !encryptedData.includes(':')) return encryptedData;
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(key, 'hex'),
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export class MemoryLearningEngine {
  constructor({ logger, redisClient, encryptionKey }) {
    this.logger = logger;
    this.redisClient = redisClient;
    this.encryptionKey = encryptionKey;
    this.profileCache = new Map();
  }

  static async create({ logger }) {
    const redisUrl = process.env.MEMORY_REDIS_URL;
    let redisClient = null;

    if (redisUrl) {
      try {
        redisClient = createClient({ url: redisUrl });
        redisClient.on('error', (error) =>
          logger?.error?.({ error: error.message }, 'Memory Learning Redis error')
        );
        if (!redisClient.isOpen) {
          await redisClient.connect();
        }
        logger?.info('Memory Learning Engine connected to Redis');
      } catch (error) {
        logger?.warn?.({ error: error.message }, 'Redis unavailable, using in-memory cache');
      }
    }

    const encryptionKey = process.env.MEMORY_ENCRYPTION_KEY;
    if (encryptionKey && encryptionKey.length !== ENCRYPTION_KEY_LENGTH * 2) {
      throw new Error(`MEMORY_ENCRYPTION_KEY must be ${ENCRYPTION_KEY_LENGTH * 2} hex characters`);
    }

    return new MemoryLearningEngine({ logger, redisClient, encryptionKey });
  }

  getProfileKey(customerId) {
    return `livhana:memory:profile:${customerId}`;
  }

  getSessionKey(sessionId) {
    return `livhana:memory:session:${sessionId}`;
  }

  getContextKey(customerId, type) {
    return `livhana:memory:context:${type}:${customerId}`;
  }

  getAuditKey(customerId) {
    return `livhana:memory:audit:${customerId}`;
  }

  async getProfile(customerId) {
    if (this.profileCache.has(customerId)) {
      const cached = this.profileCache.get(customerId);
      if (Date.now() - cached.cachedAt < 10000) {
        return cached.profile;
      }
    }

    const key = this.getProfileKey(customerId);

    if (this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        if (data) {
          const decrypted = this.encryptionKey ? decrypt(data, this.encryptionKey) : data;
          const profile = JSON.parse(decrypted);
          this.profileCache.set(customerId, { profile, cachedAt: Date.now() });
          return profile;
        }
      } catch (error) {
        this.logger?.error?.({ error: error.message, customerId }, 'Failed to get profile from Redis');
      }
    }

    return this.createDefaultProfile(customerId);
  }

  createDefaultProfile(customerId) {
    return {
      customerId,
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        strains: [],
        products: [],
        budget: { min: null, max: null },
        effects: [],
        flavors: [],
        consumptionMethods: [],
      },
      behavioral: {
        purchaseFrequency: null,
        averageOrderValue: null,
        preferredTimeOfDay: [],
        orderSizes: [],
        lastPurchaseDate: null,
        totalPurchases: 0,
        lifetimeValue: 0,
      },
      medical: {
        conditions: [],
        symptoms: [],
        effectivenessRatings: {},
      },
      communication: {
        style: 'neutral',
        preferredChannel: null,
        responseTime: [],
        engagement: 0,
        sentiment: 0,
      },
      conversationHistory: {
        totalInteractions: 0,
        topics: {},
        questions: [],
        recommendations: [],
        lastInteractionDate: null,
      },
      predictions: {
        nextPurchaseDate: null,
        nextPurchaseConfidence: 0,
        churnRisk: 0,
        recommendedProducts: [],
      },
      metadata: {
        dataRetentionUntil: null,
        consentGiven: false,
        lastAuditDate: null,
      },
    };
  }

  async updateProfile(customerId, updates) {
    const profile = await this.getProfile(customerId);
    const updatedProfile = this.mergeProfileUpdates(profile, updates);
    updatedProfile.updatedAt = new Date().toISOString();

    const key = this.getProfileKey(customerId);
    const serialized = JSON.stringify(updatedProfile);
    const encrypted = this.encryptionKey ? encrypt(serialized, this.encryptionKey) : serialized;

    if (this.redisClient) {
      try {
        const ttl = Number(process.env.MEMORY_PROFILE_TTL_DAYS ?? 2555) * 86400;
        await this.redisClient.set(key, encrypted, { EX: ttl });
      } catch (error) {
        this.logger?.error?.({ error: error.message, customerId }, 'Failed to save profile to Redis');
      }
    }

    this.profileCache.set(customerId, { profile: updatedProfile, cachedAt: Date.now() });

    await this.auditLog(customerId, {
      action: 'profile_update',
      timestamp: new Date().toISOString(),
      fields: Object.keys(updates),
    });

    return updatedProfile;
  }

  mergeProfileUpdates(profile, updates) {
    const merged = { ...profile };

    Object.keys(updates).forEach((key) => {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && updates[key] !== null) {
        merged[key] = { ...(merged[key] || {}), ...updates[key] };
      } else {
        merged[key] = updates[key];
      }
    });

    return merged;
  }

  async learnFromInteraction(customerId, interaction) {
    const { message, response, sentiment, intent, entities, sessionId, timestamp } = interaction;
    const profile = await this.getProfile(customerId);

    const updates = {
      conversationHistory: {
        ...profile.conversationHistory,
        totalInteractions: (profile.conversationHistory.totalInteractions || 0) + 1,
        lastInteractionDate: timestamp || new Date().toISOString(),
      },
    };

    if (message) {
      const topics = this.extractTopics(message);
      topics.forEach((topic) => {
        updates.conversationHistory.topics = updates.conversationHistory.topics || {};
        updates.conversationHistory.topics[topic] =
          (updates.conversationHistory.topics[topic] || 0) + 1;
      });

      const questions = this.extractQuestions(message);
      if (questions.length > 0) {
        updates.conversationHistory.questions = [
          ...(profile.conversationHistory.questions || []),
          ...questions.map(q => ({ question: q, timestamp: timestamp || new Date().toISOString() }))
        ].slice(-50);
      }
    }

    if (entities) {
      if (entities.strains) {
        updates.preferences = updates.preferences || {};
        updates.preferences.strains = this.mergeWeightedList(
          profile.preferences.strains || [],
          entities.strains
        );
      }
      if (entities.effects) {
        updates.preferences = updates.preferences || {};
        updates.preferences.effects = this.mergeWeightedList(
          profile.preferences.effects || [],
          entities.effects
        );
      }
      if (entities.symptoms) {
        updates.medical = updates.medical || {};
        updates.medical.symptoms = [...new Set([
          ...(profile.medical.symptoms || []),
          ...entities.symptoms
        ])];
      }
    }

    if (sentiment !== undefined) {
      const currentSentiment = profile.communication.sentiment || 0;
      const totalInteractions = profile.conversationHistory.totalInteractions || 1;
      updates.communication = {
        ...profile.communication,
        sentiment: (currentSentiment * totalInteractions + sentiment) / (totalInteractions + 1),
      };
    }

    if (intent) {
      updates.conversationHistory = updates.conversationHistory || profile.conversationHistory;
      updates.conversationHistory.lastIntent = intent;
    }

    const timeOfDay = this.getTimeOfDayBucket(timestamp);
    if (timeOfDay) {
      updates.behavioral = updates.behavioral || profile.behavioral;
      updates.behavioral.preferredTimeOfDay = this.mergeWeightedList(
        profile.behavioral.preferredTimeOfDay || [],
        [timeOfDay]
      );
    }

    const engagementScore = this.calculateEngagementScore(message, response);
    updates.communication = updates.communication || profile.communication;
    updates.communication.engagement =
      ((profile.communication.engagement || 0) * 0.9 + engagementScore * 0.1);

    if (sessionId) {
      await this.updateSessionContext(sessionId, { customerId, interaction, timestamp });
    }

    return await this.updateProfile(customerId, updates);
  }

  extractTopics(text) {
    const topics = [];
    const topicKeywords = {
      strain: ['strain', 'sativa', 'indica', 'hybrid', 'cultivar'],
      effect: ['relaxing', 'energizing', 'focus', 'sleep', 'pain', 'anxiety', 'creative'],
      product: ['flower', 'edible', 'concentrate', 'vape', 'cartridge', 'pre-roll', 'tincture'],
      price: ['price', 'cost', 'budget', 'cheap', 'expensive', 'deal', 'discount'],
      medical: ['medical', 'medicine', 'condition', 'symptom', 'treatment', 'relief'],
    };

    const lowerText = text.toLowerCase();
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  extractQuestions(text) {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    return sentences.filter(s =>
      s.includes('?') ||
      /^(what|how|when|where|why|which|who|can|could|would|should|is|are|do|does)/i.test(s)
    );
  }

  mergeWeightedList(existing, newItems, maxLength = 20) {
    const weightMap = new Map();

    existing.forEach(item => {
      const key = typeof item === 'string' ? item : item.value;
      const weight = typeof item === 'string' ? 1 : item.weight;
      weightMap.set(key, (weightMap.get(key) || 0) + weight * 0.9);
    });

    newItems.forEach(item => {
      const key = typeof item === 'string' ? item : item.value;
      weightMap.set(key, (weightMap.get(key) || 0) + 1);
    });

    return Array.from(weightMap.entries())
      .map(([value, weight]) => ({ value, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, maxLength);
  }

  getTimeOfDayBucket(timestamp) {
    const date = timestamp ? new Date(timestamp) : new Date();
    const hour = date.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  calculateEngagementScore(message, response) {
    let score = 0.5;
    if (message && message.length > 50) score += 0.1;
    if (message && message.includes('?')) score += 0.1;
    if (response && response.length > 100) score += 0.1;
    if (message && response && response.toLowerCase().includes('recommend')) score += 0.1;
    return Math.min(score, 1.0);
  }

  async updatePurchaseHistory(customerId, purchase) {
    const { amount, products, timestamp, orderId } = purchase;
    const profile = await this.getProfile(customerId);

    const updates = {
      behavioral: {
        ...profile.behavioral,
        totalPurchases: (profile.behavioral.totalPurchases || 0) + 1,
        lifetimeValue: (profile.behavioral.lifetimeValue || 0) + amount,
        lastPurchaseDate: timestamp || new Date().toISOString(),
        averageOrderValue:
          ((profile.behavioral.lifetimeValue || 0) + amount) /
          ((profile.behavioral.totalPurchases || 0) + 1),
      },
    };

    if (products && Array.isArray(products)) {
      updates.preferences = {
        ...profile.preferences,
        products: this.mergeWeightedList(profile.preferences.products || [], products),
      };

      const strains = products
        .filter(p => p.strain)
        .map(p => p.strain);
      if (strains.length > 0) {
        updates.preferences.strains = this.mergeWeightedList(
          profile.preferences.strains || [],
          strains
        );
      }
    }

    const daysSinceLastPurchase = profile.behavioral.lastPurchaseDate
      ? (new Date(timestamp) - new Date(profile.behavioral.lastPurchaseDate)) / (1000 * 60 * 60 * 24)
      : null;

    if (daysSinceLastPurchase !== null) {
      updates.behavioral.purchaseFrequency = daysSinceLastPurchase;
    }

    await this.auditLog(customerId, {
      action: 'purchase_recorded',
      orderId,
      amount,
      timestamp: timestamp || new Date().toISOString(),
    });

    return await this.updateProfile(customerId, updates);
  }

  async predictNextPurchase(customerId) {
    const profile = await this.getProfile(customerId);

    if (!profile.behavioral.lastPurchaseDate || !profile.behavioral.purchaseFrequency) {
      return {
        nextPurchaseDate: null,
        confidence: 0,
        reason: 'Insufficient purchase history',
      };
    }

    const lastPurchase = new Date(profile.behavioral.lastPurchaseDate);
    const avgFrequency = profile.behavioral.purchaseFrequency;
    const predictedDate = new Date(lastPurchase.getTime() + avgFrequency * 24 * 60 * 60 * 1000);

    const daysSinceLastPurchase = (Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24);
    const confidence = Math.max(0, Math.min(1, 1 - Math.abs(daysSinceLastPurchase - avgFrequency) / avgFrequency));

    return {
      nextPurchaseDate: predictedDate.toISOString(),
      confidence,
      daysSinceLastPurchase,
      averageFrequency: avgFrequency,
    };
  }

  async calculateChurnRisk(customerId) {
    const profile = await this.getProfile(customerId);

    let riskScore = 0;

    if (!profile.behavioral.lastPurchaseDate) {
      return { churnRisk: 0, reason: 'No purchase history' };
    }

    const daysSinceLastPurchase =
      (Date.now() - new Date(profile.behavioral.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24);

    const avgFrequency = profile.behavioral.purchaseFrequency || 30;

    if (daysSinceLastPurchase > avgFrequency * 2) {
      riskScore += 0.4;
    } else if (daysSinceLastPurchase > avgFrequency * 1.5) {
      riskScore += 0.2;
    }

    if (profile.communication.engagement < 0.3) {
      riskScore += 0.2;
    }

    if (profile.communication.sentiment < 0) {
      riskScore += 0.2;
    }

    const daysSinceLastInteraction = profile.conversationHistory.lastInteractionDate
      ? (Date.now() - new Date(profile.conversationHistory.lastInteractionDate).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    if (daysSinceLastInteraction > 30) {
      riskScore += 0.2;
    }

    return {
      churnRisk: Math.min(riskScore, 1.0),
      daysSinceLastPurchase,
      daysSinceLastInteraction,
      engagement: profile.communication.engagement,
      sentiment: profile.communication.sentiment,
    };
  }

  async getRecommendations(customerId) {
    const profile = await this.getProfile(customerId);
    const recommendations = [];

    const topStrains = (profile.preferences.strains || [])
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(s => s.value);

    const topEffects = (profile.preferences.effects || [])
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(e => e.value);

    if (topStrains.length > 0) {
      recommendations.push({
        type: 'strain',
        values: topStrains,
        reason: 'Based on your past preferences',
        confidence: 0.8,
      });
    }

    if (topEffects.length > 0) {
      recommendations.push({
        type: 'effect',
        values: topEffects,
        reason: 'Effects you typically enjoy',
        confidence: 0.7,
      });
    }

    if (profile.behavioral.averageOrderValue) {
      recommendations.push({
        type: 'budget',
        value: profile.behavioral.averageOrderValue,
        range: [
          profile.behavioral.averageOrderValue * 0.8,
          profile.behavioral.averageOrderValue * 1.2
        ],
        reason: 'Within your typical budget',
        confidence: 0.9,
      });
    }

    if (profile.medical.symptoms.length > 0) {
      recommendations.push({
        type: 'medical',
        symptoms: profile.medical.symptoms,
        reason: 'May help with your symptoms',
        confidence: 0.6,
      });
    }

    return recommendations;
  }

  async getContext(customerId, options = {}) {
    const { includeSession = false, sessionId = null, depth = 'full' } = options;

    const profile = await this.getProfile(customerId);

    let sessionContext = null;
    if (includeSession && sessionId) {
      sessionContext = await this.getSessionContext(sessionId);
    }

    const shortTermKey = this.getContextKey(customerId, 'short-term');
    let shortTermMemory = null;
    if (this.redisClient && (depth === 'full' || depth === 'short')) {
      try {
        const data = await this.redisClient.get(shortTermKey);
        if (data) {
          shortTermMemory = JSON.parse(data);
        }
      } catch (error) {
        this.logger?.warn?.({ error: error.message }, 'Failed to retrieve short-term memory');
      }
    }

    if (depth === 'summary') {
      return {
        customerId,
        preferences: profile.preferences,
        recentTopics: Object.entries(profile.conversationHistory.topics || {})
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([topic]) => topic),
        lastInteraction: profile.conversationHistory.lastInteractionDate,
        churnRisk: (await this.calculateChurnRisk(customerId)).churnRisk,
        session: sessionContext,
      };
    }

    return {
      customerId,
      profile,
      session: sessionContext,
      shortTerm: shortTermMemory,
      recommendations: await this.getRecommendations(customerId),
      predictions: {
        nextPurchase: await this.predictNextPurchase(customerId),
        churnRisk: await this.calculateChurnRisk(customerId),
      },
    };
  }

  async updateSessionContext(sessionId, data) {
    const key = this.getSessionKey(sessionId);
    const ttl = Number(process.env.SESSION_TTL_SECONDS ?? 3600);

    if (this.redisClient) {
      try {
        const existing = await this.redisClient.get(key);
        const session = existing ? JSON.parse(existing) : { sessionId, interactions: [] };
        session.interactions.push({ ...data, timestamp: data.timestamp || new Date().toISOString() });
        session.updatedAt = new Date().toISOString();
        await this.redisClient.set(key, JSON.stringify(session), { EX: ttl });
      } catch (error) {
        this.logger?.error?.({ error: error.message, sessionId }, 'Failed to update session context');
      }
    }
  }

  async getSessionContext(sessionId) {
    const key = this.getSessionKey(sessionId);

    if (this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        this.logger?.error?.({ error: error.message, sessionId }, 'Failed to get session context');
      }
    }

    return null;
  }

  async auditLog(customerId, entry) {
    const key = this.getAuditKey(customerId);
    const ttl = Number(process.env.AUDIT_LOG_TTL_DAYS ?? 2555) * 86400;

    if (this.redisClient) {
      try {
        await this.redisClient.lPush(key, JSON.stringify(entry));
        await this.redisClient.expire(key, ttl);
        await this.redisClient.lTrim(key, 0, 999);
      } catch (error) {
        this.logger?.error?.({ error: error.message, customerId }, 'Failed to write audit log');
      }
    }
  }

  async forgetCustomer(customerId, reason = 'User requested deletion') {
    await this.auditLog(customerId, {
      action: 'forget_customer',
      reason,
      timestamp: new Date().toISOString(),
    });

    const keys = [
      this.getProfileKey(customerId),
      this.getContextKey(customerId, 'short-term'),
      this.getContextKey(customerId, 'long-term'),
    ];

    if (this.redisClient) {
      try {
        await Promise.all(keys.map(key => this.redisClient.del(key)));
      } catch (error) {
        this.logger?.error?.({ error: error.message, customerId }, 'Failed to delete customer data');
      }
    }

    this.profileCache.delete(customerId);

    this.logger?.info({ customerId, reason }, 'Customer data forgotten');
  }

  async close() {
    if (this.redisClient && this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
  }
}

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
