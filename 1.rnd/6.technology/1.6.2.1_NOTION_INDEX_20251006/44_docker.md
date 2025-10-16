### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY *.js ./
CMD ["node", "notion_ingest.js"]
```

---
