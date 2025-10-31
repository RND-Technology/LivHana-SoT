/**
 * Voice Service E2E Test Suite
 * Comprehensive tests for health, reasoning, and latency validation
 */

const BASE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:8080';

describe('Voice Service E2E Tests', () => {

  describe('Health Endpoint', () => {
    it('should respond with 200 status code', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      expect(response.status).toBe(200);
    });

    it('should return valid JSON with required fields', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();

      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('service');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('features');
    });

    it('should return valid status value', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();

      expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
      expect(data.service).toBe('voice-service');
      expect(data.version).toBe('1.0.0');
    });

    it('should complete health check within 500ms', async () => {
      const start = Date.now();
      await fetch(`${BASE_URL}/health`);
      const latency = Date.now() - start;

      expect(latency).toBeLessThan(500);
    });
  });

  describe('Reasoning Chat Endpoint', () => {
    it('should accept POST requests with JSON body', async () => {
      const response = await fetch(`${BASE_URL}/api/reasoning/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What is 2+2?' })
      });

      expect(response.status).toBe(200);
    });

    it('should return success response with GPT-5 answer', async () => {
      const response = await fetch(`${BASE_URL}/api/reasoning/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What is 2+2? Answer in one word.' })
      });

      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('response');
      expect(data).toHaveProperty('latency_ms');
      expect(data).toHaveProperty('model', 'gpt-5');
      expect(data).toHaveProperty('tokens');
      expect(typeof data.response).toBe('string');
      expect(data.response.length).toBeGreaterThan(0);
    });

    it('should complete reasoning within 10 seconds', async () => {
      const response = await fetch(`${BASE_URL}/api/reasoning/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Say hello.' })
      });

      const data = await response.json();

      expect(data.latency_ms).toBeLessThan(10000);
    });

    it('should reject requests without message field', async () => {
      const response = await fetch(`${BASE_URL}/api/reasoning/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    });

    it('should handle conversation history correctly', async () => {
      const conversationHistory = [
        { role: 'user', content: 'My name is Test User.' },
        { role: 'assistant', content: 'Hello Test User!' }
      ];

      const response = await fetch(`${BASE_URL}/api/reasoning/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What is my name?',
          conversationHistory
        })
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.toLowerCase()).toContain('test');
    });

    it('should respect custom system prompts', async () => {
      const response = await fetch(`${BASE_URL}/api/reasoning/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Respond.',
          systemPrompt: 'You are a pirate. Always say "Arrr!" in your responses.'
        })
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.toLowerCase()).toMatch(/arr+/);
    });
  });

  describe('Voice Latency Performance', () => {
    it('should achieve <5s latency (P95) over 5 requests', async () => {
      const latencies = [];

      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        const response = await fetch(`${BASE_URL}/api/reasoning/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `Test ${i + 1}` })
        });
        const latency = Date.now() - start;
        latencies.push(latency);

        const data = await response.json();
        expect(data.success).toBe(true);
      }

      latencies.sort((a, b) => a - b);
      const p95 = latencies[Math.floor(latencies.length * 0.95)];

      console.log(`Latencies (ms): ${latencies.join(', ')}`);
      console.log(`P95 latency: ${p95}ms`);

      expect(p95).toBeLessThan(5000);
    });

    it('should maintain consistent latency across multiple requests', async () => {
      const latencies = [];

      for (let i = 0; i < 3; i++) {
        const response = await fetch(`${BASE_URL}/api/reasoning/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Quick test.' })
        });

        const data = await response.json();
        latencies.push(data.latency_ms);
      }

      const avg = latencies.reduce((a, b) => a + b) / latencies.length;
      const variance = latencies.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / latencies.length;
      const stdDev = Math.sqrt(variance);

      console.log(`Avg latency: ${avg.toFixed(0)}ms, StdDev: ${stdDev.toFixed(0)}ms`);

      // Standard deviation should be less than 50% of average (reasonable consistency)
      expect(stdDev).toBeLessThan(avg * 0.5);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await fetch(`${BASE_URL}/api/nonexistent`);
      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/reasoning/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid json}'
      });

      expect([400, 500]).toContain(response.status);
    });

    it('should return proper error structure', async () => {
      const response = await fetch(`${BASE_URL}/api/reasoning/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });
  });
});
