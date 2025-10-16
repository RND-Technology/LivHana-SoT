### 3. REST API (`age_verification_routes.js`)

**Endpoints:**

1. **POST /api/age-verification/verify**
   - Verify customer age and identity
   - JWT authentication required
   - Rate limiting enforced
   - Returns verification result

2. **GET /api/age-verification/status/:customerId**
   - Check verification status
   - JWT authentication required
   - Returns verification details or 404

3. **POST /api/age-verification/resubmit**
   - Resubmit verification (clears cache)
   - JWT authentication required
   - Useful when customer data changes

4. **GET /api/age-verification/statistics**
   - Admin dashboard statistics
   - JWT authentication required
   - Returns success rate, attempts, etc.

5. **GET /health/age-verification**
   - Service health check
   - No authentication required
   - Returns service status

**Error Handling:**

- 400: Invalid input or validation failure
- 401: Missing/invalid JWT
- 404: Customer not found
- 429: Rate limit exceeded
- 500: Internal server error
