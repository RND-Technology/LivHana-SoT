FROM node:20-alpine

WORKDIR /app

# Copy voice-service package files first for better caching
COPY voice-service/package*.json ./
RUN npm ci --only=production

# Copy common directory
COPY ../common ./common

# Copy voice-service source code
COPY voice-service/src ./src

ENV NODE_ENV=production
EXPOSE 4001
CMD ["node", "src/index.js"]

# Optimized: 2025-10-02
