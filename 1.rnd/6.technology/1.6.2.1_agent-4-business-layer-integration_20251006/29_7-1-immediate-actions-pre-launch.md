### 7.1 Immediate Actions (Pre-Launch)

1. **Implement Integration Tests** (2-3 days)
   - Square/LightSpeed sync tests
   - Membership lifecycle tests
   - Payment gateway tests
   - BigQuery pipeline tests

2. **Add Rate Limiting** (4 hours)

   ```javascript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 100, // 100 requests per minute per IP
     message: 'Too many requests, please try again later.'
   });

   app.use('/api', limiter);
   ```

3. **Migrate to GCP Secret Manager** (1 day)

   ```javascript
   import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

   const client = new SecretManagerServiceClient();
   const [version] = await client.accessSecretVersion({
     name: 'projects/PROJECT_ID/secrets/JWT_SECRET/versions/latest'
   });

   const JWT_SECRET = version.payload.data.toString();
   ```

4. **Implement Idempotency Keys** (4 hours)

   ```javascript
   // Add to payment gateway
   async chargeCard(amount, paymentMethod, description, { idempotencyKey }) {
     // Check Redis cache for existing transaction
     const cached = await redis.get(`idempotency:${idempotencyKey}`);
     if (cached) {
       return JSON.parse(cached); // Return original result
     }

     // Process payment
     const result = await authorizeNet.charge(...);

     // Cache result (24 hour TTL)
     await redis.setex(`idempotency:${idempotencyKey}`, 86400, JSON.stringify(result));

     return result;
   }
   ```

---
