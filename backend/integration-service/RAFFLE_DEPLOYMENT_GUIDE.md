# LivHana Raffle System - Deployment Guide

Complete deployment guide for the Blue Dream $250K Quarterly Raffle System.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [BigQuery Setup](#bigquery-setup)
4. [KAJA Payment Gateway Setup](#kaja-payment-gateway-setup)
5. [Local Development](#local-development)
6. [Production Deployment](#production-deployment)
7. [Testing](#testing)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services

- **Node.js**: v18.0.0 or higher
- **Google Cloud Platform** account with BigQuery enabled
- **Authorize.Net (KAJA)** merchant account
- **Email service** endpoint (or SMTP credentials)
- **Redis** (optional, for rate limiting)

### Required NPM Packages

The following packages are already included in `package.json`:

```json
{
  "dependencies": {
    "@google-cloud/bigquery": "^7.9.4",
    "axios": "^1.12.2",
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^16.6.1",
    "pino": "^8.21.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.1"
  }
}
```

---

## Environment Variables

Create a `.env` file in `backend/integration-service/`:

```bash
# Server Configuration
PORT=3005
NODE_ENV=production

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_ISSUER=livhana-api
JWT_AUDIENCE=livhana-app

# CORS Configuration
CORS_ORIGINS=https://livhana.com,https://www.livhana.com

# Google Cloud Platform - BigQuery
GCP_PROJECT_ID=livhana-production
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
BQ_DATASET=commerce
BQ_LOCATION=US
BIGQUERY_ENABLED=true

# BigQuery Table Names (optional, defaults shown)
BQ_TABLE_PAYMENTS=square_payments
BQ_TABLE_CUSTOMERS=square_customers
BQ_TABLE_ITEMS=square_items
BQ_TABLE_MEMBERSHIPS=memberships

# KAJA Payment Gateway (Authorize.Net)
AUTHORIZE_NET_API_LOGIN_ID=your_api_login_id
AUTHORIZE_NET_TRANSACTION_KEY=your_transaction_key
AUTHORIZE_NET_SANDBOX=false  # Set to true for testing

# Email Service
EMAIL_SERVICE_URL=http://localhost:3007/api/email/send
# OR use SMTP directly:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=noreply@livhana.com
# SMTP_PASS=your_smtp_password

# Age Verification Service
AGE_VERIFICATION_SERVICE_URL=http://localhost:3005/api/age-verification/status

# Logging
LOG_LEVEL=info
LOG_PRETTY=false

# Rate Limiting (optional)
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Development Environment

For local development, create `.env.development`:

```bash
PORT=3005
NODE_ENV=development
LOG_PRETTY=true

# Use sandbox/test credentials
AUTHORIZE_NET_SANDBOX=true
AUTHORIZE_NET_API_LOGIN_ID=test_api_login
AUTHORIZE_NET_TRANSACTION_KEY=test_transaction_key

# Local services
EMAIL_SERVICE_URL=http://localhost:3007/api/email/send
AGE_VERIFICATION_SERVICE_URL=http://localhost:3005/api/age-verification/status

# Development BigQuery (optional)
BIGQUERY_ENABLED=false  # Use mock mode for local dev
```

---

## BigQuery Setup

### 1. Create GCP Project

```bash
# Create project
gcloud projects create livhana-production

# Set active project
gcloud config set project livhana-production

# Enable BigQuery API
gcloud services enable bigquery.googleapis.com
```

### 2. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create bigquery-raffle-service \
  --display-name="BigQuery Raffle Service"

# Grant BigQuery permissions
gcloud projects add-iam-policy-binding livhana-production \
  --member="serviceAccount:bigquery-raffle-service@livhana-production.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding livhana-production \
  --member="serviceAccount:bigquery-raffle-service@livhana-production.iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"

# Create and download key
gcloud iam service-accounts keys create ./bigquery-service-account-key.json \
  --iam-account=bigquery-raffle-service@livhana-production.iam.gserviceaccount.com
```

### 3. Create Dataset

```bash
# Create commerce dataset
bq mk --location=US --dataset livhana-production:commerce
```

### 4. Verify Tables Created

The raffle system will automatically create the required tables on first run:

- `commerce.raffles`
- `commerce.raffle_tickets`
- `commerce.raffle_transactions`

To manually create tables, see [BigQuery Schema](#bigquery-schema) below.

---

## KAJA Payment Gateway Setup

### 1. Create Authorize.Net Account

1. Sign up at https://www.authorize.net/
2. Complete merchant verification
3. Obtain API credentials

### 2. Get API Credentials

1. Log in to Authorize.Net merchant dashboard
2. Navigate to **Account** → **API Credentials & Keys**
3. Copy **API Login ID** and **Transaction Key**
4. Add to `.env` file

### 3. Configure Webhook (Optional)

For payment notifications:

1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://api.livhana.com/webhooks/authorize-net`
3. Select events: `charge.succeeded`, `charge.failed`, `refund.created`

### 4. Test in Sandbox

Before going live, test in sandbox mode:

```bash
AUTHORIZE_NET_SANDBOX=true
AUTHORIZE_NET_API_LOGIN_ID=your_sandbox_api_login
AUTHORIZE_NET_TRANSACTION_KEY=your_sandbox_transaction_key
```

Use test card numbers:
- Visa: `4111111111111111`
- Mastercard: `5424000000000015`
- Discover: `6011000000000012`
- Amex: `370000000000002`

---

## Local Development

### 1. Install Dependencies

```bash
cd backend/integration-service
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your local configuration
```

### 3. Start Development Server

```bash
npm run dev
```

The service will start on `http://localhost:3005`

### 4. Test Endpoints

```bash
# Health check
curl http://localhost:3005/health

# List raffles (public)
curl http://localhost:3005/api/raffles

# Get raffle details
curl http://localhost:3005/api/raffles/RAFFLE_123
```

### 5. Run Tests

```bash
npm test src/raffle.test.js
```

---

## Production Deployment

### Option 1: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# backend/integration-service/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY ../../common/ ../common/

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "src/index.js"]
```

#### 2. Build and Run

```bash
# Build image
docker build -t livhana-integration-service:latest .

# Run container
docker run -d \
  --name integration-service \
  -p 3005:3005 \
  --env-file .env \
  -v /path/to/service-account-key.json:/app/credentials.json \
  livhana-integration-service:latest
```

### Option 2: Google Cloud Run

#### 1. Build and Push to GCR

```bash
# Build and tag
gcloud builds submit --tag gcr.io/livhana-production/integration-service

# Deploy to Cloud Run
gcloud run deploy integration-service \
  --image gcr.io/livhana-production/integration-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="$(cat .env | grep -v '^#' | xargs)" \
  --max-instances=10 \
  --memory=1Gi \
  --cpu=1
```

### Option 3: Traditional VPS/EC2

#### 1. Install Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 2. Clone and Install

```bash
# Clone repository
git clone https://github.com/livhana/backend.git
cd backend/integration-service

# Install dependencies
npm ci --only=production

# Copy environment file
cp .env.example .env
# Edit .env with production values
```

#### 3. Set Up PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Start service
pm2 start src/index.js --name integration-service

# Configure startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
```

#### 4. Set Up Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/integration-service
server {
    listen 80;
    server_name api.livhana.com;

    location /api/raffles {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/integration-service /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Set Up SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.livhana.com
```

---

## BigQuery Schema

If you need to manually create tables:

### Raffles Table

```sql
CREATE TABLE `livhana-production.commerce.raffles` (
  id STRING NOT NULL,
  name STRING NOT NULL,
  description STRING,
  prize STRING NOT NULL,
  ticket_price FLOAT64 NOT NULL,
  max_tickets INT64 NOT NULL,
  tickets_sold INT64 NOT NULL,
  status STRING NOT NULL,
  draw_date TIMESTAMP NOT NULL,
  winner_id STRING,
  winner_ticket_number INT64,
  runner_ups STRING,
  draw_timestamp TIMESTAMP,
  draw_seed STRING,
  total_revenue FLOAT64 NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  created_by STRING NOT NULL
);
```

### Raffle Tickets Table

```sql
CREATE TABLE `livhana-production.commerce.raffle_tickets` (
  id STRING NOT NULL,
  raffle_id STRING NOT NULL,
  customer_id STRING NOT NULL,
  customer_email STRING NOT NULL,
  customer_name STRING NOT NULL,
  ticket_number INT64 NOT NULL,
  is_bonus_entry BOOL NOT NULL,
  transaction_id STRING,
  purchase_date TIMESTAMP NOT NULL,
  is_winner BOOL NOT NULL,
  is_runner_up BOOL NOT NULL,
  runner_up_rank INT64,
  age_verified BOOL NOT NULL,
  age_verification_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_raffle_id ON `livhana-production.commerce.raffle_tickets`(raffle_id);
CREATE INDEX idx_customer_id ON `livhana-production.commerce.raffle_tickets`(customer_id);
```

### Raffle Transactions Table

```sql
CREATE TABLE `livhana-production.commerce.raffle_transactions` (
  id STRING NOT NULL,
  raffle_id STRING NOT NULL,
  customer_id STRING NOT NULL,
  customer_email STRING NOT NULL,
  num_tickets INT64 NOT NULL,
  ticket_numbers STRING NOT NULL,
  amount FLOAT64 NOT NULL,
  payment_method STRING NOT NULL,
  payment_status STRING NOT NULL,
  payment_gateway_id STRING,
  payment_gateway_response STRING,
  refund_id STRING,
  refund_date TIMESTAMP,
  ip_address STRING,
  user_agent STRING,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_raffle_id ON `livhana-production.commerce.raffle_transactions`(raffle_id);
CREATE INDEX idx_customer_id ON `livhana-production.commerce.raffle_transactions`(customer_id);
```

---

## Testing

### Unit Tests

```bash
npm test src/raffle.test.js
```

### Integration Tests

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration

# Cleanup
docker-compose -f docker-compose.test.yml down
```

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run tests/load/raffle-purchase.js
```

Example load test script:

```javascript
// tests/load/raffle-purchase.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function () {
  let res = http.get('https://api.livhana.com/api/raffles');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

---

## Monitoring

### Health Check Endpoint

```bash
curl https://api.livhana.com/health
```

Response:

```json
{
  "status": "healthy",
  "service": "integration-service",
  "timestamp": "2025-10-01T12:00:00Z",
  "bigQuery": {
    "enabled": true,
    "mode": "live",
    "lastRefresh": "2025-10-01T11:59:00Z"
  }
}
```

### Set Up Monitoring Alerts

#### Google Cloud Monitoring

```bash
# Create uptime check
gcloud monitoring uptime create \
  --display-name="Integration Service Health" \
  --resource-type=uptime-url \
  --host=api.livhana.com \
  --path=/health

# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Integration Service Down" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=300s
```

### Logging

View logs in production:

```bash
# PM2
pm2 logs integration-service

# Docker
docker logs integration-service

# Cloud Run
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=integration-service"
```

### Metrics to Monitor

- Request rate (requests/second)
- Error rate (errors/second)
- Response time (p50, p95, p99)
- BigQuery query latency
- Payment success rate
- Ticket purchase rate

---

## Troubleshooting

### Issue: BigQuery Connection Failed

```bash
Error: Failed to initialize BigQuery client
```

**Solution**:
1. Verify `GOOGLE_APPLICATION_CREDENTIALS` path is correct
2. Check service account has BigQuery permissions
3. Ensure BigQuery API is enabled:
   ```bash
   gcloud services enable bigquery.googleapis.com
   ```

### Issue: Payment Processing Failed

```bash
Error: Payment processing failed: Invalid credentials
```

**Solution**:
1. Verify Authorize.Net credentials in `.env`
2. Check if using correct sandbox/production mode
3. Verify merchant account is active

### Issue: Age Verification Service Unavailable

```bash
Error: Age verification check failed
```

**Solution**:
1. Check `AGE_VERIFICATION_SERVICE_URL` is correct
2. Verify age verification service is running
3. Check network connectivity between services

### Issue: High Memory Usage

**Solution**:
1. Increase container memory limit
2. Enable BigQuery caching
3. Implement pagination for large queries
4. Add Redis for session caching

### Issue: Slow Response Times

**Solution**:
1. Enable BigQuery result caching
2. Add database indexes
3. Implement API response caching
4. Scale horizontally (add more instances)

---

## Security Checklist

- [ ] JWT secret is strong and rotated regularly
- [ ] HTTPS enabled for all endpoints
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] BigQuery service account has minimal permissions
- [ ] Payment gateway credentials secured
- [ ] Age verification required before purchases
- [ ] Audit logs enabled
- [ ] Backup strategy in place

---

## Backup and Recovery

### BigQuery Backups

```bash
# Export raffle data
bq extract \
  --destination_format=NEWLINE_DELIMITED_JSON \
  livhana-production:commerce.raffles \
  gs://livhana-backups/raffles/raffles_$(date +%Y%m%d).json

# Automated daily backups
0 2 * * * /usr/local/bin/backup-bigquery.sh
```

### Database Recovery

```bash
# Restore from backup
bq load \
  --source_format=NEWLINE_DELIMITED_JSON \
  livhana-production:commerce.raffles_restored \
  gs://livhana-backups/raffles/raffles_20251001.json
```

---

## Support

For deployment support:

- **Documentation**: https://docs.livhana.com
- **DevOps Team**: devops@livhana.com
- **Emergency Hotline**: 1-800-LIVHANA

---

## Changelog

### Version 1.0.0 (2025-10-01)

- Initial production deployment
- Blue Dream $250K raffle system
- BigQuery integration
- KAJA payment gateway
- Complete monitoring and alerting setup

<!-- Last verified: 2025-10-02 -->
