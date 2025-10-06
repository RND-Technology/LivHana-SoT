import { createMockRedisJob, createMockRedisQueue, type MockRedisJob } from './redis.js';

type CreateSSEPayloadOptions = {
  job?: MockRedisJob;
};

export const createReasoningSSEPayload = ({ job = createMockRedisJob() }: CreateSSEPayloadOptions = {}) => {
  const queue = createMockRedisQueue([job]);
  const deltas = queue.getJobDeltas(job.id);
  const result = queue.getJobResult(job.id);

  const lines: string[] = [];

  deltas.forEach((delta) => {
    lines.push('event: progress');
    lines.push(`data: ${JSON.stringify({ delta })}`);
    lines.push('');
  });

  lines.push('event: completed');
  lines.push(`data: ${JSON.stringify({ output: result?.final ?? '' })}`);
  lines.push('');

  return lines.join('\n');
};

// Optimized: 2025-10-02

// Last optimized: 2025-10-02
