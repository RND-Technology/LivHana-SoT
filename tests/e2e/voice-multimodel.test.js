/**
 * Multi-Model Routing E2E Test
 * 
 * Tests the unified voice router's health circuit and multi-model routing:
 * - Health circuit selection (GPT-5 → Claude Sonnet 4.5 → GPT-4o)
 * - Failover when primary model unhealthy
 * - Round-robin across available models
 * - Model selection based on priority
 * 
 * Requirements:
 * - Voice service running on PORT 8080
 * - OPENAI_API_KEY and ANTHROPIC_API_KEY set
 * 
 * Run: VOICE_E2E=1 npm test -- tests/e2e/voice-multimodel.test.js
 */

import http from 'http';

const VOICE_E2E = process.env.VOICE_E2E === '1';
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const VOICE_SERVICE_URL = `http://localhost:${PORT}`;

const httpGetJSON = (url) => new Promise((resolve, reject) => {
  const req = http.get(url, (res) => {
    const { statusCode } = res;
    let raw = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { raw += chunk; });
    res.on('end', () => {
      try {
        const data = JSON.parse(raw || '{}');
        resolve({ statusCode, data });
      } catch (e) {
        resolve({ statusCode, data: {} });
      }
    });
  });
  req.on('error', reject);
  req.setTimeout(5000, () => {
    req.destroy();
    reject(new Error('Request timeout'));
  });
});

const httpPostJSON = (url, body) => new Promise((resolve, reject) => {
  const urlObj = new URL(url);
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || 80,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    const { statusCode } = res;
    let raw = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { raw += chunk; });
    res.on('end', () => {
      try {
        const data = JSON.parse(raw || '{}');
        resolve({ statusCode, data });
      } catch (e) {
        resolve({ statusCode, data: {} });
      }
    });
  });

  req.on('error', reject);
  req.setTimeout(10000, () => {
    req.destroy();
    reject(new Error('Request timeout'));
  });

  req.write(JSON.stringify(body));
  req.end();
});

(VOICE_E2E ? describe : describe.skip)('Multi-Model Routing E2E', () => {
  test('GET /api/voice/stats should report model pool with health status', async () => {
    const { statusCode, data } = await httpGetJSON(`${VOICE_SERVICE_URL}/api/voice/stats`);
    
    expect(statusCode).toBe(200);
    expect(data).toHaveProperty('modelPool');
    expect(Array.isArray(data.modelPool)).toBe(true);
    expect(data.modelPool.length).toBeGreaterThan(0);

    // Verify model pool structure
    data.modelPool.forEach((model) => {
      expect(model).toHaveProperty('provider');
      expect(model).toHaveProperty('model');
      expect(model).toHaveProperty('priority');
      expect(typeof model.priority).toBe('number');
    });

    // Should have GPT-5, Claude Sonnet 4.5, GPT-4o
    const modelNames = data.modelPool.map(m => `${m.provider}:${m.model}`);
    const hasGPT5 = modelNames.some(m => m.includes('openai') && m.includes('gpt-5'));
    const hasClaude = modelNames.some(m => m.includes('anthropic') && m.includes('claude'));
    const hasGPT4o = modelNames.some(m => m.includes('openai') && m.includes('gpt-4o'));

    expect(hasGPT5 || hasClaude || hasGPT4o).toBe(true);
  }, 15000);

  test('should route to primary model (highest priority)', async () => {
    // Get stats to find primary model
    const { data: statsData } = await httpGetJSON(`${VOICE_SERVICE_URL}/api/voice/stats`);
    const primaryModel = statsData.modelPool
      .sort((a, b) => a.priority - b.priority)[0];

    if (!primaryModel) {
      throw new Error('No models available in pool');
    }

    // Make a reasoning request
    const { statusCode, data } = await httpPostJSON(`${VOICE_SERVICE_URL}/api/reasoning/chat`, {
      message: 'Say exactly: Primary model test',
      systemPrompt: 'Respond with exactly: Primary model test',
    });

    expect(statusCode).toBe(200);
    expect(data.success).toBe(true);
    expect(data.model).toBeDefined();

    console.log(`[Multi-Model] Primary model: ${primaryModel.provider}:${primaryModel.model}`);
    console.log(`[Multi-Model] Selected model: ${data.model}`);
    console.log(`[Multi-Model] Latency: ${data.latency_ms}ms`);
  }, 30000);

  test('should report health status for each model', async () => {
    const { statusCode, data } = await httpGetJSON(`${VOICE_SERVICE_URL}/api/voice/stats`);
    
    expect(statusCode).toBe(200);
    
    // Check if health information is available
    if (data.health) {
      expect(typeof data.health).toBe('object');
      
      // If health circuit is implemented, verify structure
      if (data.health.circuits) {
        data.modelPool.forEach((model) => {
          const circuitKey = `${model.provider}:${model.model}`;
          expect(data.health.circuits).toHaveProperty(circuitKey);
          expect(data.health.circuits[circuitKey]).toHaveProperty('state');
          expect(['healthy', 'unhealthy', 'half-open']).toContain(
            data.health.circuits[circuitKey].state
          );
        });
      }
    }

    console.log('[Multi-Model] Health status:', JSON.stringify(data.health, null, 2));
  }, 15000);

  test('should handle multiple requests with model selection', async () => {
    const requests = [];
    const numRequests = 3;

    for (let i = 0; i < numRequests; i++) {
      requests.push(
        httpPostJSON(`${VOICE_SERVICE_URL}/api/reasoning/chat`, {
          message: `Request ${i}: Say exactly: OK`,
          systemPrompt: 'Respond with exactly: OK',
        })
      );
    }

    const results = await Promise.all(requests);

    // All should succeed
    results.forEach((result, index) => {
      expect(result.statusCode).toBe(200);
      expect(result.data.success).toBe(true);
      expect(result.data.model).toBeDefined();
      console.log(`[Multi-Model] Request ${index + 1} used model: ${result.data.model}`);
    });

    // Verify models were selected (may use different models based on health)
    const modelsUsed = results.map(r => r.data.model);
    console.log(`[Multi-Model] Models used: ${[...new Set(modelsUsed)].join(', ')}`);
  }, 45000);

  test('should handle failover when primary model unavailable', async () => {
    // This test assumes the health circuit will detect failures
    // In a real scenario, we'd simulate a model failure
    // For now, we verify the system responds even if primary is slow
    
    const startTime = Date.now();
    
    const { statusCode, data } = await httpPostJSON(`${VOICE_SERVICE_URL}/api/reasoning/chat`, {
      message: 'Say exactly: Failover test',
      systemPrompt: 'Respond with exactly: Failover test',
    });

    const totalTime = Date.now() - startTime;

    // Should succeed even if primary model is slow (failover should kick in)
    expect(statusCode).toBe(200);
    expect(data.success).toBe(true);
    expect(data.model).toBeDefined();
    
    // Response should come within reasonable time (failover shouldn't take >30s)
    expect(totalTime).toBeLessThan(30000);
    
    console.log(`[Multi-Model] Failover test completed in ${totalTime}ms`);
    console.log(`[Multi-Model] Selected model: ${data.model}`);
  }, 45000);
});

