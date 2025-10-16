## Example 5: Automated Testing

```javascript
// tests/integration/age-verification.integration.test.js
const request = require('supertest');
const app = require('../src/index');
const { generateJWT } = require('../test-helpers');

describe('Age Verification Integration Tests', () => {
  let authToken;

  beforeAll(() => {
    authToken = generateJWT({ sub: 'test-user' });
  });

  test('Complete verification flow', async () => {
    const customerId = `test-${Date.now()}`;

    // Step 1: Check status (should be not found)
    const statusBefore = await request(app)
      .get(`/api/age-verification/status/${customerId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(statusBefore.status).toBe(404);

    // Step 2: Submit verification
    const verification = await request(app)
      .post('/api/age-verification/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId,
        fullName: 'Test Customer',
        dateOfBirth: '1990-01-01',
        idNumberLast4: '1234',
        state: 'TX'
      });

    expect(verification.status).toBe(200);
    expect(verification.body.success).toBe(true);
    expect(verification.body.verified).toBe(true);
    expect(verification.body.verificationId).toBeTruthy();

    // Step 3: Check status again (should be verified)
    const statusAfter = await request(app)
      .get(`/api/age-verification/status/${customerId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(statusAfter.status).toBe(200);
    expect(statusAfter.body.verified).toBe(true);

    // Step 4: Second verification should use cache
    const verification2 = await request(app)
      .post('/api/age-verification/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId,
        fullName: 'Test Customer',
        dateOfBirth: '1990-01-01',
        idNumberLast4: '1234',
        state: 'TX'
      });

    expect(verification2.body.method).toBe('cache');
    expect(verification2.body.processingTime).toBeLessThan(20);
  });

  test('Rate limiting enforcement', async () => {
    const customerId = `rate-limit-test-${Date.now()}`;

    // Submit 3 verifications (with invalid data to fail)
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/age-verification/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId,
          fullName: 'X', // Too short - will fail
          dateOfBirth: '1990-01-01',
          idNumberLast4: '1234',
          state: 'TX'
        });
    }

    // 4th attempt should be rate limited
    const rateLimited = await request(app)
      .post('/api/age-verification/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId,
        fullName: 'Test Customer',
        dateOfBirth: '1990-01-01',
        idNumberLast4: '1234',
        state: 'TX'
      });

    expect(rateLimited.status).toBe(429);
    expect(rateLimited.body.error).toContain('Too many');
  });
});
```

---
