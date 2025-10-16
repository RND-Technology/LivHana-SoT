### Quick Start (5 minutes)

1. **Install dependencies:**

   ```bash
   cd backend/common && npm install
   cd ../reasoning-gateway && npm install
   ```

2. **Configure environment:**

   ```bash
   # In .env.runtime
   ENABLE_MEMORY_LEARNING=true
   MEMORY_REDIS_URL=redis://localhost:6379
   MEMORY_ENCRYPTION_KEY=$(openssl rand -hex 32)
   ```

3. **Start Redis:**

   ```bash
   docker run -d -p 6379:6379 redis:latest
   ```

4. **Start service:**

   ```bash
   cd backend/reasoning-gateway
   npm run dev
   ```

5. **Test the system:**

   ```bash
   node backend/common/memory/example.js
   ```
