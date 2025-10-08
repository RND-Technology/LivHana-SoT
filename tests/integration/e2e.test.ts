// End-to-end integration tests
// Tests the full pipeline: Lightspeed → BigQuery → Profile → Recommendations → Voice Commerce

import { describe, it, expect, beforeAll } from '@jest/globals';
import axios from 'axios';

// Test environment URLs (override with env vars)
const LIGHTSPEED_SERVICE = process.env.LIGHTSPEED_SERVICE_URL || 'http://localhost:8080';
const PROFILE_SERVICE = process.env.PROFILE_SERVICE_URL || 'http://localhost:8081';
const RECOMMENDATIONS_SERVICE = process.env.RECOMMENDATIONS_SERVICE_URL || 'http://localhost:8082';
const VOICE_SERVICE = process.env.VOICE_SERVICE_URL || 'http://localhost:8083';

describe('E2E Integration Tests', () => {
  describe('Health Checks', () => {
    it('should verify all services are healthy', async () => {
      const services = [
        { name: 'Lightspeed BigQuery', url: `${LIGHTSPEED_SERVICE}/health` },
        { name: 'Customer Profile', url: `${PROFILE_SERVICE}/health` },
        { name: 'SI Recommendations', url: `${RECOMMENDATIONS_SERVICE}/health` },
        { name: 'Voice Commerce', url: `${VOICE_SERVICE}/health` }
      ];

      for (const service of services) {
        const response = await axios.get(service.url);
        expect(response.status).toBe(200);
        expect(response.data.status).toMatch(/healthy|degraded/);
      }
    });
  });

  describe('Data Pipeline Flow', () => {
    const TEST_CUSTOMER_ID = 'test-customer-12345';

    it('should sync sales to BigQuery', async () => {
      const response = await axios.post(`${LIGHTSPEED_SERVICE}/sync/sales`, {
        since: new Date(Date.now() - 86400000).toISOString(),
        batch_size: 10
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data).toHaveProperty('inserted');
      expect(response.data).toHaveProperty('latency_ms');
    });

    it('should retrieve customer profile', async () => {
      const response = await axios.get(`${PROFILE_SERVICE}/api/customers/${TEST_CUSTOMER_ID}/profile`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', TEST_CUSTOMER_ID);
      expect(response.data).toHaveProperty('purchase_history');
      expect(response.data).toHaveProperty('predictions');
    });

    it('should get recommendations for customer', async () => {
      const response = await axios.get(`${RECOMMENDATIONS_SERVICE}/api/recommendations/${TEST_CUSTOMER_ID}?limit=10`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('recommendations');
      expect(Array.isArray(response.data.recommendations)).toBe(true);

      response.data.recommendations.forEach((rec: any) => {
        expect(rec).toHaveProperty('product_id');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('confidence');
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should process voice command', async () => {
      const response = await axios.post(`${VOICE_SERVICE}/api/voice-commerce`, {
        transcript: 'I need more sleep gummies',
        customerId: TEST_CUSTOMER_ID
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success');
      expect(response.data).toHaveProperty('intent');
      expect(response.data).toHaveProperty('confidence');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        axios.get(`${RECOMMENDATIONS_SERVICE}/api/recommendations/test-customer?limit=5`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should complete sync within 60 seconds', async () => {
      const startTime = Date.now();

      const response = await axios.post(`${LIGHTSPEED_SERVICE}/sync/sales`, {
        batch_size: 100
      });

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(60000); // 60 seconds
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid customer ID', async () => {
      try {
        await axios.get(`${PROFILE_SERVICE}/api/customers//profile`);
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it('should handle empty voice transcript', async () => {
      const response = await axios.post(`${VOICE_SERVICE}/api/voice-commerce`, {
        transcript: '',
        customerId: 'test'
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(false);
    });
  });
});
