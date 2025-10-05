# Delivery Service Docker Image
# Multi-stage build for optimized production image

FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy common modules
COPY common ./common

# Copy service code
COPY delivery-service ./delivery-service

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy only necessary files from base
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/common ./common
COPY --from=base /app/delivery-service ./delivery-service

# Set working directory to service
WORKDIR /app/delivery-service

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3007

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3007/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start service
CMD ["node", "src/index.js"]
