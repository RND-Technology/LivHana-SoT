# Quick Test Commands

## Test Boot Without Hang

```bash
ALLOW_TEXT_ONLY=1 bash /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh
```

## Test 1Password Secrets

```bash
OP_ACCOUNT_SLUG=reggiedro.1password.com bash -c '
  op whoami >/dev/null && echo "✅ op whoami ok" || echo "❌ op whoami failed"
  op run --account "$OP_ACCOUNT_SLUG" --env-file /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service/.env.op -- sh -c "printenv DATABASE_URL JWT_SECRET LIGHTSPEED_TOKEN >/dev/null" && echo "✅ .env.op expansion ok" || echo "❌ .env.op expansion failed"
'
```

## Test Integration Service Health

```bash
curl -sf http://localhost:3005/health && echo "✅ Health endpoint ok" || echo "❌ Health endpoint failed"
```

## Test Log Scrubbing

```bash
if grep -Ei "(key=|token=|authorization:|Bearer )" -n /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/logs/integration-service.log | grep -v "concealed by 1Password"; then
  echo "❌ Secret found in logs"
else
  echo "✅ Log scrub ok"
fi
```

## Complete QA Suite

```bash
OP_ACCOUNT_SLUG=reggiedro.1password.com bash << 'EOF'
set -e
echo "Testing 1Password..."
op whoami >/dev/null && echo "✅ op whoami ok" || (echo "❌ op whoami failed" && exit 1)
op run --account "$OP_ACCOUNT_SLUG" --env-file /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service/.env.op -- sh -c "printenv DATABASE_URL JWT_SECRET LIGHTSPEED_TOKEN >/dev/null" && echo "✅ .env.op ok" || (echo "❌ .env.op failed" && exit 1)
echo "Testing integration service..."
curl -sf http://localhost:3005/health >/dev/null && echo "✅ Health ok" || (echo "❌ Health failed" && exit 1)
echo "Testing log scrubbing..."
if grep -Ei "(key=|token=|authorization:|Bearer )" -n /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/logs/integration-service.log | grep -v "concealed by 1Password"; then
  echo "❌ Secret in logs" && exit 1
fi
echo "✅ Log scrub ok"
echo ""
echo "🎉 QA GREEN: All checks passed"
EOF
```

## Kill Stuck Processes

```bash
# Kill port 3005 process
lsof -ti :3005 | xargs kill -TERM 2>/dev/null || true
sleep 2
lsof -ti :3005 | xargs kill -KILL 2>/dev/null || true

# Kill stuck boot process
pkill -f claude_tier1_boot.sh
```

## Exit Stuck Quote Prompt

If stuck in a quote prompt (`quote>`), press:
1. `Ctrl+C` (may need multiple times)
2. Or type: `'` then Enter

## What We Fixed

1. ✅ Boot hang on Claude model check (added timeout + ALLOW_TEXT_ONLY support)
2. ✅ Indentation fix in integration-service startup
3. ✅ Added 1Password watchdog
4. ✅ Added port 3005 guard
5. ✅ Added dependency readiness gates

## Next Boot Test

```bash
ALLOW_TEXT_ONLY=1 claude-tier1
```

This should now complete without hanging!

