## Step 1: Install Dependencies

All monitoring dependencies are already installed in the common module and individual services.

```bash
# Already completed - verification only
cd backend/common
npm list @sentry/node newrelic prom-client

cd ../integration-service
npm list @sentry/node newrelic

cd ../reasoning-gateway
npm list @sentry/node newrelic
```
