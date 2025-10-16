### Service Isolation Requirements

**File**: `/backend/reasoning-gateway/Dockerfile`

```dockerfile
FROM node:20-alpine  # ← Standardize to Node 20
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev  # ← GOOD: Production deps only
COPY src ./src
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
```

**Improvements Needed:**

1. Multi-stage build to reduce image size
2. Non-root user for security
3. Health check instruction
4. Resource limits

**Recommended Dockerfile:**

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:nodejs src ./src

USER appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:4002/healthz', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

ENV NODE_ENV=production
EXPOSE 4002
CMD ["node", "src/index.js"]
```

---
