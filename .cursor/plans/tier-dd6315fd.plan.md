<!-- dd6315fd-e9db-4281-bc27-6509e33c3a8d 58a2333f-19e8-4c48-83b8-862e6b2fcc21 -->
# Stable → Unfuckwithable Boot System

## Phase 1: STABILIZE (Now - 30 min)

### Goals
- Zero yellow/red warnings
- Boot always green
- Voice mode ready

### Tasks
1. **Bash alias** (not zsh function)
   ```bash
   alias claude-tier1='bash /path/to/scripts/claude_tier1_boot.sh'
   ```

2. **Interactive comments**
   ```bash
   setopt interactivecomments  # in ~/.zshrc
   ```

3. **1Password hard-fail**
   ```bash
   OP_ACCOUNT_SLUG=reggiedro.1password.com
   whoami=$(op whoami) || exit 1
   [[ -n "$whoami" ]] || exit 1
   ```

4. **Port pre-clear**
   ```bash
   lsof -ti :3005 | xargs -r kill -TERM
   sleep 1; lsof -ti :3005 | xargs -r kill -KILL
   ```

5. **Model gate bypass**
   ```bash
   ALLOW_TEXT_ONLY=1  # continue without Sonnet 4.5
   ```

6. **Log prep**
   ```bash
   mkdir -p logs
   touch logs/integration-service.log
   ```

**Test Command** (from upstream):
```bash
bash -lc 'alias claude-tier1='\''bash /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh'\''; 
OP_ACCOUNT_SLUG=reggiedro.1password.com ALLOW_TEXT_ONLY=1 
op whoami || op signin --account "$OP_ACCOUNT_SLUG"; 
lsof -ti :3005 | xargs -r kill -TERM; sleep 1; lsof -ti :3005 | xargs -r kill -KILL; 
mkdir -p logs; : > logs/integration-service.log; 
claude-tier1 && curl -sf http://localhost:3005/health && tmux attach -t liv-voice'
```

---

## Phase 2: HARDEN (Today - 2 hours)

### Security
1. **Secrets preflight**
   ```bash
   for secret in DATABASE_URL JWT_SECRET LIGHTSPEED_TOKEN; do
     op read "op://LivHana-Ops-Keys/$secret/credential" || exit 1
   done
   ```

2. **Log scrubbing**
   ```bash
   chmod 600 logs/*.log
   sed -E 's/(key|token|secret)=\S+/\1=***REDACTED***/gi'
   ```

3. **Agent heartbeat validation**
   ```bash
   validate_agent() {
     tmux has-session -t "$1" && \
     [[ -f "tmp/agent_status/$1.status.json" ]] && \
     jq -e '.agent == "'$1'"' "tmp/agent_status/$1.status.json"
   }
   ```

### Reliability
4. **wait_for_service** (not sleep)
   ```bash
   wait_for_service 3005 30 2 || exit 1
   ```

5. **Node 20 guard** (all contexts)
   ```bash
   node -v | grep -q '^v20\.' || exit 1
   ```

6. **Compose healthcheck**
   ```yaml
   services:
     integration-service:
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:3005/health"]
         interval: 10s
         timeout: 5s
         retries: 3
   ```

---

## Phase 3: CI GATES (Hold the Line - 1 hour)

### Preflight Job (.github/workflows/boot-preflight.yml)
```yaml
name: Boot Preflight
on: [pull_request]
jobs:
  preflight:
    runs-on: ubuntu-latest
    steps:
      - name: Check 1Password
        run: |
          op whoami | grep -q '@' || exit 1
          
      - name: Expand secrets
        run: |
          op run --env-file .env.op -- sh -c 'printenv DATABASE_URL JWT_SECRET LIGHTSPEED_TOKEN' >/dev/null
          
      - name: Service health
        run: |
          timeout 60 bash -c 'until curl -sf localhost:3005/health; do sleep 2; done'
          
      - name: Log security scan
        run: |
          ! grep -Ei '(key|token|secret)=' logs/integration-service.log
          
      - name: Lint Tier-1
        run: |
          npm run lint -- backend/{voice,reasoning,integration}-service frontend/vibe-cockpit
```

**Fail PR if**:
- 1Password not signed in
- Secrets don't expand
- Health check fails
- Secrets in logs
- Tier-1 lint errors

---

## Acceptance Criteria

### Phase 1 (Stable)
- [ ] `claude-tier1` shows zero red/yellow
- [ ] Boot completes in < 30s
- [ ] Voice session ready (tmux liv-voice)
- [ ] All 5 agents running
- [ ] integration-service port 3005 UP

### Phase 2 (Hardened)
- [ ] Secrets validated before use
- [ ] Logs scrubbed (600 permissions)
- [ ] Agent heartbeats confirmed
- [ ] Service retry logic works
- [ ] Node 20 enforced everywhere

### Phase 3 (Unfuckwithable)
- [ ] CI preflight passes
- [ ] PRs blocked if gates fail
- [ ] No regressions possible
- [ ] Zero manual intervention
- [ ] Production-grade reliability

---

**EXECUTE NOW?** Say "STABILIZE" and I'll apply Phase 1 immediately! 🚀

### To-dos

- [ ] Set bash alias for claude-tier1
- [ ] Add setopt interactivecomments to ~/.zshrc
- [ ] Hard-fail on empty op whoami
- [ ] Pre-clear port 3005 before boot
- [ ] Set ALLOW_TEXT_ONLY=1 default
- [ ] Pre-create logs directory and files
- [ ] Run full boot test and verify all-green
- [ ] Add secrets preflight validation
- [ ] Implement log scrubbing with 600 perms
- [ ] Add agent heartbeat validation
- [ ] Replace sleeps with wait_for_service
- [ ] Enforce Node 20 in all contexts
- [ ] Add healthcheck to docker-compose.yml
- [ ] Create GitHub Actions preflight workflow
- [ ] Wire gates to block PRs on failure