// Unit tests for Voice Commerce Engine

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { VoiceCommerceEngine } from '../src/voice-commerce';

process.env.ANTHROPIC_API_KEY = 'test-key';
process.env.LIGHTSPEED_TOKEN = 'test-token';
process.env.GCP_PROJECT_ID = 'test-project';
process.env.NODE_ENV = 'test';

jest.mock('@anthropic-ai/sdk');
jest.mock('axios');
jest.mock('@google-cloud/bigquery');

describe('VoiceCommerceEngine', () => {
  let engine: VoiceCommerceEngine;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should throw error if ANTHROPIC_API_KEY missing', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => new VoiceCommerceEngine()).toThrow('ANTHROPIC_API_KEY');
      process.env.ANTHROPIC_API_KEY = 'test-key';
    });

    it('should throw error if LIGHTSPEED_TOKEN missing', () => {
      delete process.env.LIGHTSPEED_TOKEN;
      expect(() => new VoiceCommerceEngine()).toThrow('LIGHTSPEED_TOKEN');
      process.env.LIGHTSPEED_TOKEN = 'test-token';
    });

    it('should initialize successfully', () => {
      engine = new VoiceCommerceEngine();
      expect(engine).toBeInstanceOf(VoiceCommerceEngine);
    });
  });

  describe('processVoiceCommand', () => {
    beforeEach(() => {
      engine = new VoiceCommerceEngine();
    });

    it('should reject empty transcript', async () => {
      const result = await engine.processVoiceCommand('', '12345');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Empty transcript');
    });

    it('should reject empty customerId', async () => {
      const result = await engine.processVoiceCommand('test', '');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Customer ID required');
    });

    it('should extract intent from transcript', async () => {
      const result = await engine.processVoiceCommand('I need more sleep gummies', '12345');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('confidence');
    });

    it('should handle reorder intent', async () => {
      // Mock Claude response for reorder intent
      const AnthropicMock = require('@anthropic-ai/sdk');
      AnthropicMock.Anthropic().messages.create.mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            intent: 'reorder',
            product: 'sleep gummies',
            quantity: 1,
            confidence: 0.95
          })
        }]
      });

      const result = await engine.processVoiceCommand('I need more sleep gummies', '12345');

      expect(result.intent).toBe('reorder');
    });

    it('should handle question intent', async () => {
      const result = await engine.processVoiceCommand('What is my order status?', '12345');

      expect(result.intent).toBe('question');
      expect(result.success).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      // Mock error
      const AnthropicMock = require('@anthropic-ai/sdk');
      AnthropicMock.Anthropic().messages.create.mockRejectedValue(new Error('API Error'));

      const result = await engine.processVoiceCommand('test', '12345');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to process');
    });
  });

  describe('healthCheck', () => {
    beforeEach(() => {
      engine = new VoiceCommerceEngine();
    });

    it('should return health status', async () => {
      const health = await engine.healthCheck();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('claude_configured');
      expect(health).toHaveProperty('lightspeed_connected');
      expect(health).toHaveProperty('bigquery_connected');
    });

    it('should report healthy when all services connected', async () => {
      const health = await engine.healthCheck();

      expect(health.claude_configured).toBe(true);
    });
  });
});
