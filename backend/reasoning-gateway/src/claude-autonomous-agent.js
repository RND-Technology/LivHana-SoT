/**
 * Claude Autonomous Agent
 * Gives Liv Hana the ability to code, deploy, and self-improve
 *
 * This is the bridge between customer requests and autonomous execution
 */

import Anthropic from '@anthropic-ai/sdk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

export class ClaudeAutonomousAgent {
  constructor({ logger, apiKey }) {
    this.logger = logger;
    this.client = new Anthropic({ apiKey });
    this.conversationHistory = [];
    this.capabilities = new Set([
      'read_file',
      'write_file',
      'execute_bash',
      'search_codebase',
      'run_tests',
      'deploy_code',
      'query_database',
      'analyze_logs',
      'generate_reports'
    ]);
  }

  /**
   * Main entry point: Give Liv Hana a task, get autonomous execution
   */
  async executeTask(task, context = {}) {
    this.logger.info({ task, context }, 'Claude agent received task');

    try {
      // 1. Analyze the task
      const analysis = await this.analyzeTask(task, context);

      // 2. Plan the execution
      const plan = await this.createExecutionPlan(analysis);

      // 3. Execute the plan autonomously
      const result = await this.executePlan(plan);

      // 4. Verify the result
      const verification = await this.verifyResult(result);

      // 5. Learn from the execution
      await this.learnFromExecution(task, result, verification);

      return {
        success: verification.passed,
        result: result.output,
        changes: result.changes,
        learnings: verification.learnings
      };
    } catch (error) {
      this.logger.error({ error: error.message, task }, 'Agent execution failed');
      return {
        success: false,
        error: error.message,
        recovery: await this.attemptRecovery(error, task)
      };
    }
  }

