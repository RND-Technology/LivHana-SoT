import express from 'express';
import { createQueue, createQueueEvents, enqueueJob, getJobStatus } from '../../../common/queue/index.js';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client for direct calls (bypass queue)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
});

// Queue configuration
const REASONING_QUEUE_NAME = process.env.REASONING_QUEUE_NAME || 'voice-mode-reasoning-jobs';

// Initialize queue and queue events
const reasoningQueue = createQueue(REASONING_QUEUE_NAME);
const reasoningQueueEvents = createQueueEvents(REASONING_QUEUE_NAME);

/**
 * POST /api/reasoning/chat
 * Direct synchronous chat endpoint (BYPASSES QUEUE)
 *
 * This endpoint provides <2s latency by:
 * 1. Bypassing BullMQ queue (eliminates 5-6s polling delay)
 * 2. Using GPT-4o-mini (1-2s vs 3-8s for Claude/DeepSeek)
 * 3. Direct HTTP call (no async overhead)
 *
 * Use this for voice mode where latency is critical.
 * Use /enqueue for background tasks where accuracy > speed.
 *
 * Body:
 * {
 *   message: string (required) - User's message
 *   conversationHistory: array (optional) - Previous messages
 *   systemPrompt: string (optional) - Custom system instructions
 * }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], systemPrompt } = req.body;
    const startTime = Date.now();

    console.log(`[reasoning-router][${new Date(startTime).toISOString()}] Direct /chat request: "${message?.substring(0, 50)}..."`);

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Build messages array
    const messages = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    } else {
      // Default system prompt for Liv Hana
      messages.push({
        role: 'system',
        content: 'You are Liv Hana, a sovereign intelligence assistant. Be concise, direct, and helpful. Prioritize speed and clarity in voice interactions.'
      });
    }

    // Add conversation history
    if (conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Call GPT-5 directly (NO QUEUE) - CUTTING EDGE
    const completion = await openai.chat.completions.create({
      model: 'gpt-5', // GPT-5 (Oct 2024 release)
      messages: messages,
      max_completion_tokens: 500 // GPT-5 uses max_completion_tokens not max_tokens
      // Note: GPT-5 only supports temperature=1 (default), no custom values
    });

    const responseText = completion.choices[0].message.content;
    const latency = Date.now() - startTime;

    console.log(`[reasoning-router][${new Date().toISOString()}] Response generated in ${latency}ms`);

    res.json({
      success: true,
      response: responseText,
      latency_ms: latency,
      model: 'gpt-5',
      tokens: completion.usage.total_tokens,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[reasoning-router] Direct chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/reasoning/enqueue
 * Enqueue a reasoning job to be processed by DeepSeek
 *
 * Body:
 * {
 *   prompt: string (required),
 *   userId: string (optional),
 *   sessionId: string (optional),
 *   metadata: object (optional)
 * }
 */
router.post('/enqueue', async (req, res) => {
  try {
    const { prompt, userId, sessionId, metadata } = req.body;
    const startTime = Date.now();
    console.log(`[voice-service][${new Date(startTime).toISOString()}] Received /enqueue request for prompt: "${prompt.substring(0, 50)}..."`);

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Enqueue job
    const job = await enqueueJob(
      reasoningQueue,
      'reasoning-task',
      {
        prompt,
        userId: userId || 'anonymous',
        sessionId: sessionId || `session-${Date.now()}`,
        metadata: metadata || {},
        enqueuedAt: new Date().toISOString()
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: {
          count: 100,
          age: 3600 // 1 hour
        }
      }
    );

    const enqueueTime = Date.now();
    console.log(`[voice-service][${new Date(enqueueTime).toISOString()}] Job ${job.id} enqueued. Total time in endpoint: ${enqueueTime - startTime}ms.`);

    res.json({
      success: true,
      jobId: job.id,
      message: 'Reasoning job enqueued successfully',
      queueName: REASONING_QUEUE_NAME,
      estimatedProcessingTime: '10-30 seconds'
    });

  } catch (error) {
    console.error('Reasoning enqueue error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reasoning/result/:jobId
 * Get the result of a reasoning job
 */
router.get('/result/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const pollTime = Date.now();
    console.log(`[voice-service][${new Date(pollTime).toISOString()}] Received /result polling for job ${jobId}`);

    const status = await getJobStatus(reasoningQueue, jobId);

    if (!status.found) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const resultTime = Date.now();
    console.log(`[voice-service][${new Date(resultTime).toISOString()}] Job ${jobId} status is ${status.state}. Total time in endpoint: ${resultTime - pollTime}ms.`);

    res.json({
      success: true,
      jobId: status.jobId,
      state: status.state,
      progress: status.progress,
      result: status.result,
      error: status.error,
      timestamp: status.timestamp,
      processedOn: status.processedOn,
      finishedOn: status.finishedOn
    });

  } catch (error) {
    console.error('Reasoning result error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reasoning/stream/:jobId
 * Stream reasoning job progress via Server-Sent Events (SSE)
 */
router.get('/stream/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connected', jobId })}\n\n`);

    // Listen to job progress events
    reasoningQueueEvents.on('progress', ({ jobId: eventJobId, data }) => {
      if (eventJobId === jobId) {
        res.write(`data: ${JSON.stringify({ type: 'progress', progress: data })}\n\n`);
      }
    });

    // Listen to job completed events
    reasoningQueueEvents.on('completed', ({ jobId: eventJobId, returnvalue }) => {
      if (eventJobId === jobId) {
        res.write(`data: ${JSON.stringify({ type: 'completed', result: returnvalue })}\n\n`);
        res.end();
      }
    });

    // Listen to job failed events
    reasoningQueueEvents.on('failed', ({ jobId: eventJobId, failedReason }) => {
      if (eventJobId === jobId) {
        res.write(`data: ${JSON.stringify({ type: 'failed', error: failedReason })}\n\n`);
        res.end();
      }
    });

    // Handle client disconnect
    req.on('close', () => {
      res.end();
    });

  } catch (error) {
    console.error('Reasoning stream error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/reasoning/cancel
 * Cancel a reasoning job
 *
 * Body:
 * {
 *   jobId: string (required)
 * }
 */
router.post('/cancel', async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Job ID is required'
      });
    }

    const job = await reasoningQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    await job.remove();

    res.json({
      success: true,
      message: 'Job cancelled successfully',
      jobId
    });

  } catch (error) {
    console.error('Reasoning cancel error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reasoning/queue/stats
 * Get reasoning queue statistics
 */
router.get('/queue/stats', async (req, res) => {
  try {
    const counts = await reasoningQueue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed'
    );

    res.json({
      success: true,
      queueName: REASONING_QUEUE_NAME,
      stats: {
        waiting: counts.waiting,
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
        total: Object.values(counts).reduce((sum, count) => sum + count, 0)
      }
    });

  } catch (error) {
    console.error('Reasoning stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
