FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY main.js ./
EXPOSE 8084
CMD ["node", "main.js"]
