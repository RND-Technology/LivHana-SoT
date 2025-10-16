### Too Many 429 Errors

1. **Increase Rate Limits** (if legitimate traffic)

   ```javascript
   // Edit backend/common/rate-limit/index.js
   const RATE_LIMITS = {
     PUBLIC: {
       max: 200, // Increase from 100
       ...
     }
   }
   ```

2. **Check Authentication**
   - Ensure users are properly authenticated
   - Authenticated users get 3x higher limits

3. **Use Admin Accounts**
   - Admin users get 10x higher limits
