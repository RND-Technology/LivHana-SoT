FROM node:20-alpine
WORKDIR /app
COPY server.mjs package.json ./
RUN npm install --omit=dev
EXPOSE 8080
CMD ["node", "server.mjs"]

# Optimized: 2025-10-02
