# Stage 1 - Build (TypeScript compilation)
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# Stage 2 - Runtime (minimal, non-root)
FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /app

# Create non-root user
RUN groupadd -r app && useradd -r -g app app \
    && mkdir -p /app && chown -R app:app /app

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

USER app
ENV PORT=8080 HOST=0.0.0.0
EXPOSE 8080

CMD ["node", "dist/index.js"]