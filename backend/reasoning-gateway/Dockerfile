FROM node:20-alpine

WORKDIR /app

# Copy reasoning-gateway package files first for better caching
COPY reasoning-gateway/package*.json ./
RUN npm ci --only=production

# Copy common directory
COPY common ./common

# Copy reasoning-gateway source code
COPY reasoning-gateway/src ./src

ENV NODE_ENV=production
EXPOSE 4002
CMD ["node", "src/index.js"]

# Optimized: 2025-10-02
