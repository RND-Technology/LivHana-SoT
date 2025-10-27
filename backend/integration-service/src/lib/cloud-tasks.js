import { createLogger } from '../../common/logging/index.js';

const logger = createLogger('cloud-tasks');

export class CloudTasksClient {
  constructor() {
    if (!process.env.GOOGLE_CLOUD_PROJECT) {
      throw new Error('GOOGLE_CLOUD_PROJECT environment variable is required');
    }
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    this.location = process.env.CLOUD_TASKS_LOCATION || 'us-central1';
  }

  async createTask(queueName, payload, delaySeconds = 0) {
    logger.info(`Creating task in queue ${queueName}`, { payload, delaySeconds });
    
    // Mock implementation - in production this would use Google Cloud Tasks API
    return {
      success: true,
      taskId: `task-${Date.now()}`,
      queueName,
      scheduledTime: new Date(Date.now() + delaySeconds * 1000).toISOString()
    };
  }

  async scheduleEmailTask(email, subject, delaySeconds = 0) {
    return this.createTask('email-queue', {
      type: 'send-email',
      email,
      subject
    }, delaySeconds);
  }

  async scheduleRefundTask(orderId, amount, delaySeconds = 0) {
    return this.createTask('refund-queue', {
      type: 'process-refund',
      orderId,
      amount
    }, delaySeconds);
  }
}

export function getCloudTasksClient() {
  return new CloudTasksClient();
}
