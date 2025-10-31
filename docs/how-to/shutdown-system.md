# How to Shutdown LivHana System

**Format**: Diátaxis How-To Guide
**Audience**: Developers and operators
**Status**: Production Ready

---

## Quick Shutdown

To gracefully stop all LivHana services:

```bash
bash STOP.sh
```

This will:
1. Stop all tmux agent sessions
2. Stop Docker services
3. Drain Redis queues (max 30s wait)
4. Stop Redis server
5. Kill watchdog processes
6. Clean up lock files
7. Validate complete shutdown

**Expected time**: 30-60 seconds

---

## Force Shutdown

If the graceful shutdown fails or takes too long:

```bash
bash STOP.sh --force
```

This immediately kills all processes without waiting. Use only when:
- System is unresponsive
- Emergency shutdown needed
- Graceful shutdown failed

⚠️ **Warning**: Force shutdown may leave incomplete jobs in Redis queues.

---

## What Gets Stopped

### 1. Tmux Agent Sessions

Stopped in this order:
- `reasoning-gateway`
- `orchestration`
- `planning`
- `research`
- `artifact`
- `execmon`
- `qa`

Each session receives SIGTERM first, then SIGKILL if unresponsive after 2 seconds.

### 2. Docker Services

All containers labeled with `com.docker.compose.project=LivHana-SoT` are stopped via:
- `docker-compose down --remove-orphans` (if docker-compose.yml exists)
- `docker compose down --remove-orphans` (newer Docker CLI syntax)

### 3. Redis Queues

Before stopping Redis, the script:
1. Checks queue depth for `voice-mode-reasoning-jobs`
2. Waits up to 30 seconds for jobs to complete
3. Logs a warning if jobs remain (but continues shutdown)

This prevents job loss during normal operations.

### 4. Redis Server

Redis receives:
1. SIGTERM (graceful shutdown)
2. 2-second wait
3. SIGKILL if still running (force kill)

### 5. Watchdog Processes

These background processes are terminated:
- `claude_tier1_auto_save`
- `tier1_supervisor`
- `auto_save_local`
- `voice_services_watch`
- `agent_status_realtime_logger`
- `op_secret_guard`

### 6. Lock Files

Removed files:
- `tmp/claude_tier1_auto_save.lock`
- `tmp/tier1_supervisor.lock`
- `tmp/auto_save_local.lock`
- `.claude/instance_lock.json`
- `tmp/voice_auto_launch.flag`
- Any `.tmp` files older than 1 hour

---

## Validation

After shutdown, the script checks:

✅ **No tmux sessions running**
✅ **Redis port 6379 is free**
✅ **No Docker containers running**
✅ **No orphaned processes**

If any checks fail, the script:
1. Logs a warning
2. Attempts force cleanup
3. Re-runs validation

Exit codes:
- `0` = Clean shutdown
- `1` = Issues detected (see logs)

---

## Troubleshooting

### Issue: "Instance lock owned by different user"

**Cause**: Another user started the system
**Solution**: Ask that user to run STOP.sh, or use `sudo` (not recommended)

```bash
# Check who owns the lock
jq '.' .claude/instance_lock.json

# If safe, manually remove lock and retry
rm .claude/instance_lock.json
bash STOP.sh
```

### Issue: "Tmux sessions still running" after shutdown

**Cause**: Processes didn't respond to SIGTERM
**Solution**: Use force mode

```bash
bash STOP.sh --force
```

Or manually kill:

```bash
tmux ls
tmux kill-session -t session-name
```

### Issue: "Redis still running on port 6379"

**Cause**: Multiple Redis instances or port conflict
**Solution**: Check processes on port 6379

```bash
lsof -i :6379
kill -9 <PID>
```

### Issue: "Docker containers still running"

**Cause**: Docker daemon issues or stale containers
**Solution**: Manually stop

```bash
docker ps | grep LivHana
docker stop <container-id>
docker rm <container-id>
```

---

## Advanced Usage

### Dry Run (Check What Would Stop)

```bash
# View active services without stopping
tmux ls
docker ps
lsof -i :6379
pgrep -f "watchdog"
```

### Partial Shutdown

Stop only specific components:

```bash
# Stop only agents (keep Redis/Docker running)
tmux kill-session -t planning
tmux kill-session -t research

# Stop only Docker
docker-compose down

# Stop only Redis
redis-cli -p 6379 shutdown
```

### Monitor Shutdown

Watch the process:

```bash
bash STOP.sh 2>&1 | tee /tmp/shutdown-$(date +%s).log
```

---

## Re-Starting After Shutdown

```bash
bash START.sh
```

See [startup-system.md](startup-system.md) for details.

---

## Safety Checks

STOP.sh performs these safety checks before shutdown:

1. **Instance ownership verification**
   - Ensures you started the system
   - Prevents accidental shutdown of others' instances

2. **Graceful termination**
   - SIGTERM before SIGKILL
   - Allows processes to clean up

3. **Queue draining**
   - Waits for active jobs to complete
   - Prevents data loss

4. **Validation pass**
   - Confirms everything stopped
   - Reports any lingering processes

---

## Emergency Recovery

If STOP.sh fails completely:

```bash
# Nuclear option: Kill everything
pkill -f "LivHana"
pkill -f "voice-service"
pkill -f "reasoning-gateway"
pkill -f "orchestration"
redis-cli shutdown
docker stop $(docker ps -q)

# Clean locks
find . -name "*.lock" -delete
rm .claude/instance_lock.json

# Verify clean state
lsof -i :6379  # Should show nothing
docker ps      # Should show nothing
tmux ls        # Should show nothing or "no server running"
```

---

## See Also

- [startup-system.md](startup-system.md) - How to start LivHana
- [system-architecture.md](../architecture/system-architecture.md) - System components
- [redis-queues.md](../architecture/redis-queues.md) - Queue management

---

**Last Updated**: 2025-10-31
**Tested**: M4 Max macOS Sequoia
**Status**: ✅ Production Ready
