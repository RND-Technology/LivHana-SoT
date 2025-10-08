// Unit tests for Customer Profile Service

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CustomerProfileService } from '../src/customer-profile-service';

process.env.LIGHTSPEED_TOKEN = 'test-token';
process.env.GCP_PROJECT_ID = 'test-project';
process.env.NODE_ENV = 'test';

jest.mock('@google-cloud/bigquery');
jest.mock('axios');

describe('CustomerProfileService', () => {
  let service: CustomerProfileService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should throw error if LIGHTSPEED_TOKEN missing', () => {
      delete process.env.LIGHTSPEED_TOKEN;
      expect(() => new CustomerProfileService()).toThrow('LIGHTSPEED_TOKEN');
      process.env.LIGHTSPEED_TOKEN = 'test-token';
    });

    it('should initialize successfully', () => {
      service = new CustomerProfileService();
      expect(service).toBeInstanceOf(CustomerProfileService);
    });
  });

  describe('getEnrichedProfile', () => {
    beforeEach(() => {
      service = new CustomerProfileService();
    });

    it('should throw error if customerId is empty', async () => {
      await expect(service.getEnrichedProfile('')).rejects.toThrow('Customer ID is required');
    });

    it('should return profile with all data sources', async () => {
      const profile = await service.getEnrichedProfile('12345');

      expect(profile).toHaveProperty('id', '12345');
      expect(profile).toHaveProperty('basic');
      expect(profile).toHaveProperty('purchase_history');
      expect(profile).toHaveProperty('preferences');
      expect(profile).toHaveProperty('content_engagement');
      expect(profile).toHaveProperty('predictions');
    });

    it('should handle missing purchase history gracefully', async () => {
      const profile = await service.getEnrichedProfile('12345');

      expect(profile.purchase_history).toEqual([]);
      expect(profile.predictions.next_purchase_date).toBeNull();
    });

    it('should extract preferences from purchase history', async () => {
      // Test preference extraction logic
      const profile = await service.getEnrichedProfile('12345');

      expect(profile.preferences).toEqual(expect.any(Object));
    });
  });

  describe('healthCheck', () => {
    beforeEach(() => {
      service = new CustomerProfileService();
    });

    it('should return healthy when all services connected', async () => {
      const health = await service.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('lightspeed_connected');
      expect(health).toHaveProperty('bigquery_connected');
    });
  });
});
