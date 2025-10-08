// Unit tests for SI Recommendation Engine

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SIRecommendationEngine } from '../src/si-recommendations';

process.env.GCP_PROJECT_ID = 'test-project';
process.env.NODE_ENV = 'test';

jest.mock('@google-cloud/bigquery');

describe('SIRecommendationEngine', () => {
  let engine: SIRecommendationEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new SIRecommendationEngine();
  });

  describe('getRecommendations', () => {
    it('should throw error if customerId is empty', async () => {
      await expect(engine.getRecommendations('')).rejects.toThrow('Customer ID is required');
    });

    it('should throw error if limit is out of range', async () => {
      await expect(engine.getRecommendations('12345', 0)).rejects.toThrow('Limit must be between 1 and 50');
      await expect(engine.getRecommendations('12345', 51)).rejects.toThrow('Limit must be between 1 and 50');
    });

    it('should return recommendations array', async () => {
      const recommendations = await engine.getRecommendations('12345');

      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('product_id');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('confidence');
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should respect limit parameter', async () => {
      const recommendations = await engine.getRecommendations('12345', 5);

      expect(recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should fallback to popular products on error', async () => {
      // Mock BigQuery error
      const BigQueryMock = require('@google-cloud/bigquery');
      BigQueryMock.BigQuery().query.mockRejectedValue(new Error('Query failed'));

      const recommendations = await engine.getRecommendations('12345');

      // Should return fallback recommendations
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('batchRecommendations', () => {
    it('should handle multiple customers', async () => {
      const customerIds = ['12345', '67890'];
      const results = await engine.batchRecommendations(customerIds);

      expect(typeof results).toBe('object');
      expect(Object.keys(results).length).toBeGreaterThan(0);
    });

    it('should handle failures gracefully', async () => {
      const customerIds = ['12345', 'invalid'];
      const results = await engine.batchRecommendations(customerIds);

      // Should return results for successful customers only
      expect(typeof results).toBe('object');
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const health = await engine.healthCheck();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('bigquery_connected');
    });
  });
});
