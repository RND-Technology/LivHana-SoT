import { createLogger } from '../common/logging/index.js';

const logger = createLogger('swarm-coordinator');

/**
 * SWARM COORDINATOR SERVICE
 * Central coordination hub for Claude Code CLI, Cursor IDE, and Replit agent swarm
 *
 * Responsibilities:
 * - Task queue management
 * - Agent assignment and load balancing
 * - Progress tracking and status updates
 * - Result aggregation and validation
 * - Performance metrics and learning feedback
 */

class SwarmCoordinator {
  constructor() {
    this.tasks = new Map(); // taskId -> task details
    this.agents = new Map(); // agentId -> agent info
    this.taskQueue = []; // pending tasks
    this.results = new Map(); // taskId -> result
    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      totalExecutionTime: 0
    };

    // Register default agents
    this.registerAgent({
      id: 'claude-code-cli',
      type: 'terminal',
      capabilities: ['file-operations', 'git', 'bash', 'deployment', 'testing'],
      status: 'available',
      maxConcurrentTasks: 3
    });

    this.registerAgent({
      id: 'cursor-ide',
      type: 'ide',
      capabilities: ['code-editing', 'refactoring', 'debugging', 'documentation'],
      status: 'available',
      maxConcurrentTasks: 2
    });

    this.registerAgent({
      id: 'replit-agent',
      type: 'cloud-executor',
      capabilities: ['deployment', 'testing', 'monitoring', 'scaling'],
      status: 'available',
      maxConcurrentTasks: 5
    });

