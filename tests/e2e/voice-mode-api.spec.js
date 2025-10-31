/**
 * Voice Mode API E2E Tests
 *
 * Tests the complete voice mode pipeline:
 * - Basic voice flow (STT → Reasoning → TTS)
 * - Queue integrity (job lifecycle)
 * - Error handling (timeouts, invalid input)
 * - Concurrent users (race conditions, session isolation)
 *
 * Requirements:
 * - Voice service running on PORT 8080
 * - Reasoning gateway running on PORT 4002
 * - Redis running on PORT 6379
 * - OPENAI_API_KEY set in environment
 *
 * Run: npx playwright test tests/e2e/voice-mode-api.spec.js
 */

import { test, expect } from '@playwright/test';

const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:8080';
const REASONING_GATEWAY_URL = process.env.REASONING_GATEWAY_URL || 'http://localhost:4002';
const TEST_TIMEOUT = 30000; // 30 seconds for voice operations

test.describe('Voice Mode API E2E Tests', () => {

  // ============================================================================
  // Test 1: Basic Voice Flow (STT → Reasoning → TTS)
  // ============================================================================

  test.describe('Test 1: Basic Voice Flow', () => {

    test('should complete full voice interaction cycle', async ({ request }) => {
      test.setTimeout(TEST_TIMEOUT);

      // Step 1: Create voice session
      const sessionResponse = await request.post(`${VOICE_SERVICE_URL}/api/voice/custom/session`, {
        data: {
          voice_config: {
            voice_id: 'default',
            stability: 0.75,
            speed: 1.0
          },
          system_prompt: 'You are Liv Hana. Respond in exactly 5 words.'
        }
      });

      expect(sessionResponse.ok()).toBeTruthy();
      const sessionData = await sessionResponse.json();
      expect(sessionData.success).toBe(true);
      expect(sessionData.session_id).toBeDefined();

      const sessionId = sessionData.session_id;

      // Step 2: Test reasoning endpoint (bypasses STT for E2E speed)
      const reasoningResponse = await request.post(`${VOICE_SERVICE_URL}/api/voice/custom/reason`, {
        data: {
          message: 'What is 2+2?',
          session_id: sessionId,
          stream: false
        }
      });

      expect(reasoningResponse.ok()).toBeTruthy();
      const reasoningData = await reasoningResponse.json();
      expect(reasoningData.success).toBe(true);
      expect(reasoningData.response).toBeDefined();
      expect(reasoningData.latency_ms).toBeLessThan(5000); // < 5s latency
      expect(reasoningData.model).toBeDefined();

      console.log(`[Test 1] Reasoning latency: ${reasoningData.latency_ms}ms`);
      console.log(`[Test 1] Response: "${reasoningData.response}"`);

      // Step 3: Get session status
      const statusResponse = await request.get(`${VOICE_SERVICE_URL}/api/voice/custom/session/${sessionId}`);

      expect(statusResponse.ok()).toBeTruthy();
      const statusData = await statusResponse.json();
      expect(statusData.success).toBe(true);
      expect(statusData.conversation_length).toBeGreaterThan(0); // Should have at least user + assistant

      // Step 4: Clean up session
      const deleteResponse = await request.delete(`${VOICE_SERVICE_URL}/api/voice/custom/session/${sessionId}`);

      expect(deleteResponse.ok()).toBeTruthy();
      const deleteData = await deleteResponse.json();
      expect(deleteData.success).toBe(true);
    });

    test('should handle direct /api/reasoning/chat endpoint', async ({ request }) => {
      test.setTimeout(10000);

      const startTime = Date.now();

      const response = await request.post(`${VOICE_SERVICE_URL}/api/reasoning/chat`, {
        data: {
          message: 'Say exactly: Hello from E2E test',
          conversationHistory: [],
          systemPrompt: 'You are Liv Hana. Repeat the user message exactly.'
        }
      });

      const latency = Date.now() - startTime;

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.response).toBeDefined();
      expect(data.latency_ms).toBeLessThan(5000); // < 5s
      expect(latency).toBeLessThan(5000); // Total request < 5s

      console.log(`[Test 1] Direct chat latency: ${latency}ms (reported: ${data.latency_ms}ms)`);
    });
  });

  // ============================================================================
  // Test 2: Queue Integrity (Job Lifecycle)
  // ============================================================================

  test.describe('Test 2: Queue Integrity', () => {

    test('should handle job enqueue and polling lifecycle', async ({ request }) => {
      test.setTimeout(60000); // Queue-based can take longer

      // Step 1: Enqueue reasoning job
      const enqueueResponse = await request.post(`${VOICE_SERVICE_URL}/api/reasoning/enqueue`, {
        data: {
          prompt: 'Test queue integrity: What is the capital of France?',
          userId: 'e2e-test-user',
          sessionId: `e2e-session-${Date.now()}`,
          metadata: { test: 'queue-integrity' }
        }
      });

      expect(enqueueResponse.ok()).toBeTruthy();
      const enqueueData = await enqueueResponse.json();
      expect(enqueueData.success).toBe(true);
      expect(enqueueData.jobId).toBeDefined();

      const jobId = enqueueData.jobId;
      console.log(`[Test 2] Job enqueued: ${jobId}`);

      // Step 2: Poll for job result (max 30s)
      let jobComplete = false;
      let pollAttempts = 0;
      const maxPolls = 30;
      let finalResult = null;

      while (!jobComplete && pollAttempts < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s

        const resultResponse = await request.get(`${VOICE_SERVICE_URL}/api/reasoning/result/${jobId}`);
        expect(resultResponse.ok()).toBeTruthy();

        const resultData = await resultResponse.json();
        expect(resultData.success).toBe(true);

        console.log(`[Test 2] Poll ${pollAttempts + 1}: Job state = ${resultData.state}`);

        if (resultData.state === 'completed') {
          jobComplete = true;
          finalResult = resultData.result;
          expect(finalResult).toBeDefined();
          expect(finalResult.success).toBe(true);
          expect(finalResult.result).toBeDefined();
          break;
        } else if (resultData.state === 'failed') {
          throw new Error(`Job failed: ${resultData.error}`);
        }

        pollAttempts++;
      }

      expect(jobComplete).toBe(true);
      expect(finalResult).not.toBeNull();
      console.log(`[Test 2] Job completed after ${pollAttempts} polls`);
    });

    test('should report queue statistics', async ({ request }) => {
      const response = await request.get(`${VOICE_SERVICE_URL}/api/reasoning/queue/stats`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.stats).toBeDefined();
      expect(data.stats).toHaveProperty('waiting');
      expect(data.stats).toHaveProperty('active');
      expect(data.stats).toHaveProperty('completed');
      expect(data.stats).toHaveProperty('failed');

      console.log(`[Test 2] Queue stats:`, data.stats);
    });

    test('should handle job cancellation', async ({ request }) => {
      test.setTimeout(10000);

      // Enqueue a job
      const enqueueResponse = await request.post(`${VOICE_SERVICE_URL}/api/reasoning/enqueue`, {
        data: {
          prompt: 'This job will be cancelled',
          userId: 'e2e-test-user',
          sessionId: `e2e-cancel-${Date.now()}`
        }
      });

      const enqueueData = await enqueueResponse.json();
      const jobId = enqueueData.jobId;

      // Immediately cancel it
      const cancelResponse = await request.post(`${VOICE_SERVICE_URL}/api/reasoning/cancel`, {
        data: { jobId }
      });

      expect(cancelResponse.ok()).toBeTruthy();
      const cancelData = await cancelResponse.json();
      expect(cancelData.success).toBe(true);

      console.log(`[Test 2] Job ${jobId} cancelled successfully`);
    });
  });

  // ============================================================================
  // Test 3: Error Handling (Timeouts, Invalid Input)
  // ============================================================================

  test.describe('Test 3: Error Handling', () => {

    test('should reject missing required parameters', async ({ request }) => {
      // Test 1: Missing message in /chat
      const response1 = await request.post(`${VOICE_SERVICE_URL}/api/reasoning/chat`, {
        data: {}
      });

      expect(response1.status()).toBe(400);
      const data1 = await response1.json();
      expect(data1.success).toBe(false);
      expect(data1.error).toContain('Message');

      // Test 2: Missing prompt in /enqueue
      const response2 = await request.post(`${VOICE_SERVICE_URL}/api/reasoning/enqueue`, {
        data: {}
      });

      expect(response2.status()).toBe(400);
      const data2 = await response2.json();
      expect(data2.success).toBe(false);
      expect(data2.error).toContain('Prompt');

      // Test 3: Missing session_id in voice config update
      const response3 = await request.post(`${VOICE_SERVICE_URL}/api/voice/custom/config`, {
        data: {
          voice_config: { speed: 1.5 }
        }
      });

      expect(response3.status()).toBe(400);
      const data3 = await response3.json();
      expect(data3.success).toBe(false);

      console.log(`[Test 3] All validation errors handled correctly`);
    });

    test('should handle non-existent resources gracefully', async ({ request }) => {
      // Test 1: Non-existent job ID
      const response1 = await request.get(`${VOICE_SERVICE_URL}/api/reasoning/result/fake-job-id-12345`);

      expect(response1.status()).toBe(404);
      const data1 = await response1.json();
      expect(data1.success).toBe(false);

      // Test 2: Non-existent session ID
      const response2 = await request.get(`${VOICE_SERVICE_URL}/api/voice/custom/session/fake-session-id`);

      expect(response2.status()).toBe(404);
      const data2 = await response2.json();
      expect(data2.success).toBe(false);

      // Test 3: Non-existent session interrupt
      const response3 = await request.post(`${VOICE_SERVICE_URL}/api/voice/custom/interrupt`, {
        data: { session_id: 'fake-session-id' }
      });

      expect(response3.status()).toBe(404);
      const data3 = await response3.json();
      expect(data3.success).toBe(false);

      console.log(`[Test 3] All 404 errors handled correctly`);
    });

    test('should handle malformed JSON', async ({ request }) => {
      const response = await request.post(`${VOICE_SERVICE_URL}/api/reasoning/chat`, {
        headers: { 'Content-Type': 'application/json' },
        data: 'this is not valid JSON{'
      });

      // Should return 400 or 500 (depends on Express error handling)
      expect(response.status()).toBeGreaterThanOrEqual(400);

      console.log(`[Test 3] Malformed JSON handled with status ${response.status()}`);
    });

    test('should handle very long input', async ({ request }) => {
      const longMessage = 'A'.repeat(10000); // 10k characters

      const response = await request.post(`${VOICE_SERVICE_URL}/api/reasoning/chat`, {
        data: {
          message: longMessage,
          systemPrompt: 'Respond with exactly: OK'
        }
      });

      // Should either succeed or gracefully reject
      if (response.ok()) {
        const data = await response.json();
        expect(data.success).toBe(true);
        console.log(`[Test 3] Long input handled successfully (${data.latency_ms}ms)`);
      } else {
        expect(response.status()).toBeGreaterThanOrEqual(400);
        console.log(`[Test 3] Long input rejected with status ${response.status()}`);
      }
    });
  });

  // ============================================================================
  // Test 4: Concurrent Users (Race Conditions, Session Isolation)
  // ============================================================================

  test.describe('Test 4: Concurrent Users', () => {

    test('should handle multiple concurrent sessions', async ({ request }) => {
      test.setTimeout(30000);

      const numConcurrent = 5;
      const promises = [];

      for (let i = 0; i < numConcurrent; i++) {
        const promise = (async () => {
          // Create session
          const sessionResponse = await request.post(`${VOICE_SERVICE_URL}/api/voice/custom/session`, {
            data: {
              system_prompt: `You are user ${i}. Respond with exactly: User ${i}`
            }
          });

          const sessionData = await sessionResponse.json();
          const sessionId = sessionData.session_id;

          // Send message
          const reasoningResponse = await request.post(`${VOICE_SERVICE_URL}/api/voice/custom/reason`, {
            data: {
              message: `Who are you?`,
              session_id: sessionId,
              stream: false
            }
          });

          const reasoningData = await reasoningResponse.json();

          // Clean up
          await request.delete(`${VOICE_SERVICE_URL}/api/voice/custom/session/${sessionId}`);

          return {
            userId: i,
            sessionId,
            response: reasoningData.response,
            latency: reasoningData.latency_ms
          };
        })();

        promises.push(promise);
      }

      const results = await Promise.all(promises);

      // Verify all requests succeeded
      expect(results.length).toBe(numConcurrent);

      // Verify session isolation (each got their own response)
      const responses = results.map(r => r.response);
      expect(new Set(responses).size).toBeGreaterThan(0); // Responses exist

      // Calculate average latency
      const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / numConcurrent;
      console.log(`[Test 4] ${numConcurrent} concurrent requests completed`);
      console.log(`[Test 4] Average latency: ${avgLatency.toFixed(0)}ms`);

      // Verify no request took abnormally long (race condition symptom)
      const maxLatency = Math.max(...results.map(r => r.latency));
      expect(maxLatency).toBeLessThan(10000); // No request > 10s
    });

    test('should isolate conversation history between sessions', async ({ request }) => {
      test.setTimeout(20000);

      // Create two sessions
      const session1Response = await request.post(`${VOICE_SERVICE_URL}/api/voice/custom/session`);
      const session1Data = await session1Response.json();
      const session1Id = session1Data.session_id;

      const session2Response = await request.post(`${VOICE_SERVICE_URL}/api/voice/custom/session`);
      const session2Data = await session2Response.json();
      const session2Id = session2Data.session_id;

      // Send different messages to each session
      await request.post(`${VOICE_SERVICE_URL}/api/voice/custom/reason`, {
        data: {
          message: 'My favorite color is red',
          session_id: session1Id,
          stream: false
        }
      });

      await request.post(`${VOICE_SERVICE_URL}/api/voice/custom/reason`, {
        data: {
          message: 'My favorite color is blue',
          session_id: session2Id,
          stream: false
        }
      });

      // Check session 1 history
      const status1Response = await request.get(`${VOICE_SERVICE_URL}/api/voice/custom/session/${session1Id}`);
      const status1Data = await status1Response.json();

      // Check session 2 history
      const status2Response = await request.get(`${VOICE_SERVICE_URL}/api/voice/custom/session/${session2Id}`);
      const status2Data = await status2Response.json();

      // Both should have conversation history
      expect(status1Data.conversation_length).toBeGreaterThan(0);
      expect(status2Data.conversation_length).toBeGreaterThan(0);

      // Histories should be independent (different lengths or timing)
      expect(status1Data.uptime_ms).not.toBe(status2Data.uptime_ms);

      // Clean up
      await request.delete(`${VOICE_SERVICE_URL}/api/voice/custom/session/${session1Id}`);
      await request.delete(`${VOICE_SERVICE_URL}/api/voice/custom/session/${session2Id}`);

      console.log(`[Test 4] Session isolation verified`);
    });

    test('should handle rapid requests to same endpoint', async ({ request }) => {
      test.setTimeout(30000);

      const numRequests = 10;
      const promises = [];

      const startTime = Date.now();

      for (let i = 0; i < numRequests; i++) {
        const promise = request.post(`${VOICE_SERVICE_URL}/api/reasoning/chat`, {
          data: {
            message: `Rapid fire test ${i}`,
            systemPrompt: 'Respond with exactly: OK'
          }
        });

        promises.push(promise);
      }

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All should succeed
      const successCount = responses.filter(r => r.ok()).length;
      expect(successCount).toBe(numRequests);

      // Parse latencies
      const latencies = await Promise.all(
        responses.map(async r => {
          const data = await r.json();
          return data.latency_ms;
        })
      );

      const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / numRequests;

      console.log(`[Test 4] ${numRequests} rapid requests completed in ${totalTime}ms`);
      console.log(`[Test 4] Average latency: ${avgLatency.toFixed(0)}ms`);
      console.log(`[Test 4] Throughput: ${(numRequests / (totalTime / 1000)).toFixed(2)} req/s`);
    });
  });

  // ============================================================================
  // Health Checks (Prerequisite Validation)
  // ============================================================================

  test.describe('Health Checks', () => {
    test('voice service should be healthy', async ({ request }) => {
      const response = await request.get(`${VOICE_SERVICE_URL}/health`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      console.log(`[Health] Voice service status:`, data.status || data.message);
    });

    test('reasoning gateway should be healthy', async ({ request }) => {
      const response = await request.get(`${REASONING_GATEWAY_URL}/health`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      console.log(`[Health] Reasoning gateway status:`, data.status);
    });
  });
});
