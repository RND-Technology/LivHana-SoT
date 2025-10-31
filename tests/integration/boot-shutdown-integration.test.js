// tests/integration/boot-shutdown-integration.test.js
const { jest } = require('@jest/globals');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs/promises');
const path = require('path');

const execAsync = promisify(exec);

describe('Boot-Shutdown Integration Tests', () => {
  const ROOT_DIR = path.join(process.cwd());
  const START_SCRIPT = path.join(ROOT_DIR, 'START.sh');
  const STOP_SCRIPT = path.join(ROOT_DIR, 'STOP.sh');

  beforeEach(async () => {
    // Ensure clean state
    await global.testUtils.cleanupProcesses();

    // Clean any existing locks and flags
    const filesToClean = [
      '.claude/instance_lock.json',
      'tmp/voice_auto_launch.flag',
      'tmp/claude_tier1_auto_save.lock',
      'tmp/tier1_supervisor.lock',
      'tmp/auto_save_local.lock'
    ];

    for (const file of filesToClean) {
      try {
        await fs.unlink(path.join(ROOT_DIR, file));
      } catch (e) {
        // Ignore if file doesn't exist
      }
    }
  });

  afterEach(async () => {
    // Always try to clean up after tests
    try {
      await execAsync(`bash ${STOP_SCRIPT} --force`, { cwd: ROOT_DIR, timeout: 30000 });
    } catch (e) {
      // Ignore cleanup errors in tests
    }
    await global.testUtils.cleanupProcesses();
  });

  test('STOP.sh --help works', async () => {
    const { stdout } = await execAsync(`bash ${STOP_SCRIPT} --help`, { cwd: ROOT_DIR });
    expect(stdout).toMatch(/Usage:/);
    expect(stdout).toMatch(/Options:/);
    expect(stdout).toMatch(/--force/);
    expect(stdout).toMatch(/--help/);
  });

  test('STOP.sh syntax is valid', async () => {
    // Test that the script doesn't have syntax errors
    await expect(execAsync(`bash -n ${STOP_SCRIPT}`, { cwd: ROOT_DIR })).resolves.not.toThrow();
  });

  test('START.sh syntax is valid', async () => {
    // Test that the script doesn't have syntax errors
    await expect(execAsync(`bash -n ${START_SCRIPT}`, { cwd: ROOT_DIR })).resolves.not.toThrow();
  });

  test('Boot libraries are syntactically valid', async () => {
    const libs = [
      'scripts/boot/lib/instance_lock.sh',
      'scripts/boot/lib/environment_setup.sh',
      'scripts/boot/lib/service_management.sh',
      'scripts/boot/lib/agent_management.sh',
      'scripts/boot/lib/validation.sh'
    ];

    for (const lib of libs) {
      const libPath = path.join(ROOT_DIR, lib);
      await expect(execAsync(`bash -n ${libPath}`, { cwd: ROOT_DIR })).resolves.not.toThrow();
    }
  });

  test('Watchdog scripts are syntactically valid', async () => {
    const watchdogs = [
      'scripts/watchdogs/claude_tier1_auto_save.sh',
      'scripts/watchdogs/tier1_supervisor.sh',
      'scripts/watchdogs/auto_save_local.sh',
      'scripts/watchdogs/voice_services_watch.sh',
      'scripts/watchdogs/agent_status_realtime_logger.sh',
      'scripts/watchdogs/op_secret_guard.sh'
    ];

    for (const watchdog of watchdogs) {
      const watchdogPath = path.join(ROOT_DIR, watchdog);
      await expect(execAsync(`bash -n ${watchdogPath}`, { cwd: ROOT_DIR })).resolves.not.toThrow();
    }
  });

  test('STOP.sh force mode removes lock files', async () => {
    // Create a fake lock file
    const lockDir = path.join(ROOT_DIR, '.claude');
    await fs.mkdir(lockDir, { recursive: true });
    await fs.writeFile(path.join(lockDir, 'instance_lock.json'), '{"pid": 12345, "timestamp": "2025-01-01T00:00:00Z"}');

    // Run force stop
    await execAsync(`bash ${STOP_SCRIPT} --force`, { cwd: ROOT_DIR, timeout: 10000 });

    // Check that lock file is gone
    await expect(fs.access(path.join(lockDir, 'instance_lock.json'))).rejects.toThrow();
  });

  test('STOP.sh force mode removes watchdog locks', async () => {
    const locks = [
      'tmp/claude_tier1_auto_save.lock',
      'tmp/tier1_supervisor.lock',
      'tmp/auto_save_local.lock'
    ];

    // Create fake lock files
    for (const lock of locks) {
      const lockPath = path.join(ROOT_DIR, lock);
      await fs.mkdir(path.dirname(lockPath), { recursive: true });
      await fs.writeFile(lockPath, '12345');
    }

    // Run force stop
    await execAsync(`bash ${STOP_SCRIPT} --force`, { cwd: ROOT_DIR, timeout: 10000 });

    // Check that lock files are gone
    for (const lock of locks) {
      const lockPath = path.join(ROOT_DIR, lock);
      await expect(fs.access(lockPath)).rejects.toThrow();
    }
  });

  test('STOP.sh removes voice auto-launch flag', async () => {
    // Create fake flag file
    const flagPath = path.join(ROOT_DIR, 'tmp/voice_auto_launch.flag');
    await fs.mkdir(path.dirname(flagPath), { recursive: true });
    await fs.writeFile(flagPath, '');

    // Run force stop
    await execAsync(`bash ${STOP_SCRIPT} --force`, { cwd: ROOT_DIR, timeout: 10000 });

    // Check that flag file is gone
    await expect(fs.access(flagPath)).rejects.toThrow();
  });

  test('STOP.sh cleans up old temp files', async () => {
    // Create old temp files
    const tmpDir = path.join(ROOT_DIR, 'tmp');
    await fs.mkdir(tmpDir, { recursive: true });

    const oldFile = path.join(tmpDir, 'old_temp.tmp');
    await fs.writeFile(oldFile, 'test');

    // Touch to make it old (simulate old file)
    const now = Date.now();
    const oldTime = now - (70 * 60 * 1000); // 70 minutes ago
    await fs.utimes(oldFile, oldTime / 1000, oldTime / 1000);

    // Run force stop
    await execAsync(`bash ${STOP_SCRIPT} --force`, { cwd: ROOT_DIR, timeout: 10000 });

    // Check that old temp file is gone
    await expect(fs.access(oldFile)).rejects.toThrow();
  });

  test('Environment setup configures required variables', async () => {
    const envSetupPath = path.join(ROOT_DIR, 'scripts/boot/lib/environment_setup.sh');

    // Source the environment setup and check variables
    const { stdout } = await execAsync(`bash -c "source ${envSetupPath} && echo \$LIV_MODE:\$REDIS_HOST:\$REDIS_PORT"`, { cwd: ROOT_DIR });

    const [livMode, redisHost, redisPort] = stdout.trim().split(':');
    expect(livMode).toBeDefined();
    expect(redisHost).toBeDefined();
    expect(redisPort).toBeDefined();
  });

  test('Validation checks pass in test environment', async () => {
    const validationPath = path.join(ROOT_DIR, 'scripts/boot/lib/validation.sh');

    // Run preflight checks
    const { stdout } = await execAsync(`bash -c "source ${validationPath} && preflight_checks"`, { cwd: ROOT_DIR });

    // Should not contain "❌" (failure indicators)
    expect(stdout).not.toMatch(/❌/);
  });
});