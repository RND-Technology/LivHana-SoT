#!/usr/bin/env node
/**
 * Copilot Round-Robin Architecture
 * File-based async task delegation between Copilot and Liv Hana agents
 *
 * Flow:
 * 1. Copilot writes task to .vscode/copilot_chat.json
 * 2. This script detects change and reads task
 * 3. Delegates to appropriate agent via task queue
 * 4. Waits for agent completion
 * 5. Writes result to .vscode/copilot_results.json
 * 6. Copilot reads result and continues conversation
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../..');
const COPILOT_CHAT_FILE = path.join(ROOT_DIR, '.vscode/copilot_chat.json');
const COPILOT_RESULTS_FILE = path.join(ROOT_DIR, '.vscode/copilot_results.json');
const TASKS_DIR = path.join(ROOT_DIR, 'tmp/agent_status/tasks');
const LOG_FILE = path.join(ROOT_DIR, 'logs/copilot_roundrobin.log');

// Ensure directories exist
fs.mkdirSync(path.dirname(COPILOT_CHAT_FILE), { recursive: true });
fs.mkdirSync(TASKS_DIR, { recursive: true });
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

let lastProcessedTimestamp = null;

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Security: Input validation and sanitization
function validateTask(task) {
  // Validate structure
  if (!task || typeof task !== 'object') {
    throw new Error('Invalid task: must be object');
  }

  // Validate request field
  if (!task.request || typeof task.request !== 'string') {
    throw new Error('Invalid task: request field required and must be string');
  }

  // Security: Limit request length (prevent DoS)
  const MAX_REQUEST_LENGTH = 10000;
  if (task.request.length > MAX_REQUEST_LENGTH) {
    throw new Error(`Invalid task: request exceeds max length ${MAX_REQUEST_LENGTH}`);
  }

  // Security: Sanitize request (prevent shell injection)
  const DANGEROUS_PATTERNS = [
    /\$\(/g,           // Command substitution $(...)
    /`/g,              // Backticks for command substitution
    /\|/g,             // Pipe operator
    /;/g,              // Command separator
    /&/g,              // Background execution
    />/g,              // Output redirection
    /<\(/g,            // Process substitution
    /\$\{/g,           // Variable expansion
  ];

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(task.request)) {
      throw new Error(`Invalid task: request contains suspicious pattern ${pattern}`);
    }
  }

  // Validate timestamp
  if (task.timestamp && typeof task.timestamp !== 'string') {
    throw new Error('Invalid task: timestamp must be string');
  }

  return true;
}

// Security: Check queue depth to prevent overflow
function checkQueueDepth() {
  const MAX_QUEUE_DEPTH = 100;
  const requestFiles = fs.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.request.json'));

  if (requestFiles.length >= MAX_QUEUE_DEPTH) {
    throw new Error(`Queue overflow: ${requestFiles.length} pending tasks (max ${MAX_QUEUE_DEPTH})`);
  }
}

function processCopilotTask(task) {
  const taskId = `copilot-${Date.now()}`;
  log(`Processing Copilot task: ${taskId}`);

  // Determine which agent to delegate to
  const agent = determineAgent(task);
  log(`Delegating to agent: ${agent}`);

  // Create task file for agent
  const taskFile = path.join(TASKS_DIR, `${taskId}.${agent}.request.json`);
  fs.writeFileSync(taskFile, JSON.stringify({
    task_id: taskId,
    type: task.type || 'execute',
    payload: task.request,
    source: 'copilot',
    timestamp: new Date().toISOString()
  }));

  // Wait for result (polling with timeout)
  const resultFile = path.join(TASKS_DIR, `${taskId}.result.json`);
  const maxWait = 120000; // 2 minutes
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (fs.existsSync(resultFile)) {
        clearInterval(checkInterval);

        const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
        log(`Task ${taskId} completed: ${result.status}`);

        // Clean up task files
        fs.unlinkSync(resultFile);
        if (fs.existsSync(taskFile)) fs.unlinkSync(taskFile);

        resolve(result);
      } else if (Date.now() - startTime > maxWait) {
        clearInterval(checkInterval);
        log(`Task ${taskId} timed out after ${maxWait}ms`);
        reject(new Error('Task timeout'));
      }
    }, 500);
  });
}

function determineAgent(task) {
  const request = (task.request || '').toLowerCase();

  if (request.includes('plan') || request.includes('strategy')) return 'planning';
  if (request.includes('research') || request.includes('search') || request.includes('find')) return 'research';
  if (request.includes('test') || request.includes('qa') || request.includes('validate')) return 'qa';
  if (request.includes('execute') || request.includes('run') || request.includes('build')) return 'execmon';
  if (request.includes('artifact') || request.includes('document')) return 'artifact';

  // Default to planning for unclear requests
  return 'planning';
}

async function watchCopilotChat() {
  log('Copilot Round-Robin started - watching .vscode/copilot_chat.json');

  // Initialize copilot_chat.json if it doesn't exist
  if (!fs.existsSync(COPILOT_CHAT_FILE)) {
    fs.writeFileSync(COPILOT_CHAT_FILE, JSON.stringify({
      instructions: "Copilot: Write your task here. Liv will execute and respond in copilot_results.json",
      request: "",
      timestamp: new Date().toISOString()
    }, null, 2));
    log('Created initial copilot_chat.json');
  }

  // Watch for changes
  fs.watch(COPILOT_CHAT_FILE, async (eventType) => {
    if (eventType !== 'change') return;

    try {
      // Read the file
      const data = JSON.parse(fs.readFileSync(COPILOT_CHAT_FILE, 'utf8'));

      // Check if this is a new task (different timestamp)
      if (data.timestamp === lastProcessedTimestamp) return;
      if (!data.request || data.request.trim() === '') return;

      // Security: Validate task structure and content
      validateTask(data);

      // Security: Check queue depth before processing
      checkQueueDepth();

      lastProcessedTimestamp = data.timestamp;

      log(`New Copilot request detected: ${data.request.substring(0, 50)}...`);

      // Process the task
      const result = await processCopilotTask(data);

      // Write result for Copilot to read
      fs.writeFileSync(COPILOT_RESULTS_FILE, JSON.stringify({
        task_id: result.task_id,
        status: result.status,
        result: result.result || result.output || 'Task completed',
        timestamp: new Date().toISOString(),
        agent: determineAgent(data)
      }, null, 2));

      log('Result written to copilot_results.json');

      // Clear the request (optional - prevents re-processing)
      data.request = '';
      data.processed = true;
      fs.writeFileSync(COPILOT_CHAT_FILE, JSON.stringify(data, null, 2));

    } catch (err) {
      log(`ERROR: ${err.message}`);

      // Write error to results file
      fs.writeFileSync(COPILOT_RESULTS_FILE, JSON.stringify({
        status: 'error',
        error: err.message,
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  });

  // Keep process alive
  process.on('SIGTERM', () => {
    log('Copilot Round-Robin stopping...');
    process.exit(0);
  });

  log('Ready for Copilot requests');
}

watchCopilotChat();
