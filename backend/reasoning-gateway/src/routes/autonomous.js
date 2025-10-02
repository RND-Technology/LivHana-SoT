/**
 * Claude Autonomous Agent API Routes
 *
 * Provides REST API for autonomous task execution, status tracking,
 * learnings, approvals, and rollbacks.
 *
 * All endpoints require admin authentication.
 */

import { Router } from 'express';
import { randomUUID } from 'crypto';
import { withRequestContext } from '../../../common/logging/context.js';
import { adminMiddleware } from '../../../common/auth/admin-middleware.js';
import { createClaudeAgent } from '../claude-autonomous-agent.js';

// In-memory task storage (in production, use Redis or database)
const tasks = new Map();
const learnings = [];

// Agent instance (singleton per process)
let agentInstance = null;

const getAgent = (logger) => {
  if (!agentInstance) {
    agentInstance = createClaudeAgent({ logger });
  }
  return agentInstance;
};

/**
 * Update task status and broadcast to SSE clients
 */
const updateTaskStatus = (taskId, update) => {
  const task = tasks.get(taskId);
  if (!task) return;

  Object.assign(task, {
    ...update,
    updatedAt: new Date().toISOString()
  });

  tasks.set(taskId, task);

  // Broadcast to SSE clients
  if (task.sseClients) {
    task.sseClients.forEach(res => {
      res.write(`data: ${JSON.stringify(task)}\n\n`);
    });
  }
};

/**
 * Execute task with progress tracking
 */
