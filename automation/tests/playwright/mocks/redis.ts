export type MockRedisJob = {
  id: string;
  state: 'completed' | 'failed' | 'waiting' | 'progress';
  result?: Record<string, unknown>;
  failedReason?: string;
  deltas?: string[];
};

export const createMockRedisJob = ({
  id = 'mock-job-id',
  state = 'completed',
  result = { final: 'Mock final response' },
  failedReason,
  deltas = ['Mock partial'],
}: Partial<MockRedisJob> = {}): MockRedisJob => ({
  id,
  state,
  result,
  failedReason,
  deltas,
});

export const createMockRedisQueue = (jobs: MockRedisJob[] = [createMockRedisJob()]) => {
  const jobById = new Map(jobs.map((job) => [job.id, job]));

  return {
    getJobState: (id: string) => jobById.get(id)?.state ?? 'waiting',
    getJobResult: (id: string) => jobById.get(id)?.result ?? null,
    getJobFailedReason: (id: string) => jobById.get(id)?.failedReason ?? null,
    getJobDeltas: (id: string) => jobById.get(id)?.deltas ?? [],
  };
};

// Optimized: 2025-10-02
