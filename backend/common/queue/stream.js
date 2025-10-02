import { withRequestContext } from '../logging/context.js';

export const formatSSEEvent = (event, data) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

export const streamJobEvents = ({ res, queueEvents, jobId, logger, requestId }) => {
  const contextLogger = withRequestContext(logger, requestId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event, data) => {
    res.write(formatSSEEvent(event, data));
  };

  const cleanup = () => {
    queueEvents.removeListener('completed', handleCompleted);
    queueEvents.removeListener('failed', handleFailed);
    queueEvents.removeListener('progress', handleProgress);
  };

  const handleCompleted = ({ jobId: completedJobId, returnvalue }) => {
    if (completedJobId !== jobId) return;
    sendEvent('completed', returnvalue);
    cleanup();
    res.end();
    contextLogger?.info?.({ jobId }, 'Job stream completed');
  };

  const handleFailed = ({ jobId: failedJobId, failedReason }) => {
    if (failedJobId !== jobId) return;
    sendEvent('failed', { error: failedReason });
    cleanup();
    res.end();
    contextLogger?.error?.({ jobId, failedReason }, 'Job stream failed');
  };

  const handleProgress = ({ jobId: progressJobId, data }) => {
    if (progressJobId !== jobId) return;
    sendEvent('progress', data ?? {});
  };

  queueEvents.on('completed', handleCompleted);
  queueEvents.on('failed', handleFailed);
  queueEvents.on('progress', handleProgress);

  return cleanup;
};

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
