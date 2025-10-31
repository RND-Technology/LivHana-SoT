// tests/unit/watchdog-scripts.test.js (refactored for script-specific features)
const fs = require('fs/promises');
const path = require('path');

describe('Watchdog Scripts Tests', () => {
  const ROOT_DIR = path.join(process.cwd());
  const WATCHDOG_DIR = path.join(ROOT_DIR, 'scripts/watchdogs');

  // Script capability matrix (avoids false negatives)
  const meta = {
    'claude_tier1_auto_save.sh': { flock: true, cleanup: true, main: true, logging: [/log\(/, /log_error\(/], atomic: true },
    'tier1_supervisor.sh': { flock: true, cleanup: true, main: true, logging: [/Supervisor/, /TIER-1 SUPERVISOR/], atomic: true },
    'auto_save_local.sh': { flock: false, cleanup: true, main: false, logging: [/log\(/], atomic: false },
    'voice_services_watch.sh': { flock: false, cleanup: false, main: false, logging: [/jlog/], atomic: false },
    'agent_status_realtime_logger.sh': { flock: false, cleanup: true, main: false, logging: [/Real-time agent status logger/], atomic: false },
    'op_secret_guard.sh': { flock: false, cleanup: false, main: false, logging: [/1Password Secret Guard/], atomic: false }
  };

  const watchdogs = Object.keys(meta);

  test.each(watchdogs)('%s exists and is executable', async (watchdog) => {
    const watchdogPath = path.join(WATCHDOG_DIR, watchdog);
    const stats = await fs.stat(watchdogPath);
    expect(stats.isFile()).toBe(true);
    if (process.platform !== 'win32') {
      const mode = stats.mode;
      const isExecutable = !!(mode & parseInt('111', 8));
      expect(isExecutable).toBe(true);
    }
  });

  test.each(watchdogs)('%s has proper shebang and strict mode', async (watchdog) => {
    const content = await fs.readFile(path.join(WATCHDOG_DIR, watchdog), 'utf8');
    expect(content.startsWith('#!/usr/bin/env bash')).toBe(true);
    expect(content).toMatch(/set -euo pipefail/);
  });

  test.each(watchdogs)('%s logging pattern matches', async (watchdog) => {
    const { logging } = meta[watchdog];
    const content = await fs.readFile(path.join(WATCHDOG_DIR, watchdog), 'utf8');
    logging.forEach((pattern) => {
      expect(content).toMatch(pattern);
    });
  });

  test.each(watchdogs)('%s flock / lock usage as declared', async (watchdog) => {
    const { flock } = meta[watchdog];
    const content = await fs.readFile(path.join(WATCHDOG_DIR, watchdog), 'utf8');
    const hasFlock = /flock\s/.test(content);
    expect(hasFlock).toBe(flock);
  });

  test.each(watchdogs)('%s cleanup trap presence as declared', async (watchdog) => {
    const { cleanup } = meta[watchdog];
    const content = await fs.readFile(path.join(WATCHDOG_DIR, watchdog), 'utf8');
    const hasCleanup = /trap 'cleanup/.test(content) || /trap '.*exit 0'/.test(content);
    expect(hasCleanup).toBe(cleanup);
  });

  test.each(watchdogs)('%s main loop presence as declared', async (watchdog) => {
    const { main } = meta[watchdog];
    const content = await fs.readFile(path.join(WATCHDOG_DIR, watchdog), 'utf8');
    const hasMain = /main\(\) \{/.test(content) && /while\s+true/.test(content);
    expect(hasMain).toBe(main);
  });

  test('claude_tier1_auto_save.sh guard rails present', async () => {
    const content = await fs.readFile(path.join(WATCHDOG_DIR, 'claude_tier1_auto_save.sh'), 'utf8');
    ['check_repo_health', 'check_clean_staging', 'check_rate_limit', 'check_disk_space'].forEach(fn => {
      expect(content).toMatch(new RegExp(fn));
    });
  });

  test('claude_tier1_auto_save.sh atomic status write', async () => {
    const content = await fs.readFile(path.join(WATCHDOG_DIR, 'claude_tier1_auto_save.sh'), 'utf8');
    // Verify temp file pattern and atomic move
    expect(content).toMatch(/STATUS_FILE\.tmp/);
    expect(content).toMatch(/mv "\$STATUS_FILE\.tmp" "\$STATUS_FILE"/);
    expect(content).toMatch(/atomic move/); // comment marker
  });

  test('tier1_supervisor.sh atomic status write', async () => {
    const content = await fs.readFile(path.join(WATCHDOG_DIR, 'tier1_supervisor.sh'), 'utf8');
    expect(content).toMatch(/STATUS_FILE\.tmp/);
    expect(content).toMatch(/mv "\$STATUS_FILE\.tmp" "\$STATUS_FILE"/);
    expect(content).toMatch(/atomic move/);
  });

  test('voice_services_watch.sh health probing logic', async () => {
    const content = await fs.readFile(path.join(WATCHDOG_DIR, 'voice_services_watch.sh'), 'utf8');
    const tokens = [
      'curl --max-time',
      '/health',
      'kickstart',
      'restart',
      'Watchdog cycle complete'
    ];
    tokens.forEach(token => {
      // Escape regex special chars but keep spaces intact
      const pattern = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(content).toMatch(new RegExp(pattern));
    });
  });

  test('op_secret_guard.sh secret checks', async () => {
    const content = await fs.readFile(path.join(WATCHDOG_DIR, 'op_secret_guard.sh'), 'utf8');
    ['1Password', 'op whoami', 'DATABASE_URL', 'JWT_SECRET'].forEach(token => {
      expect(content).toMatch(new RegExp(token.replace(/[-/]/g, x => `\${x}`)));
    });
  });

  test('agent_status_realtime_logger.sh metrics and status flow', async () => {
    const content = await fs.readFile(path.join(WATCHDOG_DIR, 'agent_status_realtime_logger.sh'), 'utf8');
    ['memory_mb', 'health', 'agents', 'metrics'].forEach(token => {
      expect(content).toMatch(new RegExp(token));
    });
  });
});