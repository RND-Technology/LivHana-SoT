import { Queue, QueueEvents, Job, JobsOptions } from 'bullmq';

export function createQueue(queueName: string, connection?: any): Queue;
export function enqueueJob(
  queue: Queue,
  jobName: string,
  data: any,
  opts?: JobsOptions
): Promise<Job>;
export function createQueueEvents(queueName: string, connection?: any): QueueEvents;