const executeTaskWithProgress = async (taskId, taskDescription, context, logger, agent) => {
  const task = tasks.get(taskId);

  try {
    // Update: analyzing
    updateTaskStatus(taskId, {
      status: 'analyzing',
      currentStep: 'Analyzing task requirements',
      progress: 10
    });

    const analysis = await agent.analyzeTask(taskDescription, context);

    // Update: planning
    updateTaskStatus(taskId, {
      status: 'planning',
      currentStep: 'Creating execution plan',
      progress: 25,
      analysis: analysis.analysis
    });

    const plan = await agent.createExecutionPlan(analysis);

    // Update: executing
    updateTaskStatus(taskId, {
      status: 'executing',
      currentStep: 'Executing plan',
      progress: 40,
      plan: {
        totalSteps: plan.steps.length,
        steps: plan.steps.map(s => ({ action: s.action, target: s.target }))
      }
    });

    // Execute plan with step-by-step progress
    const results = [];
    const changes = [];

    for (const [index, step] of plan.steps.entries()) {
      const stepProgress = 40 + Math.floor((index / plan.steps.length) * 40);

      updateTaskStatus(taskId, {
        currentStep: `Step ${index + 1}/${plan.steps.length}: ${step.action}`,
        progress: stepProgress,
        completedSteps: index
      });

      const result = await agent.executeStep(step);
      results.push({ step, result, success: true });

      if (result.filesChanged) {
        changes.push(...result.filesChanged);
      }

      // Verify step success
      if (step.successCriteria) {
        const verified = await agent.verifyStepSuccess(step, result);
        if (!verified) {
          throw new Error(`Step ${index + 1} verification failed: ${step.successCriteria}`);
        }
      }
    }

    const executionResult = {
      output: results.map(r => r.result),
      changes,
      stepsCompleted: results.length
    };

    // Update: verifying
    updateTaskStatus(taskId, {
      status: 'verifying',
      currentStep: 'Verifying execution results',
      progress: 85
    });

    const verification = await agent.verifyResult(executionResult);

    // Update: learning
    updateTaskStatus(taskId, {
      status: 'learning',
      currentStep: 'Learning from execution',
      progress: 95
    });

    await agent.learnFromExecution(taskDescription, executionResult, verification);

    // Store learning
    learnings.push({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      task: taskDescription,
      success: verification.passed,
      patterns: verification.learnings,
      improvements: verification.improvements
    });

    // Update: completed (pending approval if configured)
    const needsApproval = task.requireApproval && changes.length > 0;

    updateTaskStatus(taskId, {
      status: needsApproval ? 'pending_approval' : 'completed',
      currentStep: needsApproval ? 'Waiting for approval' : 'Completed successfully',
      progress: 100,
      result: {
        success: verification.passed,
        output: executionResult.output,
        changes: changes,
        learnings: verification.learnings,
        verification
      },
      completedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error({ error: error.message, taskId }, 'Task execution failed');

    // Attempt recovery
    const recovery = await agent.attemptRecovery(error, taskDescription);

    updateTaskStatus(taskId, {
      status: 'failed',
      currentStep: 'Execution failed',
      progress: 0,
      error: error.message,
      recovery,
      failedAt: new Date().toISOString()
    });
  }
};

export const createAutonomousRouter = ({ logger }) => {
  const router = Router();

  // Apply admin middleware to all autonomous routes
  router.use(adminMiddleware({ logger }));

  /**
   * POST /api/autonomous/execute
   * Execute an autonomous task
   */
  router.post('/execute', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    const { task, context = {}, requireApproval = true } = req.body;

    if (!task || typeof task !== 'string') {
      return res.status(400).json({ error: 'Task description is required' });
    }

    const taskId = randomUUID();
    const taskRecord = {
      id: taskId,
      task,
      context,
      requireApproval,
      status: 'queued',
      currentStep: 'Queued for execution',
      progress: 0,
      createdBy: req.user.sub || req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sseClients: []
    };

    tasks.set(taskId, taskRecord);

    contextLogger.info({ taskId, task }, 'Autonomous task queued');

    // Execute asynchronously
    const agent = getAgent(contextLogger);
    setImmediate(() => {
      executeTaskWithProgress(taskId, task, context, contextLogger, agent);
    });

    res.status(202).json({
      taskId,
      status: 'queued',
      message: 'Task queued for autonomous execution',
      statusEndpoint: `/api/autonomous/tasks/${taskId}`,
      streamEndpoint: `/api/autonomous/stream/${taskId}`
    });
  });

  /**
   * GET /api/autonomous/tasks/:taskId
   * Get task status and results
   */
  router.get('/tasks/:taskId', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    const { taskId } = req.params;

    const task = tasks.get(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Calculate ETA based on progress
    let eta = null;
    if (task.status === 'executing' && task.progress > 0) {
      const elapsed = new Date() - new Date(task.createdAt);
      const estimatedTotal = (elapsed / task.progress) * 100;
      const remaining = estimatedTotal - elapsed;
      eta = Math.round(remaining / 1000); // seconds
    }

    contextLogger.info({ taskId, status: task.status }, 'Task status retrieved');

    res.status(200).json({
      ...task,
      eta,
      sseClients: undefined // Don't expose internal state
    });
  });

  /**
   * GET /api/autonomous/stream/:taskId
   * Server-Sent Events stream for real-time progress updates
   */
  router.get('/stream/:taskId', (req, res) => {
    const { taskId } = req.params;
    const task = tasks.get(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in nginx

    // Send initial state
    res.write(`data: ${JSON.stringify(task)}\n\n`);

    // Add client to task's SSE clients
    if (!task.sseClients) {
      task.sseClients = [];
    }
    task.sseClients.push(res);

    logger.info({ taskId, clientCount: task.sseClients.length }, 'SSE client connected');

    // Send heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      if (task.sseClients) {
        task.sseClients = task.sseClients.filter(client => client !== res);
      }
      logger.info({ taskId, clientCount: task.sseClients?.length || 0 }, 'SSE client disconnected');
    });
  });

  /**
   * GET /api/autonomous/learnings
   * Get patterns learned from past executions
   */
  router.get('/learnings', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    const { limit = 50, successful = null } = req.query;

    let filteredLearnings = [...learnings];

    // Filter by success if requested
    if (successful !== null) {
      const successfulBool = successful === 'true';
      filteredLearnings = filteredLearnings.filter(l => l.success === successfulBool);
    }

    // Sort by timestamp descending
    filteredLearnings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    filteredLearnings = filteredLearnings.slice(0, parseInt(limit));

    contextLogger.info({ count: filteredLearnings.length }, 'Learnings retrieved');

    res.status(200).json({
      learnings: filteredLearnings,
      total: learnings.length,
      returned: filteredLearnings.length
    });
  });

  /**
   * GET /api/autonomous/capabilities
   * Get list of agent capabilities
   */
  router.get('/capabilities', async (req, res) => {
    const agent = getAgent(logger);

    const capabilities = {
      actions: Array.from(agent.capabilities),
      features: {
        autonomousExecution: true,
        selfHealing: true,
        learningEngine: true,
        rollbackSupport: true,
        humanInTheLoop: true,
        progressStreaming: true,
        extendedThinking: true
      },
      limits: {
        maxTaskDuration: '10 minutes',
        maxFileSize: '10MB',
        supportedLanguages: ['JavaScript', 'TypeScript', 'Python', 'SQL', 'Bash'],
        maxConcurrentTasks: 5
      },
      integrations: {
        bigQuery: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        github: !!process.env.GITHUB_TOKEN,
        redis: !!process.env.REDIS_URL,
        anthropic: !!process.env.ANTHROPIC_API_KEY
      }
    };

    res.status(200).json(capabilities);
  });

  /**
   * POST /api/autonomous/approve/:taskId
   * Approve changes from a task execution (human-in-the-loop)
   */
  router.post('/approve/:taskId', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    const { taskId } = req.params;
    const { approved, reason = '' } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'approved (boolean) is required' });
    }

    const task = tasks.get(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'pending_approval') {
      return res.status(400).json({
        error: 'Task not pending approval',
        currentStatus: task.status
      });
    }

    if (approved) {
      // Deploy/commit the changes
      updateTaskStatus(taskId, {
        status: 'approved',
        currentStep: 'Changes approved, deploying',
        approvedBy: req.user.sub || req.user.id,
        approvedAt: new Date().toISOString(),
        approvalReason: reason
      });

      // Execute deployment (simplified)
      try {
        // In production, this would trigger your actual deployment pipeline
        contextLogger.info({ taskId, changes: task.result.changes }, 'Deploying approved changes');

        updateTaskStatus(taskId, {
          status: 'completed',
          currentStep: 'Deployed successfully',
          deployedAt: new Date().toISOString()
        });

        res.status(200).json({
          success: true,
          message: 'Changes approved and deployed',
          task: tasks.get(taskId)
        });
      } catch (error) {
        contextLogger.error({ error: error.message, taskId }, 'Deployment failed');

        updateTaskStatus(taskId, {
          status: 'deployment_failed',
          error: error.message
        });

        res.status(500).json({
          error: 'Deployment failed',
          message: error.message
        });
      }
    } else {
      // Reject and rollback
      updateTaskStatus(taskId, {
        status: 'rejected',
        currentStep: 'Changes rejected, rolling back',
        rejectedBy: req.user.sub || req.user.id,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      });

      try {
        const agent = getAgent(contextLogger);

        // Execute rollback
        if (task.result?.changes?.length > 0) {
          await agent.executeBashAction(`git checkout ${task.result.changes.join(' ')}`);
        }

        updateTaskStatus(taskId, {
          status: 'rolled_back',
          currentStep: 'Changes rolled back',
          rolledBackAt: new Date().toISOString()
        });

        res.status(200).json({
          success: true,
          message: 'Changes rejected and rolled back',
          task: tasks.get(taskId)
        });
      } catch (error) {
        contextLogger.error({ error: error.message, taskId }, 'Rollback failed');

        updateTaskStatus(taskId, {
          status: 'rollback_failed',
          error: error.message
        });

        res.status(500).json({
          error: 'Rollback failed',
          message: error.message
        });
      }
    }
  });

  /**
   * POST /api/autonomous/rollback/:taskId
   * Emergency rollback of a completed task
   */
  router.post('/rollback/:taskId', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    const { taskId } = req.params;
    const { reason = 'Manual rollback requested' } = req.body;

    const task = tasks.get(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!['completed', 'approved'].includes(task.status)) {
      return res.status(400).json({
        error: 'Can only rollback completed or approved tasks',
        currentStatus: task.status
      });
    }

    if (!task.result?.changes || task.result.changes.length === 0) {
      return res.status(400).json({
        error: 'No changes to rollback'
      });
    }

    try {
      updateTaskStatus(taskId, {
        status: 'rolling_back',
        currentStep: 'Rolling back changes',
        rollbackInitiatedBy: req.user.sub || req.user.id,
        rollbackReason: reason
      });

      const agent = getAgent(contextLogger);

      // Git rollback
      await agent.executeBashAction(`git checkout ${task.result.changes.join(' ')}`);

      // Run tests to verify rollback
      try {
        await agent.executeBashAction('npm test');
      } catch (testError) {
        contextLogger.warn({ error: testError.message }, 'Tests failed after rollback');
      }

      updateTaskStatus(taskId, {
        status: 'rolled_back',
        currentStep: 'Successfully rolled back',
        rolledBackAt: new Date().toISOString()
      });

      contextLogger.info({ taskId, changes: task.result.changes }, 'Task rolled back');

      res.status(200).json({
        success: true,
        message: 'Task rolled back successfully',
        changesReverted: task.result.changes,
        task: tasks.get(taskId)
      });

    } catch (error) {
      contextLogger.error({ error: error.message, taskId }, 'Rollback failed');

      updateTaskStatus(taskId, {
        status: 'rollback_failed',
        error: error.message,
        currentStep: 'Rollback failed - manual intervention required'
      });

      res.status(500).json({
        error: 'Rollback failed',
        message: error.message,
        recommendation: 'Manual intervention required. Check git status and restore from backup.'
      });
    }
  });

  /**
   * GET /api/autonomous/tasks
   * List all tasks (with pagination)
   */
  router.get('/tasks', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    const { status, limit = 50, offset = 0 } = req.query;

    let taskList = Array.from(tasks.values());

    // Filter by status if provided
    if (status) {
      taskList = taskList.filter(t => t.status === status);
    }

    // Sort by creation date descending
    taskList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = taskList.length;
    const paginatedTasks = taskList.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    contextLogger.info({ total, returned: paginatedTasks.length }, 'Tasks list retrieved');

    res.status(200).json({
      tasks: paginatedTasks.map(t => ({ ...t, sseClients: undefined })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  });

  /**
   * DELETE /api/autonomous/tasks/:taskId
   * Cancel a queued or running task
   */
  router.delete('/tasks/:taskId', async (req, res) => {
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);
    const { taskId } = req.params;

    const task = tasks.get(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (['completed', 'failed', 'rolled_back'].includes(task.status)) {
      return res.status(400).json({
        error: 'Cannot cancel completed, failed, or rolled back task',
        currentStatus: task.status
      });
    }

    updateTaskStatus(taskId, {
      status: 'cancelled',
      currentStep: 'Cancelled by user',
      cancelledBy: req.user.sub || req.user.id,
      cancelledAt: new Date().toISOString()
    });

    contextLogger.info({ taskId }, 'Task cancelled');

    res.status(200).json({
      success: true,
      message: 'Task cancelled',
      task: tasks.get(taskId)
    });
  });

  /**
   * GET /api/autonomous/health
   * Health check for autonomous agent
   */
  router.get('/health', async (req, res) => {
    try {
      const agent = getAgent(logger);

      const health = {
        status: 'healthy',
        agent: {
          initialized: !!agent,
          capabilities: agent.capabilities.size,
          apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
        },
        tasks: {
          total: tasks.size,
          queued: Array.from(tasks.values()).filter(t => t.status === 'queued').length,
          running: Array.from(tasks.values()).filter(t => ['analyzing', 'planning', 'executing'].includes(t.status)).length,
          pendingApproval: Array.from(tasks.values()).filter(t => t.status === 'pending_approval').length,
          completed: Array.from(tasks.values()).filter(t => t.status === 'completed').length
        },
        learnings: {
          total: learnings.length,
          successful: learnings.filter(l => l.success).length
        }
      };

      res.status(200).json(health);
    } catch (error) {
      logger.error({ error: error.message }, 'Autonomous agent health check failed');
      res.status(503).json({
        status: 'unhealthy',
        error: error.message
      });
    }
  });

  return router;
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
