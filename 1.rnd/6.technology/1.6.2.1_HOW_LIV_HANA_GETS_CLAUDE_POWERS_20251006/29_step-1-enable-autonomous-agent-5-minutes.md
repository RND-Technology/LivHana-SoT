### Step 1: Enable Autonomous Agent (5 minutes)

```bash
cd backend/reasoning-gateway

# Add to .env
echo "ANTHROPIC_API_KEY=your-key-here" >> .env
echo "ENABLE_AUTONOMOUS_AGENT=true" >> .env
echo "ENABLE_SELF_IMPROVEMENT=true" >> .env

# Start service
npm start
```
