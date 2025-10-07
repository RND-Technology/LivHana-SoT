#!/bin/bash
echo "=== DEPLOYING HIGHNOONCARTOON.COM DOMAIN ==="

# Set project
gcloud config set project reggieanddrodispensary

# Create Cloud Run service for highnooncartoon.com
cd /tmp
mkdir highnooncartoon-service
cd highnooncartoon-service

cat > package.json << 'PACKAGE_EOF'
{
  "name": "highnooncartoon-service",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
PACKAGE_EOF

mkdir -p src
cat > src/index.js << 'INDEX_EOF'
import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Redirect to Episode 1
app.get('/', (req, res) => {
  res.redirect('https://storage.googleapis.com/hnc-episodes-prod/highnooncartoon.html');
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'highnooncartoon-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`HIGH NOON CARTOON service running on port ${PORT}`);
});
INDEX_EOF

cat > Dockerfile << 'DOCKER_EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
DOCKER_EOF

# Deploy service
gcloud run deploy highnooncartoon --source . --region=us-central1 --allow-unauthenticated --platform managed

echo "=== HIGHNOONCARTOON.COM DEPLOYMENT COMPLETE ==="
echo "Service URL: https://highnooncartoon-980910443251.us-central1.run.app"
echo "Domain mapping: highnooncartoon.com (requires domain verification)"