  /**
   * Analyze task using Claude with extended thinking
   */
  async analyzeTask(task, context) {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000
      },
      messages: [{
        role: 'user',
        content: `Analyze this task and determine what needs to be done:

Task: ${task}

Context:
${JSON.stringify(context, null, 2)}

Available capabilities:
${Array.from(this.capabilities).join(', ')}

Provide a detailed analysis including:
1. What needs to be built/modified
2. Which files need to be touched
3. What tests need to be run
4. Potential risks
5. Success criteria`
      }]
    });

    const analysis = this.extractText(response);
    this.conversationHistory.push({ task, analysis });

    return {
      task,
      analysis,
      thinkingProcess: response.content.find(c => c.type === 'thinking')?.thinking
    };
  }

  /**
   * Create execution plan
   */
  async createExecutionPlan(analysis) {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `Based on this analysis, create a step-by-step execution plan:

${analysis.analysis}

IMPORTANT: For execute_bash actions, use ONLY real shell commands like:
- "ls -la" (list files)
- "cat file.txt" (read file)
- "echo 'content' > file.txt" (write file)
- "test -f file.txt && echo exists || echo missing" (check file exists)

DO NOT use pseudo-commands like "check_existing_file" - they don't exist!

Format the plan as JSON with this structure:
{
  "steps": [
    {
      "action": "read_file|write_file|execute_bash|etc",
      "target": "file path OR actual bash command (no pseudo-commands!)",
      "parameters": {},
      "successCriteria": "how to verify this step worked"
    }
  ],
  "rollbackPlan": "how to undo if something fails",
  "testingStrategy": "how to verify the entire execution"
}`
      }]
    });

    const planText = this.extractText(response);
    const plan = JSON.parse(planText.match(/\{[\s\S]*\}/)[0]);

    this.logger.info({ steps: plan.steps.length }, 'Execution plan created');
    return plan;
  }

  /**
   * Execute the plan autonomously
   */
  async executePlan(plan) {
    const results = [];
    const changes = [];

    for (const [index, step] of plan.steps.entries()) {
      this.logger.info({ step: index + 1, total: plan.steps.length, action: step.action }, 'Executing step');

      try {
        const result = await this.executeStep(step);
        results.push({ step, result, success: true });

        if (result.filesChanged) {
          changes.push(...result.filesChanged);
        }

        // Verify step success
        if (step.successCriteria) {
          const verified = await this.verifyStepSuccess(step, result);
          if (!verified) {
            throw new Error(`Step ${index + 1} verification failed: ${step.successCriteria}`);
          }
        }
      } catch (error) {
        this.logger.error({ step, error: error.message }, 'Step execution failed');

        // Attempt rollback
        await this.rollback(plan, results);
        throw error;
      }
    }

    return {
      output: results.map(r => r.result),
      changes,
      stepsCompleted: results.length
    };
  }

  /**
   * Execute a single step
   */
  async executeStep(step) {
    switch (step.action) {
      case 'read_file':
        return await this.readFileAction(step.target);

      case 'write_file':
        return await this.writeFileAction(step.target, step.parameters.content);

      case 'execute_bash':
        return await this.executeBashAction(step.target, step.parameters);

      case 'search_codebase':
        return await this.searchCodebaseAction(step.parameters.pattern);

      case 'run_tests':
        return await this.runTestsAction(step.parameters.testPath);

      case 'query_database':
        return await this.queryDatabaseAction(step.parameters.query);

      case 'deploy_code':
        return await this.deployCodeAction(step.parameters);

      default:
        throw new Error(`Unknown action: ${step.action}`);
    }
  }

  /**
   * Tool implementations
   */
  async readFileAction(filePath) {
    const absolutePath = join(process.cwd(), '../..', filePath);
    const content = await readFile(absolutePath, 'utf-8');
    return { content, filesRead: [filePath] };
  }

  async writeFileAction(filePath, content) {
    const absolutePath = join(process.cwd(), '../..', filePath);
    await writeFile(absolutePath, content, 'utf-8');
    return { success: true, filesChanged: [filePath] };
  }

  async executeBashAction(command, parameters = {}) {
    // Validate command is not a pseudo-command
    const invalidCommands = ['check_existing_file', 'create_file', 'check_status'];
    const firstWord = command.split(' ')[0];
    if (invalidCommands.includes(firstWord)) {
      throw new Error(`Invalid pseudo-command: ${firstWord}. Use real bash commands like 'test -f', 'echo', 'cat', etc.`);
    }

    const { stdout, stderr } = await execAsync(command, {
      cwd: parameters.cwd || join(process.cwd(), '../..'),
      timeout: parameters.timeout || 60000,
      shell: '/bin/bash'
    });

    return { stdout, stderr, command };
  }

  async searchCodebaseAction(pattern) {
    const { stdout } = await execAsync(`grep -r "${pattern}" . --include="*.js" --include="*.ts" --include="*.jsx"`);
    return { matches: stdout.split('\n').filter(Boolean) };
  }

  async runTestsAction(testPath) {
    const { stdout, stderr } = await execAsync(`npm test ${testPath}`);
    const passed = !stderr.includes('FAIL') && stdout.includes('PASS');
    return { passed, output: stdout, errors: stderr };
  }

  async queryDatabaseAction(query) {
    // Integrate with BigQuery adapter
    const { BigQuery } = await import('@google-cloud/bigquery');
    const bigquery = new BigQuery();
    const [rows] = await bigquery.query(query);
    return { rows, count: rows.length };
  }

  async deployCodeAction(parameters) {
    // This would integrate with your deployment system
    // For now, run build and health checks
    const buildResult = await execAsync('npm run build');
    const healthCheck = await execAsync('curl http://localhost:' + (parameters.port || 3005) + '/health');

    return {
      deployed: true,
      buildOutput: buildResult.stdout,
      healthStatus: JSON.parse(healthCheck.stdout)
    };
  }

  /**
   * Verify the entire result
   */
  async verifyResult(result) {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Verify this execution result and extract learnings:

Result: ${JSON.stringify(result, null, 2)}

Provide:
1. Did the execution succeed? (yes/no)
2. What worked well?
3. What could be improved?
4. Any patterns to remember for future tasks?
5. Recommended next steps?

Format as JSON.`
      }]
    });

    const verificationText = this.extractText(response);
    const verification = JSON.parse(verificationText.match(/\{[\s\S]*\}/)[0]);

    return {
      passed: verification.succeeded,
      learnings: verification.patterns,
      improvements: verification.improvements,
      nextSteps: verification.nextSteps
    };
  }

  /**
   * Learn from execution (self-improvement)
   */
  async learnFromExecution(task, result, verification) {
    const learning = {
      timestamp: new Date().toISOString(),
      task,
      result: result.success,
      patterns: verification.learnings,
      improvements: verification.improvements,
      conversationHistory: this.conversationHistory
    };

    // Store learning in BigQuery for future reference
    const { BigQuery } = await import('@google-cloud/bigquery');
    const bigquery = new BigQuery();

    await bigquery
      .dataset('ai_learning')
      .table('agent_executions')
      .insert([learning]);

    this.logger.info({ learning }, 'Agent learned from execution');
  }

  /**
   * Attempt recovery from failure
   */
  async attemptRecovery(error, task) {
    this.logger.warn({ error: error.message, task }, 'Attempting recovery');

    // Ask Claude how to recover
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `This task failed with error: ${error.message}

Original task: ${task}

How should I recover? Provide step-by-step recovery plan.`
      }]
    });

    const recoveryPlan = this.extractText(response);
    return { recoveryPlan, attempted: true };
  }

  /**
   * Rollback on failure
   */
  async rollback(plan, completedSteps) {
    this.logger.warn({ stepsToRollback: completedSteps.length }, 'Rolling back changes');

    // Execute rollback plan
    if (plan.rollbackPlan) {
      await this.executeBashAction(plan.rollbackPlan);
    }

    // Revert file changes
    for (const step of completedSteps.reverse()) {
      if (step.result.filesChanged) {
        await this.executeBashAction(`git checkout ${step.result.filesChanged.join(' ')}`);
      }
    }
  }

  /**
   * Verify step success
   */
  async verifyStepSuccess(step, result) {
    // Simple verification for now
    if (step.successCriteria.includes('file exists')) {
      const filePath = step.successCriteria.match(/file exists: (.+)/)[1];
      try {
        await readFile(filePath);
        return true;
      } catch {
        return false;
      }
    }

    if (step.successCriteria.includes('tests pass')) {
      return result.passed === true;
    }

    if (step.successCriteria.includes('no errors')) {
      return !result.stderr || result.stderr.length === 0;
    }

    return true; // Default: assume success if no specific criteria
  }

  /**
   * Extract text from Claude response
   */
  extractText(response) {
    return response.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');
  }
}

/**
 * Factory function
 */
export function createClaudeAgent({ logger }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable required');
  }

  return new ClaudeAutonomousAgent({ logger, apiKey });
}
