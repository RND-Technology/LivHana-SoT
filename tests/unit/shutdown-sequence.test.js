// tests/unit/shutdown-sequence.test.js
const fs = require('fs/promises');
const path = require('path');

describe('Shutdown Sequence Tests', () => {
  const ROOT_DIR = path.join(process.cwd());
  const STOP_SCRIPT = path.join(ROOT_DIR, 'STOP.sh');

  test('STOP.sh script exists and is executable', async () => {
    const stats = await fs.stat(STOP_SCRIPT);
    expect(stats.isFile()).toBe(true);

    // Check if executable (on Unix systems)
    if (process.platform !== 'win32') {
      const mode = stats.mode;
      const isExecutable = !!(mode & parseInt('111', 8));
      expect(isExecutable).toBe(true);
    }
  });

  test('STOP.sh has proper shebang and error handling', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');
    expect(content.startsWith('#!/usr/bin/env bash')).toBe(true);
    expect(content).toMatch(/set -euo pipefail/);
  });

  test('STOP.sh sources required libraries', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    expect(content).toMatch(/source.*lib\/instance_lock\.sh/);
    expect(content).toMatch(/source.*lib\/service_management\.sh/);
    expect(content).toMatch(/source.*lib\/agent_management\.sh/);
  });

  test('STOP.sh implements graceful shutdown sequence', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    expect(content).toMatch(/stop_tmux_sessions/);
    expect(content).toMatch(/stop_docker_services/);
    expect(content).toMatch(/stop_redis/);
    expect(content).toMatch(/kill_watchdogs/);
    expect(content).toMatch(/cleanup_files/);
  });

  test('STOP.sh handles tmux session shutdown', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    expect(content).toMatch(/tmux.*has-session/);
    expect(content).toMatch(/tmux.*send-keys.*C-c/);
    expect(content).toMatch(/tmux.*kill-session/);

    // Check for all expected sessions
    const sessions = ['reasoning-gateway', 'orchestration', 'planning', 'research', 'artifact', 'execmon', 'qa'];
    for (const session of sessions) {
      expect(content).toMatch(new RegExp(`"${session}"`));
    }
  });

  test('STOP.sh handles Docker service shutdown', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    expect(content).toMatch(/docker-compose.*down/);
    expect(content).toMatch(/docker.*compose.*down/);
    expect(content).toMatch(/--remove-orphans/);
  });

  test('STOP.sh handles Redis shutdown', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    expect(content).toMatch(/lsof.*REDIS_PORT/);
    expect(content).toMatch(/kill.*TERM/);
    expect(content).toMatch(/sleep.*[0-9]/);
  });

  test('STOP.sh kills watchdog processes', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    const watchdogs = ['claude_tier1_auto_save', 'tier1_supervisor', 'auto_save_local', 'voice_services_watch', 'agent_status_realtime_logger', 'op_secret_guard'];
    for (const watchdog of watchdogs) {
      expect(content).toMatch(new RegExp(`"${watchdog}"`));
    }

    expect(content).toMatch(/pgrep.*-f/);
    expect(content).toMatch(/kill.*TERM/);
  });

  test('STOP.sh cleans up files and locks', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    expect(content).toMatch(/rm.*lock/);
    expect(content).toMatch(/rm.*flag/);
    expect(content).toMatch(/find.*tmp.*delete/);
  });

  test('STOP.sh performs final validation', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    expect(content).toMatch(/final_validation/);
    expect(content).toMatch(/tmux.*ls/);
    expect(content).toMatch(/lsof.*REDIS_PORT/);
    expect(content).toMatch(/docker.*ps/);
    expect(content).toMatch(/pgrep.*LivHana/);
  });

  test('STOP.sh has force cleanup option', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    expect(content).toMatch(/force_cleanup/);
    expect(content).toMatch(/kill.*-9/);
    expect(content).toMatch(/--force/);
  });

  test('STOP.sh provides help and usage information', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    expect(content).toMatch(/--help/);
    expect(content).toMatch(/Usage:/);
    expect(content).toMatch(/Options:/);
  });

  test('STOP.sh handles instance ownership checking', async () => {
    const content = await fs.readFile(STOP_SCRIPT, 'utf8');

    expect(content).toMatch(/check_instance_ownership/);
    expect(content).toMatch(/instance_lock\.json/);
    expect(content).toMatch(/jq.*pid/);
    expect(content).toMatch(/jq.*user/);
  });
});