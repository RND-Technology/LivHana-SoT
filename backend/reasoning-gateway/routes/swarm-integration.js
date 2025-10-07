import express from 'express';
import swarmCoordinator from '../services/swarm-coordinator.js';
import { createLogger } from '../common/logging/index.js';

const router = express.Router();
const logger = createLogger('swarm-integration');

/**
 * SWARM INTEGRATION ROUTES
 * API endpoints for coordinating Claude Code CLI, Cursor IDE, and Replit agent swarm
 */

// Simple auth middleware (can be enhanced with JWT)
const authenticateRequest = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];

  // For now, accept any key (can add JWT validation later)
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Provide X-API-Key header.'
    });
  }

  // Store agent identity from header
  req.agentId = req.headers['x-agent-id'] || 'unknown';
  next();
};

/**
 * POST /api/swarm/tasks
 * Submit a new task to the swarm for execution
 */
router.post('/tasks', authenticateRequest, async (req, res) => {
  try {
    const { type, description, requiredCapabilities, priority, metadata } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        success: false,
        error: 'Task type and description are required'
      });
    }

    const task = await swarmCoordinator.submitTask({
      type,
      description,
      requiredCapabilities: requiredCapabilities || [],
      priority: priority || 'medium',
      metadata: metadata || {},
      submittedBy: req.agentId
    });

    logger.info(`Task submitted by ${req.agentId}`, { taskId: task.id, type });

    res.status(201).json({
      success: true,
      task: {
        id: task.id,
        type: task.type,
        status: task.status,
        assignedAgent: task.assignedAgent,
        createdAt: task.createdAt
      },
      message: 'Task submitted successfully'
    });

  } catch (error) {
    logger.error('Task submission failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/swarm/status/:taskId
 * Get the current status and progress of a task
 */
router.get('/status/:taskId', authenticateRequest, async (req, res) => {
  try {
    const { taskId } = req.params;

    const status = swarmCoordinator.getTaskStatus(taskId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      status
    });

  } catch (error) {
    logger.error('Status check failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/swarm/results
 * Submit task execution results
 */
router.post('/results', authenticateRequest, async (req, res) => {
  try {
    const { taskId, success, result, error, metadata } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
    }

    const task = await swarmCoordinator.submitResult(taskId, {
      success: success !== false, // default to true if not specified
      result: result || {},
      error: error || null,
      metadata: metadata || {},
      completedBy: req.agentId,
      completedAt: new Date()
    });

    logger.info(`Task result submitted by ${req.agentId}`, {
      taskId,
      success: task.status === 'completed'
    });

    res.json({
      success: true,
      task: {
        id: task.id,
        status: task.status,
        completedAt: task.endTime
      },
      message: 'Result submitted successfully'
    });

  } catch (error) {
    logger.error('Result submission failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/swarm/capabilities
 * List all available agent capabilities in the swarm
 */
router.get('/capabilities', authenticateRequest, async (req, res) => {
  try {
    const capabilities = swarmCoordinator.getCapabilities();

    res.json({
      success: true,
      capabilities
    });

  } catch (error) {
    logger.error('Capabilities fetch failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/swarm/health
 * Get swarm health and performance metrics
 */
router.get('/health', async (req, res) => {
  try {
    const health = swarmCoordinator.getHealth();

    res.json(health);

  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/swarm/quick-start/hnc
 * Quick-start High Noon Cartoon production pipeline
 */
router.post('/quick-start/hnc', authenticateRequest, async (req, res) => {
  try {
    logger.info('HNC Quick Start initiated by ' + req.agentId);

    const pipeline = await swarmCoordinator.quickStartHNC();

    res.status(201).json({
      success: true,
      pipeline,
      message: 'High Noon Cartoon production pipeline started',
      next_steps: [
        'Monitor task progress via /api/swarm/status/:taskId',
        'Check swarm health at /api/swarm/health',
        'View results when tasks complete'
      ]
    });

  } catch (error) {
    logger.error('HNC Quick Start failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/swarm/tasks/:taskId/start
 * Mark a task as started (used by agents when they begin work)
 */
router.post('/tasks/:taskId/start', authenticateRequest, async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await swarmCoordinator.startTask(taskId);

    logger.info(`Task started by ${req.agentId}`, { taskId });

    res.json({
      success: true,
      task: {
        id: task.id,
        status: task.status,
        startTime: task.startTime
      }
    });

  } catch (error) {
    logger.error('Task start failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/swarm/tasks
 * List all tasks (with optional filtering)
 */
router.get('/tasks', authenticateRequest, async (req, res) => {
  try {
    const { status, agent, limit = 100 } = req.query;

    let tasks = Array.from(swarmCoordinator.tasks.values());

    // Apply filters
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }

    if (agent) {
      tasks = tasks.filter(t => t.assignedAgent === agent);
    }

    // Sort by creation time (newest first)
    tasks.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    tasks = tasks.slice(0, parseInt(limit));

    // Map to response format
    const taskList = tasks.map(t => ({
      id: t.id,
      type: t.type,
      description: t.description,
      status: t.status,
      assignedAgent: t.assignedAgent,
      createdAt: t.createdAt,
      startTime: t.startTime,
      endTime: t.endTime
    }));

    res.json({
      success: true,
      tasks: taskList,
      total: taskList.length
    });

  } catch (error) {
    logger.error('Task list failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/swarm/agents
 * List all agents and their current status
 */
router.get('/agents', authenticateRequest, async (req, res) => {
  try {
    const agents = Array.from(swarmCoordinator.agents.entries()).map(([id, agent]) => ({
      id,
      type: agent.type,
      capabilities: agent.capabilities,
      status: agent.status,
      currentTasks: agent.currentTasks.length,
      maxConcurrentTasks: agent.maxConcurrentTasks,
      completedTasks: agent.completedTasks,
      failedTasks: agent.failedTasks,
      successRate: agent.successRate.toFixed(2) + '%',
      lastActive: agent.lastActive
    }));

    res.json({
      success: true,
      agents,
      total: agents.length
    });

  } catch (error) {
    logger.error('Agent list failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