    logger.info('Swarm Coordinator initialized with 3 agents');
  }

  /**
   * Register a new agent in the swarm
   */
  registerAgent(agentConfig) {
    const agent = {
      ...agentConfig,
      currentTasks: [],
      completedTasks: 0,
      failedTasks: 0,
      totalExecutionTime: 0,
      lastActive: new Date(),
      successRate: 100
    };

    this.agents.set(agentConfig.id, agent);
    logger.info(`Agent registered: ${agentConfig.id}`, { capabilities: agentConfig.capabilities });

    return agent;
  }

  /**
   * Submit a new task to the swarm
   */
  async submitTask(taskData) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const task = {
      id: taskId,
      ...taskData,
      status: 'queued',
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedAgent: null,
      startTime: null,
      endTime: null,
      result: null,
      error: null
    };

    this.tasks.set(taskId, task);
    this.taskQueue.push(taskId);
    this.metrics.totalTasks++;

    logger.info(`Task submitted: ${taskId}`, { type: taskData.type, priority: taskData.priority });

    // Try to assign immediately
    await this.assignTasks();

    return task;
  }

  /**
   * Intelligent agent assignment based on capabilities and load
   */
  async assignTasks() {
    const availableTasks = this.taskQueue.filter(taskId => {
      const task = this.tasks.get(taskId);
      return task.status === 'queued';
    });

    for (const taskId of availableTasks) {
      const task = this.tasks.get(taskId);
      const agent = this.selectBestAgent(task);

      if (agent) {
        await this.assignTaskToAgent(taskId, agent.id);
      }
    }
  }

  /**
   * Select the best agent for a task based on capabilities and current load
   */
  selectBestAgent(task) {
    let bestAgent = null;
    let bestScore = -1;

    // eslint-disable-next-line no-unused-vars
    for (const [_agentId, agent] of this.agents) {
      // Check if agent has required capabilities
      const hasCapabilities = task.requiredCapabilities?.every(cap =>
        agent.capabilities.includes(cap)
      ) ?? true;

      if (!hasCapabilities) continue;
      if (agent.status !== 'available') continue;
      if (agent.currentTasks.length >= agent.maxConcurrentTasks) continue;

      // Calculate score based on:
      // 1. Success rate (40%)
      // 2. Current load (40%)
      // 3. Matching capabilities (20%)
      const loadScore = 1 - (agent.currentTasks.length / agent.maxConcurrentTasks);
      const successScore = agent.successRate / 100;
      const capabilityScore = task.requiredCapabilities
        ? task.requiredCapabilities.filter(cap => agent.capabilities.includes(cap)).length / task.requiredCapabilities.length
        : 1;

      const score = (successScore * 0.4) + (loadScore * 0.4) + (capabilityScore * 0.2);

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  /**
   * Assign a task to a specific agent
   */
  async assignTaskToAgent(taskId, agentId) {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(agentId);

    if (!task || !agent) {
      logger.error(`Failed to assign task: ${taskId} to agent: ${agentId}`);
      return false;
    }

    task.status = 'assigned';
    task.assignedAgent = agentId;
    task.updatedAt = new Date();

    agent.currentTasks.push(taskId);
    agent.lastActive = new Date();

    // Remove from queue
    this.taskQueue = this.taskQueue.filter(id => id !== taskId);

    logger.info(`Task assigned: ${taskId} -> ${agentId}`);

    return true;
  }

  /**
   * Mark a task as in progress
   */
  async startTask(taskId) {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.status = 'in_progress';
    task.startTime = new Date();
    task.updatedAt = new Date();

    logger.info(`Task started: ${taskId} by ${task.assignedAgent}`);

    return task;
  }

  /**
   * Submit task results
   */
  async submitResult(taskId, resultData) {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const agent = this.agents.get(task.assignedAgent);

    task.status = resultData.success ? 'completed' : 'failed';
    task.result = resultData;
    task.endTime = new Date();
    task.updatedAt = new Date();
    task.error = resultData.error || null;

    // Update metrics
    if (resultData.success) {
      this.metrics.completedTasks++;
      agent.completedTasks++;
    } else {
      this.metrics.failedTasks++;
      agent.failedTasks++;
    }

    const executionTime = task.endTime - task.startTime;
    this.metrics.totalExecutionTime += executionTime;
    agent.totalExecutionTime += executionTime;

    // Update agent success rate
    const totalAgentTasks = agent.completedTasks + agent.failedTasks;
    agent.successRate = totalAgentTasks > 0
      ? (agent.completedTasks / totalAgentTasks) * 100
      : 100;

    // Remove from agent's current tasks
    agent.currentTasks = agent.currentTasks.filter(id => id !== taskId);

    // Store result
    this.results.set(taskId, resultData);

    logger.info(`Task ${task.status}: ${taskId}`, {
      executionTime,
      success: resultData.success
    });

    // Try to assign more tasks
    await this.assignTasks();

    return task;
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId) {
    const task = this.tasks.get(taskId);

    if (!task) {
      return null;
    }

    return {
      id: task.id,
      type: task.type,
      status: task.status,
      assignedAgent: task.assignedAgent,
      createdAt: task.createdAt,
      startTime: task.startTime,
      endTime: task.endTime,
      progress: this.calculateProgress(task),
      result: task.result,
      error: task.error
    };
  }

  /**
   * Calculate task progress percentage
   */
  calculateProgress(task) {
    switch (task.status) {
      case 'queued': return 0;
      case 'assigned': return 10;
      case 'in_progress': return 50;
      case 'completed': return 100;
      case 'failed': return 100;
      default: return 0;
    }
  }

  /**
   * Get all capabilities across all agents
   */
  getCapabilities() {
    const capabilities = new Set();

    // eslint-disable-next-line no-unused-vars
    for (const [_agentId, agent] of this.agents) {
      agent.capabilities.forEach(cap => capabilities.add(cap));
    }

    return {
      agents: Array.from(this.agents.entries()).map(([id, agent]) => ({
        id,
        type: agent.type,
        capabilities: agent.capabilities,
        status: agent.status,
        currentLoad: agent.currentTasks.length,
        maxConcurrentTasks: agent.maxConcurrentTasks,
        successRate: agent.successRate.toFixed(2) + '%',
        completedTasks: agent.completedTasks
      })),
      allCapabilities: Array.from(capabilities).sort()
    };
  }

  /**
   * Get health status of the swarm
   */
  getHealth() {
    const activeAgents = Array.from(this.agents.values()).filter(a => a.status === 'available').length;
    const queuedTasks = this.taskQueue.length;
    const inProgressTasks = Array.from(this.tasks.values()).filter(t => t.status === 'in_progress').length;

    const successRate = this.metrics.totalTasks > 0
      ? ((this.metrics.completedTasks / this.metrics.totalTasks) * 100).toFixed(2)
      : '100.00';

    const avgExecutionTime = this.metrics.completedTasks > 0
      ? Math.round(this.metrics.totalExecutionTime / this.metrics.completedTasks)
      : 0;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      active_agents: activeAgents,
      total_agents: this.agents.size,
      queued_tasks: queuedTasks,
      in_progress_tasks: inProgressTasks,
      completed_tasks: this.metrics.completedTasks,
      failed_tasks: this.metrics.failedTasks,
      total_tasks: this.metrics.totalTasks,
      success_rate: successRate + '%',
      avg_execution_time_ms: avgExecutionTime
    };
  }

  /**
   * HNC Quick Start - Special coordination for High Noon Cartoon production
   */
  async quickStartHNC() {
    const hncPipeline = [
      {
        type: 'script-validation',
        description: 'Validate episode scripts and character consistency',
        requiredCapabilities: ['file-operations'],
        priority: 'high',
        estimatedTime: 30000
      },
      {
        type: 'animation-setup',
        description: 'Initialize Remotion animation environment',
        requiredCapabilities: ['deployment', 'testing'],
        priority: 'high',
        estimatedTime: 60000
      },
      {
        type: 'content-generation',
        description: 'Generate video assets and animations',
        requiredCapabilities: ['deployment', 'scaling'],
        priority: 'high',
        estimatedTime: 120000
      },
      {
        type: 'deployment',
        description: 'Deploy to HighNoonCartoon.com',
        requiredCapabilities: ['deployment', 'monitoring'],
        priority: 'high',
        estimatedTime: 45000
      }
    ];

    const taskIds = [];

    for (const pipelineTask of hncPipeline) {
      const task = await this.submitTask(pipelineTask);
      taskIds.push(task.id);
    }

    logger.info('HNC Quick Start Pipeline initiated', { tasks: taskIds.length });

    return {
      pipelineId: `hnc-pipeline-${Date.now()}`,
      tasks: taskIds,
      totalTasks: taskIds.length,
      estimatedCompletionTime: hncPipeline.reduce((sum, t) => sum + t.estimatedTime, 0),
      status: 'initiated'
    };
  }
}

// Singleton instance
const coordinator = new SwarmCoordinator();

export default coordinator;
