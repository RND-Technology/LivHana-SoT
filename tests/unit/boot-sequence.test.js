// tests/unit/boot-sequence.test.js
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs/promises');
const path = require('path');

const execAsync = promisify(exec);

describe('Boot Sequence Tests', () => {
  const ROOT_DIR = path.join(process.cwd());
  const START_SCRIPT = path.join(ROOT_DIR, 'START.sh');

  beforeEach(async () => {
    // Ensure clean state
    await global.testUtils.cleanupProcesses();

    // Clean any existing locks
    try {
      await fs.unlink(path.join(ROOT_DIR, '.claude/instance_lock.json'));
    } catch (e) {
      // Ignore if file doesn't exist
    }
  });

  afterEach(async () => {
    await global.testUtils.cleanupProcesses();
  });

  test('START.sh script exists and is executable', async () => {
    const stats = await fs.stat(START_SCRIPT);
    expect(stats.isFile()).toBe(true);

    // Check if executable (on Unix systems)
    if (process.platform !== 'win32') {
      const mode = stats.mode;
      const isExecutable = !!(mode & parseInt('111', 8));
      expect(isExecutable).toBe(true);
    }
  });

  test('START.sh has proper shebang', async () => {
    const content = await fs.readFile(START_SCRIPT, 'utf8');
    expect(content.startsWith('#!/usr/bin/env bash')).toBe(true);
  });

  test('START.sh sources required libraries', async () => {
    const content = await fs.readFile(START_SCRIPT, 'utf8');

    expect(content).toMatch(/source.*lib\/instance_lock\.sh/);
    expect(content).toMatch(/source.*lib\/environment_setup\.sh/);
    expect(content).toMatch(/source.*lib\/service_management\.sh/);
    expect(content).toMatch(/source.*lib\/agent_management\.sh/);
    expect(content).toMatch(/source.*lib\/validation\.sh/);
  });

  test('START.sh calls main functions in correct order', async () => {
    const content = await fs.readFile(START_SCRIPT, 'utf8');

    const mainFunction = content.match(/main\(\) \{([\s\S]*?)\}/);
    expect(mainFunction).toBeTruthy();

    const mainBody = mainFunction[1];
    expect(mainBody).toMatch(/preflight_checks/);
    expect(mainBody).toMatch(/setup_environment/);
    expect(mainBody).toMatch(/start_services/);
    expect(mainBody).toMatch(/spawn_agents/);
    expect(mainBody).toMatch(/validate_system/);
  });

  test('Boot libraries exist and are valid', async () => {
    const libs = [
      'scripts/boot/lib/instance_lock.sh',
      'scripts/boot/lib/environment_setup.sh',
      'scripts/boot/lib/service_management.sh',
      'scripts/boot/lib/agent_management.sh',
      'scripts/boot/lib/validation.sh'
    ];

    for (const lib of libs) {
      const libPath = path.join(ROOT_DIR, lib);
      const stats = await fs.stat(libPath);
      expect(stats.isFile()).toBe(true);

      const content = await fs.readFile(libPath, 'utf8');
      expect(content).toMatch(/#!/);
      expect(content.length).toBeGreaterThan(100); // Basic size check
    }
  });

  test('Environment setup configures required variables', async () => {
    const envSetupPath = path.join(ROOT_DIR, 'scripts/boot/lib/environment_setup.sh');
    const content = await fs.readFile(envSetupPath, 'utf8');

    expect(content).toMatch(/export.*NODE_OPTIONS/);
    expect(content).toMatch(/export.*LIV_MODE/);
    expect(content).toMatch(/export.*REDIS_HOST/);
    expect(content).toMatch(/export.*REDIS_PORT/);
  });

  test('Validation checks required prerequisites', async () => {
    const validationPath = path.join(ROOT_DIR, 'scripts/boot/lib/validation.sh');
    const content = await fs.readFile(validationPath, 'utf8');

    expect(content).toMatch(/preflight_checks/);
    expect(content).toMatch(/command -v/);
    expect(content).toMatch(/redis-server/);
    expect(content).toMatch(/tmux/);
  });

  test('Service management starts required services', async () => {
    const serviceMgmtPath = path.join(ROOT_DIR, 'scripts/boot/lib/service_management.sh');
    const content = await fs.readFile(serviceMgmtPath, 'utf8');

    expect(content).toMatch(/start_services/);
    expect(content).toMatch(/start_redis/);
    expect(content).toMatch(/start_reasoning_gateway/);
    expect(content).toMatch(/start_orchestration/);
  });

  test('Agent management spawns required agents', async () => {
    const agentMgmtPath = path.join(ROOT_DIR, 'scripts/boot/lib/agent_management.sh');
    const content = await fs.readFile(agentMgmtPath, 'utf8');

    expect(content).toMatch(/spawn_agents/);
    const agentNames = ['planning', 'research', 'artifact', 'execmon', 'qa'];
    for (const agent of agentNames) {
      expect(content).toMatch(new RegExp(`spawn_agent.*${agent}`));
    }
  });
});