### Step 2: Point Liv Hana to Cursor

Create `backend/reasoning-gateway/.env.local`:

```bash
# Cursor Ultra Bypass Mode
DEEPSEEK_API_KEY=cursor-ultra-proxy
DEEPSEEK_API_BASE_URL=http://localhost:3000/v1
DEEPSEEK_MODEL=claude-sonnet-4.5
CURSOR_ULTRA_MODE=true
```
