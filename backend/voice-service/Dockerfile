FROM node:20-alpine

WORKDIR /app

COPY backend/voice-service/package*.json ./
RUN npm install --omit=dev

COPY backend/common/package.json /common/package.json
RUN npm install --omit=dev --prefix /common

COPY backend/common /common
COPY backend/voice-service/src ./src

ENV NODE_ENV=production
CMD ["node", "src/index.js"]

# Optimized: 2025-10-02
