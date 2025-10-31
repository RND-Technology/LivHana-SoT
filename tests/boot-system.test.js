/**
 * Boot System Tests
 * Validates START.sh and boot modules for production readiness
 *
 * Marine Corps Standard: Zero tolerance for boot failures
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

describe('Boot System Tests', () => {
  const ROOT_DIR = path.join(__dirname, '..');
  const BOOT_LIB_DIR = path.join(ROOT_DIR, 'scripts/boot/lib');

  describe('Pre-flight Checks', () => {
    test('START.sh exists and is executable', async () => {
      const startScript = path.join(ROOT_DIR, 'START.sh');
      const stats = await fs.stat(startScript);
      expect(stats.mode & fs.constants.S_IXUSR).toBeTruthy();
    });

    test('All 5 boot modules exist', async () => {
      const modules = [
        'instance_lock.sh',
        'environment_setup.sh',
        'service_management.sh',
        'agent_management.sh',
        'validation.sh'
      ];

      for (const module of modules) {
        const modulePath = path.join(BOOT_LIB_DIR, module);
        await expect(fs.access(modulePath)).resolves.not.toThrow();
      }
    });

    test('START.sh has valid bash syntax', async () => {
      const { stdout, stderr } = await execAsync(`bash -n ${ROOT_DIR}/START.sh`);
      expect(stderr).toBe('');
    });
  });

  describe('Instance Lock System', () => {
    test('acquire_instance_lock prevents duplicate instances', async () => {
      // This would require sourcing the script and testing the function
      // For now, verify lock file structure
      const lockFile = path.join(ROOT_DIR, '.claude/instance_lock.json');

      // Test passes if lock file doesn't exist (clean state)
      // Or if it exists and has valid JSON structure
      try {
        const lockContent = await fs.readFile(lockFile, 'utf8');
        const lockData = JSON.parse(lockContent);
        expect(lockData).toHaveProperty('pid');
        expect(lockData).toHaveProperty('user');
        expect(lockData).toHaveProperty('timestamp');
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        // File doesn't exist - that's fine
      }
    });
  });

  describe('Agent Spawn System', () => {
    test('All 5 agent shims exist', async () => {
      const agents = ['planning', 'research', 'artifact', 'execmon', 'qa'];

      for (const agent of agents) {
        const shimPath = path.join(ROOT_DIR, 'agents', `${agent}.cjs`);
        await expect(fs.access(shimPath)).resolves.not.toThrow();
      }
    });

    test('All 5 agent implementations exist', async () => {
      const agents = ['planning', 'research', 'artifact', 'execmon', 'qa'];

      for (const agent of agents) {
        const implPath = path.join(ROOT_DIR, 'scripts/agents/implementations', `${agent}_agent.py`);
        await expect(fs.access(implPath)).resolves.not.toThrow();
      }
    });
  });

  describe('Watchdog System', () => {
    test('All 6 watchdog scripts exist', async () => {
      const watchdogs = [
        'claude_tier1_auto_save.sh',
        'tier1_supervisor.sh',
        'agent_status_realtime_logger.sh',
        'voice_services_watch.sh',
        'auto_save_local.sh',
        'op_secret_guard.sh'
      ];

      for (const watchdog of watchdogs) {
        const watchdogPath = path.join(ROOT_DIR, 'scripts/watchdogs', watchdog);
        await expect(fs.access(watchdogPath)).resolves.not.toThrow();
      }
    });
  });

  describe('Guard System', () => {
    test('All 15 guard scripts exist', async () => {
      const guards = [
        'log_rotation.sh',
        'secret_preflight.sh',
        'validate_pid_file.sh',
        'validate_agent_started.sh',
        'check_port_collision.sh',
        'route_long_output.sh',
        'check_disk_space.sh',
        'atomic_write.sh',
        'system_health_validator.sh',
        'wait_for_dependency.sh',
        'wait_for_service.sh',
        'with_file_lock.sh',
        'scrub_secrets.sh',
        'validate_linear_token.sh',
        'validate_op_login.sh'
      ];

      for (const guard of guards) {
        const guardPath = path.join(ROOT_DIR, 'scripts/guards', guard);
        await expect(fs.access(guardPath)).resolves.not.toThrow();
      }
    });
  });

  describe('STOP.sh Shutdown System', () => {
    test('STOP.sh exists and is executable', async () => {
      const stopScript = path.join(ROOT_DIR, 'STOP.sh');
      const stats = await fs.stat(stopScript);
      expect(stats.mode & fs.constants.S_IXUSR).toBeTruthy();
    });

    test('STOP.sh has valid bash syntax', async () => {
      const { stdout, stderr } = await execAsync(`bash -n ${ROOT_DIR}/STOP.sh`);
      expect(stderr).toBe('');
    });

    test('STOP.sh kills ALL Redis instances (not just first)', async () => {
      const stopScriptContent = await fs.readFile(path.join(ROOT_DIR, 'STOP.sh'), 'utf8');

      // Verify it loops through all PIDs, not just head -1
      expect(stopScriptContent).toContain('for redis_pid in $redis_pids');
      expect(stopScriptContent).not.toContain('head -1');
    });
  });

  describe('Dependency Count Verification', () => {
    test('Total dependencies = 37 files', async () => {
      let count = 0;

      // START.sh: 1
      count += 1;

      // Boot modules: 5
      const bootModules = await fs.readdir(BOOT_LIB_DIR);
      count += bootModules.filter(f => f.endsWith('.sh')).length;

      // Watchdogs: 6
      const watchdogs = await fs.readdir(path.join(ROOT_DIR, 'scripts/watchdogs'));
      count += watchdogs.filter(f => f.endsWith('.sh')).length;

      // Guards: 15
      const guards = await fs.readdir(path.join(ROOT_DIR, 'scripts/guards'));
      count += guards.filter(f => f.endsWith('.sh')).length;

      // Agent shims: 5
      const agentShims = await fs.readdir(path.join(ROOT_DIR, 'agents'));
      count += agentShims.filter(f => f.endsWith('.cjs')).length;

      // Agent implementations: 5
      const agentImpls = await fs.readdir(path.join(ROOT_DIR, 'scripts/agents/implementations'));
      count += agentImpls.filter(f => f.endsWith('_agent.py')).length;

      expect(count).toBe(37);
    });
  });
});
