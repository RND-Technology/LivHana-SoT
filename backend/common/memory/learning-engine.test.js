import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryLearningEngine } from './learning-engine.js';

describe('MemoryLearningEngine', () => {
  let engine;
  let mockLogger;

  beforeEach(async () => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    engine = new MemoryLearningEngine({
      logger: mockLogger,
      redisClient: null,
      encryptionKey: null,
    });
  });

  describe('Profile Management', () => {
    it('should create a default profile for new customer', async () => {
      const profile = await engine.getProfile('customer-123');

      expect(profile).toBeDefined();
      expect(profile.customerId).toBe('customer-123');
      expect(profile.version).toBe('1.0');
      expect(profile.preferences).toBeDefined();
      expect(profile.behavioral).toBeDefined();
      expect(profile.conversationHistory).toBeDefined();
    });

    it('should update profile with new data', async () => {
      const updates = {
        preferences: {
          strains: ['Blue Dream', 'OG Kush'],
        },
      };

      const profile = await engine.updateProfile('customer-123', updates);

      expect(profile.preferences.strains).toEqual(['Blue Dream', 'OG Kush']);
      expect(profile.updatedAt).toBeDefined();
    });

    it('should cache profiles for fast retrieval', async () => {
      const profile1 = await engine.getProfile('customer-123');
      const profile2 = await engine.getProfile('customer-123');

      expect(profile1).toBe(profile2);
      expect(engine.profileCache.has('customer-123')).toBe(true);
    });
  });

  describe('Learning from Interactions', () => {
    it('should learn from customer interaction', async () => {
      const interaction = {
        message: 'I need something for sleep and anxiety',
        response: 'I recommend Indica strains like Granddaddy Purple',
        sentiment: 0.8,
        timestamp: new Date().toISOString(),
      };

      const profile = await engine.learnFromInteraction('customer-123', interaction);

      expect(profile.conversationHistory.totalInteractions).toBe(1);
      expect(profile.conversationHistory.lastInteractionDate).toBeDefined();
      expect(profile.communication.sentiment).toBeGreaterThan(0);
    });

    it('should extract topics from messages', () => {
      const topics = engine.extractTopics('I love sativa strains for focus and energy');

      expect(topics).toContain('strain');
      expect(topics).toContain('effect');
    });

    it('should extract questions from messages', () => {
      const questions = engine.extractQuestions(
        'What strains help with sleep? How much does it cost?'
      );

      expect(questions.length).toBeGreaterThan(0);
      expect(questions[0]).toContain('?');
    });

    it('should track time of day preferences', async () => {
      const morningInteraction = {
        message: 'Good morning, I need some help',
        timestamp: new Date('2025-01-01T08:00:00Z').toISOString(),
      };

      await engine.learnFromInteraction('customer-123', morningInteraction);

      const timeOfDay = engine.getTimeOfDayBucket(morningInteraction.timestamp);
      expect(timeOfDay).toBe('morning');
    });

    it('should calculate engagement score', () => {
      const score = engine.calculateEngagementScore(
        'This is a detailed question about cannabis products?',
        'Here is a comprehensive response with recommendations...'
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('Purchase History', () => {
    it('should update purchase history', async () => {
      const purchase = {
        orderId: 'order-123',
        amount: 150.0,
        products: ['Blue Dream', 'OG Kush'],
        timestamp: new Date().toISOString(),
      };

      const profile = await engine.updatePurchaseHistory('customer-123', purchase);

      expect(profile.behavioral.totalPurchases).toBe(1);
      expect(profile.behavioral.lifetimeValue).toBe(150.0);
      expect(profile.behavioral.lastPurchaseDate).toBeDefined();
    });

    it('should track product preferences from purchases', async () => {
      const purchase = {
        orderId: 'order-123',
        amount: 150.0,
        products: ['Blue Dream', 'Blue Dream', 'OG Kush'],
        timestamp: new Date().toISOString(),
      };

      const profile = await engine.updatePurchaseHistory('customer-123', purchase);

      expect(profile.preferences.products.length).toBeGreaterThan(0);
    });

    it('should calculate average order value', async () => {
      await engine.updatePurchaseHistory('customer-123', {
        orderId: 'order-1',
        amount: 100.0,
        timestamp: new Date().toISOString(),
      });

      const profile = await engine.updatePurchaseHistory('customer-123', {
        orderId: 'order-2',
        amount: 200.0,
        timestamp: new Date().toISOString(),
      });

      expect(profile.behavioral.averageOrderValue).toBe(150.0);
      expect(profile.behavioral.totalPurchases).toBe(2);
    });
  });

  describe('Predictions', () => {
    it('should predict next purchase date', async () => {
      const customer = 'customer-123';

      await engine.updateProfile(customer, {
        behavioral: {
          lastPurchaseDate: new Date('2025-01-01').toISOString(),
          purchaseFrequency: 30,
        },
      });

      const prediction = await engine.predictNextPurchase(customer);

      expect(prediction.nextPurchaseDate).toBeDefined();
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });

    it('should return low confidence for insufficient data', async () => {
      const prediction = await engine.predictNextPurchase('new-customer');

      expect(prediction.confidence).toBe(0);
      expect(prediction.reason).toBeDefined();
    });

    it('should calculate churn risk', async () => {
      const customer = 'customer-123';

      await engine.updateProfile(customer, {
        behavioral: {
          lastPurchaseDate: new Date('2024-06-01').toISOString(),
          purchaseFrequency: 30,
        },
        communication: {
          engagement: 0.2,
          sentiment: -0.5,
        },
      });

      const churnAnalysis = await engine.calculateChurnRisk(customer);

      expect(churnAnalysis.churnRisk).toBeGreaterThan(0);
      expect(churnAnalysis.daysSinceLastPurchase).toBeGreaterThan(0);
    });

    it('should detect low churn risk for active customers', async () => {
      const customer = 'customer-123';

      await engine.updateProfile(customer, {
        behavioral: {
          lastPurchaseDate: new Date().toISOString(),
          purchaseFrequency: 30,
        },
        communication: {
          engagement: 0.9,
          sentiment: 0.8,
        },
        conversationHistory: {
          lastInteractionDate: new Date().toISOString(),
        },
      });

      const churnAnalysis = await engine.calculateChurnRisk(customer);

      expect(churnAnalysis.churnRisk).toBeLessThan(0.3);
    });
  });

  describe('Recommendations', () => {
    it('should generate recommendations based on profile', async () => {
      const customer = 'customer-123';

      await engine.updateProfile(customer, {
        preferences: {
          strains: [
            { value: 'Blue Dream', weight: 10 },
            { value: 'OG Kush', weight: 8 },
          ],
          effects: [
            { value: 'relaxing', weight: 5 },
            { value: 'sleep', weight: 4 },
          ],
        },
        behavioral: {
          averageOrderValue: 120.0,
        },
      });

      const recommendations = await engine.getRecommendations(customer);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.type === 'strain')).toBe(true);
      expect(recommendations.some(r => r.type === 'effect')).toBe(true);
      expect(recommendations.some(r => r.type === 'budget')).toBe(true);
    });

    it('should include medical recommendations if symptoms present', async () => {
      const customer = 'customer-123';

      await engine.updateProfile(customer, {
        medical: {
          symptoms: ['anxiety', 'insomnia'],
        },
      });

      const recommendations = await engine.getRecommendations(customer);

      const medicalRec = recommendations.find(r => r.type === 'medical');
      expect(medicalRec).toBeDefined();
      expect(medicalRec.symptoms).toContain('anxiety');
    });
  });

  describe('Context Management', () => {
    it('should retrieve customer context', async () => {
      const customer = 'customer-123';

      await engine.updateProfile(customer, {
        preferences: { strains: [{ value: 'Blue Dream', weight: 5 }] },
        conversationHistory: {
          topics: { strain: 10, effect: 5 },
        },
      });

      const context = await engine.getContext(customer, { depth: 'summary' });

      expect(context.customerId).toBe(customer);
      expect(context.preferences).toBeDefined();
      expect(context.recentTopics).toBeDefined();
    });

    it('should include session context when requested', async () => {
      const customer = 'customer-123';
      const sessionId = 'session-456';

      await engine.updateSessionContext(sessionId, {
        customerId: customer,
        interaction: { message: 'test' },
      });

      const context = await engine.getContext(customer, {
        includeSession: true,
        sessionId,
      });

      expect(context.session).toBeDefined();
    });

    it('should provide full context with predictions', async () => {
      const customer = 'customer-123';

      await engine.updateProfile(customer, {
        behavioral: {
          lastPurchaseDate: new Date().toISOString(),
          purchaseFrequency: 30,
        },
      });

      const context = await engine.getContext(customer, { depth: 'full' });

      expect(context.profile).toBeDefined();
      expect(context.predictions).toBeDefined();
      expect(context.predictions.nextPurchase).toBeDefined();
      expect(context.predictions.churnRisk).toBeDefined();
    });
  });

  describe('Privacy & Compliance', () => {
    it('should forget customer data', async () => {
      const customer = 'customer-123';

      await engine.updateProfile(customer, {
        preferences: { strains: ['Blue Dream'] },
      });

      await engine.forgetCustomer(customer, 'User requested deletion');

      expect(engine.profileCache.has(customer)).toBe(false);
    });

    it('should audit profile updates', async () => {
      const customer = 'customer-123';

      await engine.updateProfile(customer, {
        preferences: { strains: ['Blue Dream'] },
      });

      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('Weighted Lists', () => {
    it('should merge weighted lists correctly', () => {
      const existing = [
        { value: 'item1', weight: 5 },
        { value: 'item2', weight: 3 },
      ];

      const newItems = ['item1', 'item3'];

      const merged = engine.mergeWeightedList(existing, newItems);

      expect(merged.length).toBe(3);
      const item1 = merged.find(i => i.value === 'item1');
      expect(item1.weight).toBeGreaterThan(5);
    });

    it('should limit weighted list size', () => {
      const existing = Array.from({ length: 25 }, (_, i) => ({
        value: `item${i}`,
        weight: i,
      }));

      const merged = engine.mergeWeightedList(existing, ['newitem'], 20);

      expect(merged.length).toBeLessThanOrEqual(20);
    });

    it('should sort weighted list by weight', () => {
      const items = ['item1', 'item2', 'item1', 'item1'];

      const weighted = engine.mergeWeightedList([], items);

      expect(weighted[0].value).toBe('item1');
      expect(weighted[0].weight).toBeGreaterThan(weighted[1].weight);
    });
  });
});
