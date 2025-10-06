FROM node:18-alpine
WORKDIR /app
# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production
# Copy source code
COPY . .
EXPOSE 8080
CMD ["node", "src/index.js"]

# Optimized: 2025-10-03
# Fixed: Build from backend/ directory to include shared common/
