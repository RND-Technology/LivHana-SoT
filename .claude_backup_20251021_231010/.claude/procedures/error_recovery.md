# Error Recovery Procedures

**Last Updated:** 2025-10-21
**Based On:** AGENT_DEPLOYMENT_FORENSIC_ANALYSIS_2025-10-21.md
**Purpose:** Step-by-step recovery procedures for common session failures

---

## Table of Contents

1. [Voice Mode STT Timeout](#voice-mode-stt-timeout)
2. [Missing API Keys](#missing-api-keys)
3. [Agent Coordination Conflicts](#agent-coordination-conflicts)
4. [Resource Exhaustion](#resource-exhaustion)
5. [State Corruption](#state-corruption)
6. [Service Crash Recovery](#service-crash-recovery)
7. [Emergency Session Abort](#emergency-session-abort)

---

## Voice Mode STT Timeout

**Symptoms:**

- Voice input hangs for 30+ seconds
- Error: "STT failed for <http://127.0.0.1:2022/v1> (whisper): Request timed out"
- Fallback to OpenAI fails with 401 auth error

**Root Cause:**

- Whisper service overloaded or crashed
- Missing OPENAI_API_KEY for fallback

### Recovery Steps

#### Immediate Actions (During Session)

1. **Switch to text input** (graceful degradation)

   ```
   Tell Claude: "Let's continue with text input for now"
   Type your next instruction instead of speaking
   ```

2. **Check Whisper service status**

   ```bash
   curl http://127.0.0.1:2022/health
   ```

   If no response:

   ```bash
   mcp__voicemode__service whisper status
   ```

#### Service Recovery

3. **Restart Whisper service**

   ```bash
   mcp__voicemode__service whisper restart
   ```

4. **Verify service is responding**

   ```bash
   curl http://127.0.0.1:2022/v1/models
   ```

   Expected: JSON response with model list

5. **Resume voice mode**

   ```
   Tell Claude: "Voice service is back, let's try voice mode again"
   ```

#### Prevent Future Occurrences

6. **Add OPENAI_API_KEY to environment**

   ```bash
   export OPENAI_API_KEY="sk-your-key-here"

   # Add to ~/.zshrc or ~/.bashrc
   echo 'export OPENAI_API_KEY="sk-your-key-here"' >> ~/.zshrc
   source ~/.zshrc
   ```

7. **Verify MCP server has key**
   Edit `~/.config/claude/config.json`:

   ```json
   {
     "mcpServers": {
       "voicemode": {
         "env": {
           "OPENAI_API_KEY": "${OPENAI_API_KEY}"
         }
       }
     }
   }
   ```

8. **Add health checks before voice mode**
   Run preflight checks before each session:

   ```bash
   bash scripts/preflight_checks.sh
   ```

---

## Missing API Keys

**Symptoms:**

- 401 authentication errors
- "You didn't provide an API key" messages
- Service fallbacks fail
- Pipeline steps fail

**Root Cause:**

- API keys not set in environment
- Keys not passed to services/MCP servers
- Keys invalid or expired

### Recovery Steps

#### Identify Missing Keys

1. **Check which keys are missing**

   ```bash
   bash scripts/preflight_checks.sh
   ```

   Look for FAIL messages about API keys

2. **Common required keys:**
   - `OPENAI_API_KEY` - Voice mode fallback, ChatGPT steps
   - `ANTHROPIC_API_KEY` - Claude API
   - `DEEPSEEK_API_KEY` - Reasoning gateway
   - `PERPLEXITY_API_KEY` - TRUTH verification

#### Set Missing Keys

3. **Set in current session**

   ```bash
   export OPENAI_API_KEY="sk-..."
   export ANTHROPIC_API_KEY="sk-ant-..."
   export DEEPSEEK_API_KEY="..."
   export PERPLEXITY_API_KEY="pplx-..."
   ```

4. **Persist for future sessions**

   ```bash
   # Add to shell config
   cat >> ~/.zshrc <<EOF
   export OPENAI_API_KEY="sk-..."
   export ANTHROPIC_API_KEY="sk-ant-..."
   export DEEPSEEK_API_KEY="..."
   export PERPLEXITY_API_KEY="pplx-..."
   EOF

   source ~/.zshrc
   ```

5. **Verify keys are valid**

   ```bash
   # Test OpenAI key
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"

   # Test Anthropic key
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":1024,"messages":[{"role":"user","content":"test"}]}'

   # Test Perplexity key
   curl https://api.perplexity.ai/chat/completions \
     -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"sonar","messages":[{"role":"user","content":"test"}]}'
   ```

#### Update Service Configurations

6. **Update MCP server configs** (if using)
   Edit `~/.config/claude/config.json` to pass keys to services

7. **Restart affected services**

   ```bash
   mcp__voicemode__service whisper restart
   mcp__voicemode__service kokoro restart
   ```

---

## Agent Coordination Conflicts

**Symptoms:**

- Multiple agents running simultaneously
- Duplicate work being done
- File conflicts
- Multiple tasks marked "in_progress"
- Session feels chaotic

**Root Cause:**

- Parallel agents spawned without coordination
- No enforcement of "one task in_progress" rule
- Overlapping responsibilities

### Recovery Steps

#### Identify Active Agents

1. **Check agent tracking**

   ```bash
   ls -la .claude/agent_tracking/*.active
   ```

2. **Review each agent's task**

   ```bash
   for f in .claude/agent_tracking/*.active; do
     echo "Agent: $(basename $f .active)"
     grep "TASK:" "$f"
     grep "OUTPUT:" "$f"
     echo "---"
   done
   ```

#### Stop Conflicting Agents

3. **Determine which agent to keep**
   - Keep the agent with the most critical task
   - Keep the agent that started first (if equal priority)
   - Keep the agent with less conflicting output

4. **Mark other agents as completed**

   ```bash
   # For each agent to stop
   mv .claude/agent_tracking/AGENT_ID.active \
      .claude/agent_tracking/AGENT_ID.stopped
   ```

5. **Tell Claude to focus on remaining agent**

   ```
   "Focus on completing [TASK] only. Pause other work."
   ```

#### Clean Up Todo List

6. **Check todo list compliance**

   ```bash
   # Use runtime validation if available
   python3 scripts/runtime_validation.py
   ```

7. **Fix multiple in_progress tasks**
   - Manually tell Claude which task to focus on
   - Mark others as "pending"

   ```
   "Update todos: mark only [SPECIFIC TASK] as in_progress, others as pending"
   ```

#### Prevent Future Conflicts

8. **Use coordination validator before spawning agents**

   ```bash
   bash scripts/agent_coordination_check.sh \
     --task "Clear task description" \
     --output "path/to/output" \
     --timeout 1800 \
     --agent-id "agent-001"
   ```

9. **Create coordination plan before parallel work**
   - Define agent responsibilities
   - Specify non-overlapping outputs
   - Set clear completion criteria

---

## Resource Exhaustion

**Symptoms:**

- System feels slow
- Services timing out
- "Out of memory" errors
- Disk space warnings
- Token budget exceeded

**Root Cause:**

- Memory leaks from unclosed connections
- Disk full from logs/temp files
- Too many parallel processes
- Token budget not tracked

### Recovery Steps

#### Memory Pressure

1. **Check memory usage**

   ```bash
   # macOS
   vm_stat

   # Linux
   free -h
   ```

2. **Identify memory hogs**

   ```bash
   # macOS
   top -o MEM

   # Linux
   top -o %MEM
   ```

3. **Restart heavy services**

   ```bash
   mcp__voicemode__service whisper restart
   mcp__voicemode__service kokoro restart
   ```

4. **Close unnecessary applications**
   - Close Chrome tabs
   - Quit unused IDEs
   - Stop Docker containers if not needed

#### Disk Space

5. **Check disk usage**

   ```bash
   df -h .
   ```

6. **Clean up logs**

   ```bash
   # Archive old logs
   find logs/ -name "*.log" -mtime +7 -exec gzip {} \;

   # Delete very old logs
   find logs/ -name "*.log.gz" -mtime +30 -delete
   ```

7. **Clean up temp files**

   ```bash
   rm -rf tmp/*.json tmp/*.txt
   rm -rf .claude/agent_tracking/*.completed
   ```

8. **Clean up old checkpoints**

   ```bash
   # Keep only last 10 checkpoints
   cd .claude/checkpoints
   ls -t checkpoint_*.json | tail -n +11 | xargs rm -f
   ```

#### Token Budget

9. **Check token usage**

   ```bash
   cat .claude/token_usage.json
   ```

10. **If over budget:**
    - Save state and end session
    - Continue in new session with fresh budget

    ```bash
    bash scripts/checkpoint_state.sh
    # Exit and start new session
    ```

---

## State Corruption

**Symptoms:**

- Session state doesn't match reality
- Files referenced don't exist
- Broken cross-references
- Inconsistent todo list
- Agent tracking out of sync

**Root Cause:**

- Session crash without cleanup
- Manual file operations outside of session
- Failed operations not rolled back

### Recovery Steps

#### Detect Corruption

1. **Run post-action validation**

   ```bash
   bash scripts/post_action_validate.sh --type agent
   ```

2. **Check for broken references**

   ```bash
   # Find broken symlinks
   find . -type l ! -exec test -e {} \; -print

   # Check for mentioned files
   grep -r "TODO\|FIXME" .claude/
   ```

#### Load Last Known Good State

3. **Find latest checkpoint**

   ```bash
   ls -t .claude/checkpoints/checkpoint_*.json | head -1
   ```

4. **Review checkpoint contents**

   ```bash
   jq . .claude/checkpoints/checkpoint_TIMESTAMP.json
   ```

5. **Manually restore from checkpoint**
   - Review what was completed
   - Update todo list to match checkpoint
   - Remove stale agent tracking files

   ```bash
   rm -f .claude/agent_tracking/*.active
   ```

#### Rebuild State

6. **Verify current file state**

   ```bash
   git status
   ```

7. **Reconcile with checkpoint**
   - Compare checkpoint state with actual files
   - Document discrepancies
   - Decide whether to:
     - Roll back to checkpoint (lose recent work)
     - Roll forward (accept current state)

8. **Clean up inconsistencies**

   ```bash
   # Remove stale tracking
   find .claude/agent_tracking -name "*.active" -mtime +1 -delete

   # Archive completed agents
   for f in .claude/agent_tracking/*.active; do
     mv "$f" "${f%.active}.recovered"
   done
   ```

---

## Service Crash Recovery

**Symptoms:**

- Service not responding
- Connection refused errors
- Timeout errors
- Port not listening

**Root Cause:**

- Service crashed
- Service hung
- Port conflict
- Resource exhaustion

### Recovery Steps

#### Identify Crashed Service

1. **Check service status**

   ```bash
   mcp__voicemode__service whisper status
   mcp__voicemode__service kokoro status
   ```

2. **Check ports**

   ```bash
   lsof -i :2022  # Whisper
   lsof -i :8880  # Kokoro
   lsof -i :8000  # Compliance
   ```

#### Restart Service

3. **Stop service (if running)**

   ```bash
   mcp__voicemode__service whisper stop
   ```

4. **Check for stuck processes**

   ```bash
   ps aux | grep whisper
   ps aux | grep kokoro

   # Kill if stuck
   pkill -f whisper
   pkill -f kokoro
   ```

5. **Start service**

   ```bash
   mcp__voicemode__service whisper start
   ```

6. **Verify service is healthy**

   ```bash
   curl http://127.0.0.1:2022/health
   curl http://127.0.0.1:8880/health
   ```

#### Check Logs

7. **Review service logs**

   ```bash
   mcp__voicemode__service whisper logs
   ```

8. **Look for error patterns**
   - Out of memory
   - Segmentation faults
   - Connection timeouts
   - Resource limits

#### Prevent Future Crashes

9. **Add health monitoring**

   ```bash
   # Start session monitor in background
   bash scripts/session_monitor.sh &
   ```

10. **Set resource limits** (if needed)

    ```bash
    # Limit memory usage (example)
    ulimit -m 4194304  # 4GB
    ```

---

## Emergency Session Abort

**When to Use:**

- Session is completely stuck
- Cascading failures
- Data corruption risk
- Resource exhaustion critical

### Abort Procedure

#### Save What You Can

1. **Create emergency checkpoint**

   ```bash
   mkdir -p .claude/emergency_checkpoints
   DATE=$(date +%Y%m%d_%H%M%S)

   # Save current state
   git status > .claude/emergency_checkpoints/git_status_$DATE.txt
   cp .claude/agent_tracking/*.active .claude/emergency_checkpoints/ 2>/dev/null || true
   env | grep API_KEY > .claude/emergency_checkpoints/env_$DATE.txt
   ```

2. **Save session logs**

   ```bash
   cp logs/claude_tier1_boot_*.log .claude/emergency_checkpoints/
   cp .claude/session_alerts.log .claude/emergency_checkpoints/ 2>/dev/null || true
   ```

#### Clean Shutdown

3. **Stop monitoring**

   ```bash
   pkill -f session_monitor.sh
   ```

4. **Clean up agent tracking**

   ```bash
   # Mark all active agents as aborted
   for f in .claude/agent_tracking/*.active; do
     if [[ -f "$f" ]]; then
       mv "$f" "${f%.active}.aborted"
     fi
   done
   ```

5. **Stop services gracefully**

   ```bash
   mcp__voicemode__service whisper stop
   mcp__voicemode__service kokoro stop
   ```

#### Exit Session

6. **Document abort reason**

   ```bash
   cat > .claude/emergency_checkpoints/abort_reason_$DATE.txt <<EOF
   Session aborted at: $(date)
   Reason: [DESCRIBE REASON]

   State before abort:
   - Active agents: [LIST]
   - In-progress tasks: [LIST]
   - Critical issues: [DESCRIBE]

   Recovery needed:
   - [LIST RECOVERY STEPS]
   EOF
   ```

7. **Exit Claude session**
   - Save any unsaved work
   - Exit cleanly if possible
   - Force quit if necessary (last resort)

#### Recovery After Abort

8. **Wait for resources to stabilize**

   ```bash
   # Let system recover
   sleep 60

   # Check resources
   vm_stat  # memory
   df -h .  # disk
   ```

9. **Review emergency checkpoint**

   ```bash
   ls -la .claude/emergency_checkpoints/
   cat .claude/emergency_checkpoints/abort_reason_*.txt
   ```

10. **Decide on recovery strategy**
    - **Option A:** Start fresh session (safest)
    - **Option B:** Restore from last checkpoint
    - **Option C:** Continue from emergency checkpoint (risky)

11. **Run full validation before restarting**

    ```bash
    bash scripts/preflight_checks.sh
    ```

---

## General Recovery Principles

### Before Any Recovery Action

1. **Stop and assess** - Don't rush into fixes
2. **Document current state** - Take notes
3. **Identify root cause** - Don't just treat symptoms
4. **Check for data at risk** - Protect uncommitted work
5. **Have rollback plan** - Know how to undo recovery steps

### During Recovery

1. **Fix one thing at a time** - Don't compound issues
2. **Verify each step** - Check that fix worked
3. **Monitor for side effects** - Watch for new problems
4. **Document what you do** - For future reference

### After Recovery

1. **Run validation** - Ensure system healthy
2. **Update procedures** - If you learned something new
3. **Prevent recurrence** - Add checks/guards
4. **Document incident** - For forensic analysis

---

## Quick Reference: Common Commands

```bash
# Pre-flight validation
bash scripts/preflight_checks.sh

# Check service status
mcp__voicemode__service whisper status
mcp__voicemode__service kokoro status

# Restart services
mcp__voicemode__service whisper restart
mcp__voicemode__service kokoro restart

# Check agent coordination
bash scripts/agent_coordination_check.sh --task "..." --output "..."

# Validate outputs
bash scripts/post_action_validate.sh --type agent --output "..."

# Start monitoring
bash scripts/session_monitor.sh &

# Emergency checkpoint
mkdir -p .claude/emergency_checkpoints
git status > .claude/emergency_checkpoints/git_status_$(date +%Y%m%d_%H%M%S).txt

# Clean up stale agents
rm -f .claude/agent_tracking/*.active
```

---

## Getting Help

If none of these procedures work:

1. **Check forensic analysis** - Review AGENT_DEPLOYMENT_FORENSIC_ANALYSIS_2025-10-21.md
2. **Review session logs** - Look for patterns in logs/
3. **Check system resources** - vm_stat, df -h, top
4. **Consult documentation** - docs/ folder
5. **Ask Jesse** - Last resort for critical decisions

---

**Remember:**

- Verification over Generation
- Cooperation over Competition
- Planning over Execution
- Recovery over Panic

Save early, save often. When in doubt, checkpoint and restart.
