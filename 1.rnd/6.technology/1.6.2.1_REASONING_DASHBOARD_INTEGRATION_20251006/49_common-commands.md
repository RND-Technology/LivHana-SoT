### Common Commands

```bash
# Regenerate JWT token
cd backend/reasoning-gateway && node scripts/generate-dev-token.js

# Test JWT validation
node scripts/test-jwt.js "<your-token-here>"

# Check running services
lsof -i :4002  # reasoning-gateway
lsof -i :5173  # vibe-cockpit

# Restart services
pkill -f "reasoning-gateway"
npm run dev
```

---
