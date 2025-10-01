/**
 * Self-Improvement Loop Tests
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { SelfImprovementLoop } from './self-improvement-loop.js';
import { createClient } from 'redis';
import pino from 'pino';

describe('SelfImprovementLoop', () => {
  let improvementLoop;
  let logger;
  let redisClient;

  beforeAll(async () => {
    // Skip tests if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.info('Skipping tests - ANTHROPIC_API_KEY not set');
      return;
    }

    logger = pino({ level: 'silent' });

    // Connect to Redis
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = createClient({ url: redisUrl });
    await redisClient.connect();

    improvementLoop = new SelfImprovementLoop({
      logger,
      apiKey: process.env.ANTHROPIC_API_KEY,
      redisClient,
    });
  });

  afterAll(async () => {
    if (improvementLoop) {
      await improvementLoop.shutdown();
    }
    if (redisClient) {
      await redisClient.quit();
    }
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      if (!improvementLoop) return;

      expect(improvementLoop.config).toBeDefined();
      expect(improvementLoop.config.minInteractionsForLearning).toBe(100);
      expect(improvementLoop.config.approvalRequired).toBe(true);
    });

    it('should have safety checks enabled', () => {
      if (!improvementLoop) return;

      expect(improvementLoop.safetyChecks.requireApproval).toBe(true);
      expect(improvementLoop.safetyChecks.requireTests).toBe(true);
      expect(improvementLoop.safetyChecks.allowProductionDeploy).toBe(false);
    });

    it('should initialize metrics', () => {
      if (!improvementLoop) return;

      expect(improvementLoop.metrics).toBeDefined();
      expect(improvementLoop.metrics.improvementsProposed).toBe(0);
    });
  });

  describe('Learning Analysis', () => {
    it('should handle insufficient data gracefully', async () => {
      if (!improvementLoop) return;

      // Mock BigQuery to return no data
      const mockQuery = vi.fn().mockResolvedValue([[]]);
      improvementLoop.bigQuery.query = mockQuery;

      const result = await improvementLoop.analyzeLearningOpportunities();

      expect(result.status).toBe('insufficient_data');
    });
  });

  describe('Performance Analysis', () => {
    it('should handle missing performance data', async () => {
      if (!improvementLoop) return;

      // Mock BigQuery to throw (table doesn't exist)
      const mockQuery = vi.fn().mockRejectedValue(new Error('Table not found'));
      improvementLoop.bigQuery.query = mockQuery;

      const result = await improvementLoop.analyzePerformanceOptimizations();

      expect(result.status).toBe('no_data');
    });
  });

  describe('Proposal Management', () => {
    it('should store and retrieve proposals', async () => {
      if (!improvementLoop || !redisClient) return;

      const proposal = {
        id: 'test-proposal-1',
        type: 'learning',
        priority: 'medium',
        title: 'Test proposal',
        description: 'Test description',
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
      };

      // Store proposal
      await redisClient.set(
        `improvement:proposal:${proposal.id}`,
        JSON.stringify(proposal)
      );

      // Retrieve proposal
      const retrieved = await redisClient.get(`improvement:proposal:${proposal.id}`);
      const parsed = JSON.parse(retrieved);

      expect(parsed.id).toBe(proposal.id);
      expect(parsed.type).toBe(proposal.type);
      expect(parsed.status).toBe('pending_approval');

      // Cleanup
      await redisClient.del(`improvement:proposal:${proposal.id}`);
    });

    it('should group proposals by type', () => {
      if (!improvementLoop) return;

      const proposals = [
        { type: 'learning', priority: 'medium' },
        { type: 'learning', priority: 'high' },
        { type: 'performance', priority: 'high' },
        { type: 'bugfix', priority: 'critical' },
      ];

      const grouped = improvementLoop.groupBy(proposals, 'type');

      expect(grouped).toEqual({
        learning: 2,
        performance: 1,
        bugfix: 1,
      });
    });

    it('should group proposals by priority', () => {
      if (!improvementLoop) return;

      const proposals = [
        { type: 'learning', priority: 'medium' },
        { type: 'learning', priority: 'high' },
        { type: 'performance', priority: 'high' },
        { type: 'bugfix', priority: 'critical' },
      ];

      const grouped = improvementLoop.groupBy(proposals, 'priority');

      expect(grouped).toEqual({
        medium: 1,
        high: 2,
        critical: 1,
      });
    });
  });

  describe('Metrics Dashboard', () => {
    it('should calculate performance gains', async () => {
      if (!improvementLoop || !redisClient) return;

      // Create mock implemented proposals
      const proposals = [
        {
          id: 'perf-1',
          type: 'performance',
          status: 'implemented',
          metrics: {
            currentResponseTime: 3000,
            targetResponseTime: 1000,
          },
        },
        {
          id: 'perf-2',
          type: 'performance',
          status: 'implemented',
          metrics: {
            currentResponseTime: 2500,
            targetResponseTime: 1500,
          },
        },
      ];

      // Store proposals
      for (const p of proposals) {
        await redisClient.set(
          `improvement:proposal:${p.id}`,
          JSON.stringify(p)
        );
      }

      const gains = await improvementLoop.calculatePerformanceGains();

      expect(gains.totalResponseTimeReduced).toBe(3000); // (3000-1000) + (2500-1500)
      expect(gains.optimizedEndpoints).toBe(2);
      expect(gains.averageImprovement).toBe(1500);

      // Cleanup
      for (const p of proposals) {
        await redisClient.del(`improvement:proposal:${p.id}`);
      }
    });
  });

  describe('Safety Features', () => {
    it('should require approval for critical proposals', async () => {
      if (!improvementLoop || !redisClient) return;

      const proposal = {
        id: 'critical-1',
        type: 'bugfix',
        priority: 'critical',
        status: 'pending_approval',
        requiresApproval: true,
      };

      await redisClient.set(
        `improvement:proposal:${proposal.id}`,
        JSON.stringify(proposal)
      );

      // Try to execute without approval
      try {
        await improvementLoop.executeApprovedImprovement(proposal.id);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('not approved');
      }

      // Cleanup
      await redisClient.del(`improvement:proposal:${proposal.id}`);
    });

    it('should enforce safety limits', () => {
      if (!improvementLoop) return;

      expect(improvementLoop.safetyChecks.maxChangesPerProposal).toBe(10);
      expect(improvementLoop.safetyChecks.maxLinesPerChange).toBe(500);
      expect(improvementLoop.config.maxAutoFixesPerDay).toBe(5);
    });
  });

  describe('JSON Extraction', () => {
    it('should extract JSON from markdown code blocks', () => {
      if (!improvementLoop) return;

      const response = {
        content: [
          { type: 'text', text: 'Here is the result:\n```json\n{"key": "value"}\n```' }
        ]
      };

      const result = improvementLoop.extractJSON(response);
      expect(result).toEqual({ key: 'value' });
    });

    it('should extract JSON from plain text', () => {
      if (!improvementLoop) return;

      const response = {
        content: [
          { type: 'text', text: '{"key": "value"}' }
        ]
      };

      const result = improvementLoop.extractJSON(response);
      expect(result).toEqual({ key: 'value' });
    });

    it('should handle invalid JSON gracefully', () => {
      if (!improvementLoop) return;

      const response = {
        content: [
          { type: 'text', text: 'Not JSON at all' }
        ]
      };

      const result = improvementLoop.extractJSON(response);
      expect(result).toEqual({ raw: 'Not JSON at all' });
    });
  });

  describe('Knowledge Base', () => {
    it('should store learning patterns in Redis', async () => {
      if (!improvementLoop || !redisClient) return;

      const learningData = {
        successPatterns: [{ pattern: 'greeting', frequency: 10 }],
        failurePatterns: [{ pattern: 'timeout', frequency: 2 }],
      };

      await improvementLoop.updateKnowledgeBase('test_patterns', learningData);

      // Verify stored
      const keys = await redisClient.keys('knowledge:test_patterns:*');
      expect(keys.length).toBeGreaterThan(0);

      // Cleanup
      for (const key of keys) {
        await redisClient.del(key);
      }
    });
  });
});
