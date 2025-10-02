# Lightspeed → BigQuery Integration Setup

## Overview
Automated pipeline that syncs Lightspeed Retail data to BigQuery every 15 minutes, matching the Square implementation pattern.

## Current Status: MOCK MODE
The pipeline is currently running with **mock data** because OAuth2 credentials are not yet configured.

## Files Created
1. `/scripts/sync-lightspeed-to-bigquery.js` - Main sync script
2. `/src/lightspeed-sync-scheduler.js` - Cron scheduler (runs every 15 minutes)
3. Updated `/src/index.js` - Added Lightspeed scheduler startup

## Mock Data Results
- **50 transactions** synced to `analytics.lightspeed_transactions`
- **25 products** synced to `analytics.lightspeed_products`
- Data successfully verified in BigQuery
- Scheduler confirmed running on server startup

## Setting Up Real Lightspeed API Access

### Option 1: OAuth2 with Refresh Token (Recommended)
1. Go to Lightspeed Back Office → Settings → API Credentials
2. Create a new OAuth2 application
3. Note the `client_id` and `client_secret`
4. Complete OAuth2 flow to get a `refresh_token`
5. Add to `.env`:
   ```bash
   LIGHTSPEED_CLIENT_ID=your_client_id
   LIGHTSPEED_CLIENT_SECRET=your_client_secret
   LIGHTSPEED_REFRESH_TOKEN=your_refresh_token
   LIGHTSPEED_ACCOUNT_ID=020b2c2a-4661-11ef-e88b-b42e5d3b90cc
   LIGHTSPEED_USE_MOCK=false
   ```

### Option 2: API Key (Legacy Basic Auth)
1. Go to Lightspeed Back Office → Settings → API Keys
2. Generate a new API key
3. Add to `.env`:
   ```bash
   LIGHTSPEED_API_KEY=your_api_key_here
   LIGHTSPEED_ACCOUNT_ID=020b2c2a-4661-11ef-e88b-b42e5d3b90cc
   LIGHTSPEED_USE_MOCK=false
   ```

## Running the Sync

### Manual Sync
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service
node scripts/sync-lightspeed-to-bigquery.js
```

### Automatic Sync
The scheduler runs automatically when the server starts:
```bash
node src/index.js
```
- Syncs every 15 minutes
- Logs to `lightspeed-sync-scheduler` logger
- 5-minute timeout per sync

## BigQuery Schema

### `analytics.lightspeed_transactions`
| Field | Type | Description |
|-------|------|-------------|
| id | STRING | Transaction ID |
| amount | FLOAT | Subtotal amount |
| tax | FLOAT | Tax amount |
| total | FLOAT | Total amount |
| customer_id | STRING | Customer ID (nullable) |
| status | STRING | COMPLETED or PENDING |
| created_at | TIMESTAMP | Transaction date |
| updated_at | TIMESTAMP | Last update (nullable) |

### `analytics.lightspeed_products`
| Field | Type | Description |
|-------|------|-------------|
| id | STRING | Product ID |
| name | STRING | Product name |
| description | STRING | Product description (nullable) |
| category | STRING | Product category (nullable) |
| price | FLOAT | Selling price |
| cost | FLOAT | Cost price (nullable) |
| quantity | INTEGER | Stock quantity (nullable) |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update (nullable) |

## Verification

Check data in BigQuery:
```bash
node -e "const {BigQuery} = require('@google-cloud/bigquery'); const bq = new BigQuery({projectId: 'reggieanddrodispensary'}); (async () => { const [txns] = await bq.dataset('analytics').table('lightspeed_transactions').query('SELECT COUNT(*) as count FROM \`reggieanddrodispensary.analytics.lightspeed_transactions\`'); const [prods] = await bq.dataset('analytics').table('lightspeed_products').query('SELECT COUNT(*) as count FROM \`reggieanddrodispensary.analytics.lightspeed_products\`'); console.log('Transactions:', txns[0].count); console.log('Products:', prods[0].count); })();"
```

## Troubleshooting

### "Invalid access token" Error
- You need to set up proper OAuth2 or API key credentials (see above)
- The current `.env` only has `CLIENT_ID` which is not sufficient for API access

### "No valid authentication method configured"
- Set `LIGHTSPEED_USE_MOCK=false` only after adding valid credentials
- Or keep `LIGHTSPEED_USE_MOCK=true` to continue with mock data

### Scheduler Not Running
- Check logs: `grep "lightspeed-sync-scheduler" logs/*.log`
- Verify server startup: `node src/index.js` should show "Lightspeed sync scheduler started"

## Next Steps
1. Obtain Lightspeed API credentials (OAuth2 or API Key)
2. Add credentials to `.env`
3. Set `LIGHTSPEED_USE_MOCK=false`
4. Run manual sync to test: `node scripts/sync-lightspeed-to-bigquery.js`
5. Restart server to enable automatic 15-minute syncs

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->
