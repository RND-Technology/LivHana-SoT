// END-TO-END INTEGRATION TEST - Voice Commerce Engine
// Full voice order flow: voice input → NLP → order → payment → confirmation

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { VoiceCommerceEngine } from '../src/voice-commerce';

// Set up test environment
process.env.ANTHROPIC_API_KEY = 'test-key-e2e';
process.env.LIGHTSPEED_TOKEN = 'test-token-e2e';
process.env.GCP_PROJECT_ID = 'test-project-e2e';
process.env.BIGQUERY_DATASET = 'test_dataset';

describe('Voice Commerce Engine - E2E Integration Tests', () => {
  const TEST_CUSTOMER_ID = 'e2e-test-customer-12345';
  let voiceEngine: VoiceCommerceEngine;
  let claudeSpy: jest.SpiedFunction<any>;
  let lightspeedPostSpy: jest.SpiedFunction<any>;
  let bigQuerySpy: jest.SpiedFunction<any>;

  beforeAll(() => {
    voiceEngine = new VoiceCommerceEngine();

    // Set up spies to mock external services
    claudeSpy = jest.spyOn(voiceEngine['claude'].messages, 'create') as jest.SpiedFunction<any>;
    lightspeedPostSpy = jest.spyOn(voiceEngine['lightspeed'], 'post') as jest.SpiedFunction<any>;
    bigQuerySpy = jest.spyOn(voiceEngine['bigquery'], 'query') as jest.SpiedFunction<any>;
    (jest.spyOn(voiceEngine['lightspeed'], 'get') as jest.SpiedFunction<any>).mockResolvedValue({ status: 200 });
    (jest.spyOn(voiceEngine['bigquery'], 'getDatasets') as jest.SpiedFunction<any>).mockResolvedValue([[]]);

    // Set default mocks
    bigQuerySpy.mockResolvedValue([[]]);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('E2E Flow: Full Voice Order Flow', () => {
    it('should complete full voice order flow for reorder intent', async () => {
      bigQuerySpy.mockResolvedValue([[
        { product_id: 'prod-001', product_name: 'Sleep Gummies', purchase_count: 5 },
      ]]);

      claudeSpy.mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            intent: 'reorder',
            product: 'Sleep Gummies',
            quantity: 2,
            confidence: 0.95,
          }),
        }],
      });

      lightspeedPostSpy.mockResolvedValue({
        data: { Sale: { saleID: 'ORDER-12345', calcTotal: '59.98' } },
      });

      const result = await voiceEngine.processVoiceCommand(
        'I want to reorder my sleep gummies, make it 2 bottles',
        TEST_CUSTOMER_ID
      );

      expect(result.success).toBe(true);
      expect(result.intent).toBe('reorder');
      expect(result.confidence).toBe(0.95);
      expect(result.order_id).toBe('ORDER-12345');
    });

    it('should handle new purchase intent', async () => {
      claudeSpy.mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            intent: 'new_purchase',
            product: 'CBD oil',
            confidence: 0.88,
          }),
        }],
      });

      const result = await voiceEngine.processVoiceCommand(
        'Do you have any CBD oil?',
        TEST_CUSTOMER_ID
      );

      expect(result.intent).toBe('new_purchase');
      expect(result.message).toContain('CBD oil');
    });

    it('should handle question intent', async () => {
      claudeSpy.mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            intent: 'question',
            confidence: 0.92,
          }),
        }],
      });

      const result = await voiceEngine.processVoiceCommand(
        'Where is my order?',
        TEST_CUSTOMER_ID
      );

      expect(result.intent).toBe('question');
      expect(result.success).toBe(false);
    });

    it('should handle feedback intent', async () => {
      claudeSpy.mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            intent: 'feedback',
            confidence: 0.93,
          }),
        }],
      });

      const result = await voiceEngine.processVoiceCommand(
        'The product was amazing!',
        TEST_CUSTOMER_ID
      );

      expect(result.intent).toBe('feedback');
      expect(result.message).toMatch(/thank you|appreciate/i);
    });
  });

  describe('E2E Flow: Error Handling', () => {
    it('should reject empty transcript', async () => {
      const result = await voiceEngine.processVoiceCommand('', TEST_CUSTOMER_ID);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Empty transcript');
    });

    it('should reject empty customer ID', async () => {
      const result = await voiceEngine.processVoiceCommand('I want something', '');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Customer ID required');
    });

    it('should handle Claude API errors gracefully', async () => {
      claudeSpy.mockReset();
      claudeSpy.mockRejectedValue(new Error('API timeout'));

      const result = await voiceEngine.processVoiceCommand('test', TEST_CUSTOMER_ID);

      expect(result.success).toBe(false);
      expect(result.intent).toBe('unknown');
    });
  });

  describe('E2E Flow: Multi-Step Conversations', () => {
    it('should handle various quantity specifications', async () => {
      bigQuerySpy.mockResolvedValue([[
        { product_id: 'prod-001', product_name: 'Sleep Gummies', purchase_count: 5 },
      ]]);

      const quantities = [1, 2, 5, 10];

      for (const qty of quantities) {
        claudeSpy.mockResolvedValue({
          content: [{
            type: 'text',
            text: JSON.stringify({
              intent: 'reorder',
              product: 'Sleep Gummies',
              quantity: qty,
              confidence: 0.95,
            }),
          }],
        });

        lightspeedPostSpy.mockResolvedValue({
          data: { Sale: { saleID: `ORDER-${qty}`, calcTotal: String(qty * 29.99) } },
        });

        const result = await voiceEngine.processVoiceCommand(
          `I want ${qty} sleep gummies`,
          TEST_CUSTOMER_ID
        );

        expect(result.success).toBe(true);
        expect(result.message).toContain(`${qty}x`);
      }
    });
  });

  describe('E2E Flow: Health Check', () => {
    it('should return health status', async () => {
      const health = await voiceEngine.healthCheck();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('claude_configured');
      expect(health).toHaveProperty('lightspeed_connected');
      expect(health).toHaveProperty('bigquery_connected');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
    });
  });
});
