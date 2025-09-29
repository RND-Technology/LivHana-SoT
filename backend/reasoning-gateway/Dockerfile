FROM node:20-alpine

WORKDIR /app

COPY backend/reasoning-gateway/package*.json ./
RUN npm install --omit=dev

COPY backend/common/package.json /common/package.json
RUN npm install --omit=dev --prefix /common

COPY backend/common /common
COPY backend/reasoning-gateway/src ./src

ENV NODE_ENV=production
CMD ["node", "src/index.js"]
