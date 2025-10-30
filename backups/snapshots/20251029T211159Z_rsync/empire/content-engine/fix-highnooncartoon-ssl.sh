#!/bin/bash
echo "=== FIXING HIGHNOONCARTOON.COM SSL CERTIFICATE ==="

# Set project
gcloud config set project reggieanddrodispensary

# Check current domain mappings
echo "Current domain mappings:"
gcloud beta run domain-mappings list --region=us-central1 | grep highnooncartoon

# Check if highnooncartoon service exists
echo "Checking highnooncartoon service:"
gcloud run services list --region=us-central1 | grep highnooncartoon

# If service doesn't exist, deploy it
if ! gcloud run services list --region=us-central1 | grep -q highnooncartoon; then
    echo "Deploying highnooncartoon service..."
    cd /home/high/LivHana-SoT
    
    # Create minimal service
    mkdir -p highnooncartoon-service
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
app.use(express.static('public'));

// Redirect to Episode 1
app.get('/', (req, res) => {
  res.redirect('https://storage.googleapis.com/hnc-episodes-prod/index.html');
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
  console.log(`High Noon Cartoon service running on port ${PORT}`);
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
fi

# Create domain mapping
echo "Creating domain mapping for highnooncartoon.com..."
gcloud beta run domain-mappings create --service=highnooncartoon --domain=highnooncartoon.com --region=us-central1

echo "=== SSL CERTIFICATE FIX COMPLETE ==="
echo "Domain mapping created. SSL certificate will be automatically provisioned."
echo "Wait 5-10 minutes for certificate to be issued."
echo "Then visit: https://highnooncartoon.com"
