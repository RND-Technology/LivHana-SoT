/**
 * CLOUD TASKS INTEGRATION
 * 
 * Replaces in-memory timers with durable Cloud Tasks
 * Ensures 72-hour countdowns survive Cloud Run restarts
 */

import { createLogger } from '../../common/logging/index.js';
import { CloudTasksClient } from '@google-cloud/tasks';

const logger = createLogger('cloud-tasks');

class CloudTasksManager {
  constructor() {
    this.client = null;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'livhana-empire';
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    this.queueName = process.env.CLOUD_TASKS_QUEUE || 'verification-countdown';
    this.serviceUrl = process.env.SERVICE_URL || 'https://integration-service-980910443251.us-central1.run.app';
    this.isInitialized = false;
    this.safeMode = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    // In SAFE_MODE, skip Cloud Tasks initialization
    if (process.env.SAFE_MODE === 'true') {
      logger.warn('Cloud Tasks manager running in SAFE_MODE - tasks disabled');
      this.isInitialized = true;
      this.safeMode = true;
      return;
    }

    try {
      this.client = new CloudTasksClient();
      
      // Ensure queue exists
      await this.ensureQueueExists();
      
      this.isInitialized = true;
      logger.info('Cloud Tasks manager initialized', {
        projectId: this.projectId,
        location: this.location,
        queueName: this.queueName
      });

    } catch (error) {
      logger.error('Failed to initialize Cloud Tasks manager', { error: error.message });
      throw error;
    }
  }

  async ensureQueueExists() {
    const parent = this.client.locationPath(this.projectId, this.location);
    const queuePath = this.client.queuePath(this.projectId, this.location, this.queueName);

    try {
      // Try to get the queue
      await this.client.getQueue({ name: queuePath });
      logger.info('Cloud Tasks queue exists', { queueName: this.queueName });
    } catch (error) {
      if (error.code === 5) { // NOT_FOUND
        // Create the queue
        const queue = {
          name: queuePath,
          rateLimits: {
            maxDispatchesPerSecond: 10,
            maxBurstSize: 100
          },
          retryConfig: {
            maxAttempts: 5,
            maxRetryDuration: { seconds: 3600 }, // 1 hour
            minBackoff: { seconds: 10 },
            maxBackoff: { seconds: 300 },
            maxDoublings: 5
          }
        };

        await this.client.createQueue({ parent, queue });
        logger.info('Cloud Tasks queue created', { queueName: this.queueName });
      } else {
        throw error;
      }
    }
  }

  /**
   * Schedule a 72-hour countdown timer
   * @param {string} orderId - Order ID
   * @param {string} customerEmail - Customer email
   * @param {Object} orderData - Order data
   * @returns {string} Task name
   */
  async scheduleCountdownTimer(orderId, customerEmail, orderData) {
    await this.initialize();

    const deadline = new Date(Date.now() + (72 * 60 * 60 * 1000)); // 72 hours
    const taskName = `countdown-${orderId}-${Date.now()}`;

    const task = {
      name: this.client.taskPath(this.projectId, this.location, this.queueName, taskName),
      httpRequest: {
        httpMethod: 'POST',
        url: `${this.serviceUrl}/api/v1/post-purchase/check-expired`,
        headers: {
          'Content-Type': 'application/json',
          'X-Task-Type': 'countdown-timer',
          'X-Order-ID': orderId
        },
        body: Buffer.from(JSON.stringify({
          orderId,
          customerEmail,
          orderData,
          scheduledFor: deadline.toISOString(),
          taskType: 'countdown-timer'
        })).toString('base64')
      },
      scheduleTime: {
        seconds: Math.floor(deadline.getTime() / 1000)
      }
    };

    const [response] = await this.client.createTask({
      parent: this.client.queuePath(this.projectId, this.location, this.queueName),
      task
    });

    logger.info('Countdown timer scheduled', {
      orderId,
      taskName: response.name,
      deadline: deadline.toISOString(),
      hoursRemaining: 72
    });

    return response.name;
  }

  /**
   * Schedule a reminder email
   * @param {string} orderId - Order ID
   * @param {string} customerEmail - Customer email
   * @param {number} hoursFromNow - Hours from now to send reminder
   * @returns {string} Task name
   */
  async scheduleReminderEmail(orderId, customerEmail, hoursFromNow = 24) {
    await this.initialize();

    const deadline = new Date(Date.now() + (hoursFromNow * 60 * 60 * 1000));
    const taskName = `reminder-${orderId}-${Date.now()}`;

    const task = {
      name: this.client.taskPath(this.projectId, this.location, this.queueName, taskName),
      httpRequest: {
        httpMethod: 'POST',
        url: `${this.serviceUrl}/api/v1/post-purchase/send-reminder`,
        headers: {
          'Content-Type': 'application/json',
          'X-Task-Type': 'reminder-email',
          'X-Order-ID': orderId
        },
        body: Buffer.from(JSON.stringify({
          orderId,
          customerEmail,
          scheduledFor: deadline.toISOString(),
          taskType: 'reminder-email'
        })).toString('base64')
      },
      scheduleTime: {
        seconds: Math.floor(deadline.getTime() / 1000)
      }
    };

    const [response] = await this.client.createTask({
      parent: this.client.queuePath(this.projectId, this.location, this.queueName),
      task
    });

    logger.info('Reminder email scheduled', {
      orderId,
      taskName: response.name,
      deadline: deadline.toISOString(),
      hoursFromNow
    });

    return response.name;
  }

  /**
   * Cancel a scheduled task
   * @param {string} taskName - Full task name
   */
  async cancelTask(taskName) {
    await this.initialize();

    try {
      await this.client.deleteTask({ name: taskName });
      logger.info('Task cancelled', { taskName });
    } catch (error) {
      if (error.code === 5) { // NOT_FOUND
        logger.warn('Task not found for cancellation', { taskName });
      } else {
        logger.error('Failed to cancel task', { taskName, error: error.message });
        throw error;
      }
    }
  }

  /**
   * Get task status
   * @param {string} taskName - Full task name
   */
  async getTaskStatus(taskName) {
    await this.initialize();

    try {
      const [task] = await this.client.getTask({ name: taskName });
      return {
        name: task.name,
        scheduleTime: task.scheduleTime,
        createTime: task.createTime,
        status: task.status || 'SCHEDULED'
      };
    } catch (error) {
      if (error.code === 5) { // NOT_FOUND
        return { status: 'NOT_FOUND' };
      }
      throw error;
    }
  }

  /**
   * List active tasks in queue
   */
  async listActiveTasks() {
    await this.initialize();

    const parent = this.client.queuePath(this.projectId, this.location, this.queueName);
    const [tasks] = await this.client.listTasks({ parent });

    return tasks.map(task => ({
      name: task.name,
      scheduleTime: task.scheduleTime,
      createTime: task.createTime,
      status: task.status || 'SCHEDULED'
    }));
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.initialize();
      const tasks = await this.listActiveTasks();
      return { 
        healthy: true, 
        cloudTasks: 'connected',
        activeTasks: tasks.length
      };
    } catch (error) {
      logger.error('Cloud Tasks health check failed', { error: error.message });
      return { 
        healthy: false, 
        cloudTasks: 'disconnected', 
        error: error.message 
      };
    }
  }
}

// Singleton instance
const cloudTasks = new CloudTasksManager();

export default cloudTasks;
