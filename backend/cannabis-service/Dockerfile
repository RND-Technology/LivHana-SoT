FROM node:20-alpine

WORKDIR /app

# Install Python for compliance scripts
RUN apk add --no-cache python3 py3-pip

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY docs ./docs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => {if(r.statusCode !== 200) throw new Error()})"

CMD ["node", "src/index.js"]

# Optimized: 2025-10-02
