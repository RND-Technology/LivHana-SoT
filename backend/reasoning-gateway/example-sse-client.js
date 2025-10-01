#!/usr/bin/env node

/**
 * Example SSE (Server-Sent Events) client for Claude Autonomous Agent
 * Demonstrates real-time task progress monitoring
 *
 * Usage:
 *   node example-sse-client.js <taskId> [authToken]
 *
 * Example:
 *   node example-sse-client.js 550e8400-e29b-41d4-a716-446655440000 your-admin-token
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4002';
const taskId = process.argv[2];
const authToken = process.argv[3] || process.env.ADMIN_JWT_TOKEN;

if (!taskId) {
  console.error('Usage: node example-sse-client.js <taskId> [authToken]');
  console.error('');
  console.error('Environment variables:');
  console.error('  BASE_URL - API base URL (default: http://localhost:4002)');
  console.error('  ADMIN_JWT_TOKEN - Admin JWT token for authentication');
  process.exit(1);
}

if (!authToken) {
  console.error('Error: Authentication token required');
  console.error('Provide as argument or set ADMIN_JWT_TOKEN environment variable');
  process.exit(1);
}

console.log(`Connecting to task stream: ${taskId}`);
console.log(`URL: ${BASE_URL}/api/autonomous/stream/${taskId}`);
console.log('');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// Progress bar
function renderProgressBar(progress, width = 40) {
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Status colors
function getStatusColor(status) {
  const statusColors = {
    queued: colors.dim,
    analyzing: colors.cyan,
    planning: colors.cyan,
    executing: colors.blue,
    verifying: colors.yellow,
    learning: colors.yellow,
    pending_approval: colors.yellow,
    approved: colors.green,
    completed: colors.green,
    failed: colors.red,
    rejected: colors.red,
    rolled_back: colors.yellow,
    cancelled: colors.dim,
  };
  return statusColors[status] || colors.reset;
}

// Clear console and move cursor to top
function clearScreen() {
  console.log('\x1b[2J\x1b[H');
}

// Render task status
function renderTaskStatus(task) {
  clearScreen();

  console.log(`${colors.bright}Claude Autonomous Agent - Task Monitor${colors.reset}`);
  console.log('='.repeat(70));
  console.log('');

  // Task info
  console.log(`${colors.bright}Task ID:${colors.reset} ${task.id}`);
  console.log(`${colors.bright}Task:${colors.reset} ${task.task}`);
  console.log('');

  // Status
  const statusColor = getStatusColor(task.status);
  console.log(`${colors.bright}Status:${colors.reset} ${statusColor}${task.status.toUpperCase()}${colors.reset}`);
  console.log('');

  // Progress bar
  if (task.progress !== undefined) {
    const progressBar = renderProgressBar(task.progress);
    console.log(`${colors.bright}Progress:${colors.reset} ${task.progress}%`);
    console.log(`${colors.green}${progressBar}${colors.reset}`);
    console.log('');
  }

  // Current step
  if (task.currentStep) {
    console.log(`${colors.bright}Current Step:${colors.reset}`);
    console.log(`  ${task.currentStep}`);
    console.log('');
  }

  // Plan overview
  if (task.plan && task.completedSteps !== undefined) {
    console.log(`${colors.bright}Execution Plan:${colors.reset}`);
    console.log(`  Steps: ${task.completedSteps}/${task.plan.totalSteps} completed`);

    if (task.plan.steps) {
      task.plan.steps.forEach((step, index) => {
        const isDone = index < task.completedSteps;
        const isCurrent = index === task.completedSteps;
        const prefix = isDone ? '✓' : isCurrent ? '→' : '○';
        const color = isDone ? colors.green : isCurrent ? colors.yellow : colors.dim;

        console.log(`  ${color}${prefix} ${step.action}: ${step.target}${colors.reset}`);
      });
    }
    console.log('');
  }

  // ETA
  if (task.eta) {
    const minutes = Math.floor(task.eta / 60);
    const seconds = task.eta % 60;
    console.log(`${colors.bright}Estimated Time:${colors.reset} ${minutes}m ${seconds}s remaining`);
    console.log('');
  }

  // Results
  if (task.result) {
    console.log(`${colors.bright}Result:${colors.reset}`);

    if (task.result.success !== undefined) {
      console.log(`  Success: ${task.result.success ? colors.green + 'YES' : colors.red + 'NO'}${colors.reset}`);
    }

    if (task.result.changes && task.result.changes.length > 0) {
      console.log(`  Files Changed: ${task.result.changes.length}`);
      task.result.changes.forEach(file => {
        console.log(`    - ${file}`);
      });
    }

    if (task.result.learnings && task.result.learnings.length > 0) {
      console.log(`  Learnings:`);
      task.result.learnings.forEach(learning => {
        console.log(`    • ${learning}`);
      });
    }

    console.log('');
  }

  // Error
  if (task.error) {
    console.log(`${colors.red}${colors.bright}Error:${colors.reset}`);
    console.log(`  ${task.error}`);
    console.log('');
  }

  // Timestamps
  console.log(`${colors.dim}Created: ${new Date(task.createdAt).toLocaleString()}`);
  if (task.updatedAt) {
    console.log(`Updated: ${new Date(task.updatedAt).toLocaleString()}`);
  }
  if (task.completedAt) {
    console.log(`Completed: ${new Date(task.completedAt).toLocaleString()}${colors.reset}`);
  }
  console.log('');

  // Footer
  console.log('='.repeat(70));
  console.log(`${colors.dim}Press Ctrl+C to exit${colors.reset}`);
}

// Connect to SSE stream
async function connectToStream() {
  try {
    const response = await fetch(`${BASE_URL}/api/autonomous/stream/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'text/event-stream',
      },
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error(errorBody);
      process.exit(1);
    }

    console.log(`${colors.green}Connected to task stream${colors.reset}`);
    console.log('');

    const reader = response.body;

    reader.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          try {
            const task = JSON.parse(data);
            renderTaskStatus(task);

            // Exit if task is in terminal state
            if (['completed', 'failed', 'rolled_back', 'cancelled'].includes(task.status)) {
              console.log('');
              console.log(`${colors.bright}Task has finished. Exiting...${colors.reset}`);
              setTimeout(() => process.exit(0), 2000);
            }
          } catch {
            // Ignore parse errors (heartbeats, etc.)
          }
        }
      }
    });

    reader.on('error', (error) => {
      console.error(`${colors.red}Stream error: ${error.message}${colors.reset}`);
      process.exit(1);
    });

    reader.on('end', () => {
      console.log(`${colors.yellow}Stream ended${colors.reset}`);
      process.exit(0);
    });

  } catch (error) {
    console.error(`${colors.red}Connection error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log(`${colors.yellow}Disconnecting...${colors.reset}`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('');
  console.log(`${colors.yellow}Disconnecting...${colors.reset}`);
  process.exit(0);
});

// Start
connectToStream();
