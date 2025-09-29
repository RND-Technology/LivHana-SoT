FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY empire/crisis-engine/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY empire/crisis-engine/src ./src
COPY backend/common ../backend/common

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {if(r.statusCode !== 200) throw new Error()})"

CMD ["node", "src/index.js"]
