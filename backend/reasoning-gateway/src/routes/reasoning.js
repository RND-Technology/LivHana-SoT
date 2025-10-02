import { Router } from 'express';
import { randomUUID } from 'crypto';
import { validateTextPayload } from '../../../common/validation/text.js';
import { withRequestContext } from '../../../common/logging/context.js';
import { streamJobEvents } from '../../../common/queue/stream.js';

export const createReasoningRouter = ({ logger, queue, queueEvents }) => {
  const router = Router();

  router.post('/enqueue', async (req, res) => {
    const { prompt, sessionId, metadata } = req.body ?? {};
    const validationError = validateTextPayload(prompt);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const jobId = randomUUID();

    try {
      await queue.add(
        'reasoning-task',
        { prompt, sessionId, metadata },
        {
          jobId,
          removeOnComplete: Number(process.env.REASONING_REMOVE_ON_COMPLETE ?? 100),
          removeOnFail: Number(process.env.REASONING_REMOVE_ON_FAIL ?? 1000),
          attempts: Number(process.env.REASONING_JOB_ATTEMPTS ?? 1),
          backoff: { type: 'exponential', delay: Number(process.env.REASONING_JOB_BACKOFF_MS ?? 5000) },
          timeout: Number(process.env.REASONING_JOB_TIMEOUT_MS ?? 120000),
        }
      );

      logger.info({ jobId, sessionId }, 'Reasoning job enqueued');
      res.status(202).json({ jobId });
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to enqueue reasoning job');
      res.status(500).json({ error: 'Failed to enqueue reasoning job' });
    }
  });

  router.get('/result/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);

    try {
      const job = await queue.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const state = await job.getState();
      if (state === 'completed') {
        const result = await job.returnvalue;
        contextLogger?.info?.({ jobId }, 'Reasoning job retrieved');
        return res.status(200).json({ status: 'completed', result });
      }

      if (state === 'failed') {
        contextLogger?.warn?.({ jobId }, 'Reasoning job failed when retrieving');
        return res.status(200).json({ status: 'failed', error: job.failedReason });
      }

      res.status(200).json({ status: state });
    } catch (error) {
      contextLogger?.error?.({ error: error.message }, 'Failed to retrieve reasoning job');
      res.status(500).json({ error: 'Failed to retrieve reasoning job' });
    }
  });

  router.get('/stream/:jobId', (req, res) => {
    const { jobId } = req.params;
    const cleanup = streamJobEvents({
      res,
      queueEvents,
      jobId,
      logger,
      requestId: req.headers['x-request-id'],
    });

    req.on('close', () => {
      cleanup();
    });
  });

  return router;
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
