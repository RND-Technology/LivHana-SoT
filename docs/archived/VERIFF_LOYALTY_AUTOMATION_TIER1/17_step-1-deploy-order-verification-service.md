### Step 1: Deploy Order Verification Service

```bash
# 1. Copy order-verification.js to integration-service
cp order-verification.js backend/integration-service/src/

# 2. Install dependencies (if needed)
cd backend/integration-service
npm install axios @google-cloud/bigquery

# 3. Register routes in index.js
# Add: const { router: orderVerificationRoutes } = require('./order-verification');
# Add: app.use(orderVerificationRoutes);

# 4. Restart service
npm run dev
```
