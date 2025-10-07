import express from 'express';
import { createQueue, createQueueEvents, enqueueJob, getJobStatus } from '../../../common/queue/index.js';

const router = express.Router();

// Queue configuration
const REASONING_QUEUE_NAME = process.env.REASONING_QUEUE_NAME || 'voice-mode-reasoning-jobs';
const REASONING_GATEWAY_BASE_URL = process.env.REASONING_GATEWAY_BASE_URL || 'http://localhost:4002/api/reasoning';

// Initialize queue and queue events
const reasoningQueue = createQueue(REASONING_QUEUE_NAME);
const reasoningQueueEvents = createQueueEvents(REASONING_QUEUE_NAME);

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

    const status = await getJobStatus(reasoningQueue, jobId);

    if (!status.found) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

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
