import { Router } from 'express';

const queueStatsSafe = async (queue) => {
  if (!queue) {
    return { error: 'Queue not configured' };
  }

  try {
    const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed');
    return counts;
  } catch (error) {
    return { error: error.message };
  }
};

const deriveStatus = (counts) => {
  if (!counts) {
    return { queueDepth: 0, voiceStatus: 'unknown', reasoningStatus: 'unknown' };
  }

  const queueDepth = counts.waiting ?? 0;
  const hasFailures = (counts.failed ?? 0) > 0;
  const voiceStatus = hasFailures ? 'degraded' : 'healthy';
  const reasoningStatus = hasFailures ? 'degraded' : 'healthy';

  return { queueDepth, voiceStatus, reasoningStatus };
};

export const createHealthRouter = ({ logger, queue }) => {
  const router = Router();

  // Simple health check endpoint
  router.get('/', async (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'voice-service',
      elevenlabs: 'ready'
    });
  });

  router.get('/voice-mode', async (_req, res) => {
    try {
      const counts = await queueStatsSafe(queue);
      if (counts.error) {
        logger.error({ error: counts.error }, 'Failed to fetch queue stats');
        return res.status(500).json({ error: counts.error });
      }

      const health = deriveStatus(counts);

      res.status(200).json({
        status: 'ok',
        ...health,
        counts,
      });
    } catch (error) {
      logger.error({ error: error.message }, 'Health endpoint error');
      res.status(500).json({ error: 'Voice mode health check failed' });
    }
  });

  return router;
};
