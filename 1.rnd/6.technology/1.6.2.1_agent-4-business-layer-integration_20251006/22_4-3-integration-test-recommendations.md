### 4.3 Integration Test Recommendations

**Test Suite Structure:**

```
tests/
├── integration/
│   ├── square-sync.test.js
│   ├── lightspeed-sync.test.js
│   ├── bigquery-pipeline.test.js
│   ├── membership-lifecycle.test.js
│   ├── raffle-draw.test.js
│   ├── age-verification.test.js
│   ├── payment-gateway.test.js
│   └── memory-learning.test.js
│
├── e2e/
│   ├── checkout-flow.test.js
│   ├── membership-signup.test.js
│   └── raffle-purchase.test.js
│
└── load/
    ├── concurrent-checkouts.test.js
    └── sync-stress.test.js
```

**Priority Test Cases:**

**1. Square → BigQuery Sync Test:**

```javascript
describe('Square → BigQuery Sync', () => {
  it('should sync payments and catalog every 15 minutes', async () => {
    // 1. Mock Square API responses
    const mockPayments = generateMockPayments(100);
    const mockCatalog = generateMockCatalog(50);

    nock('https://connect.squareup.com')
      .get('/v2/payments')
      .reply(200, { payments: mockPayments });

    nock('https://connect.squareup.com')
      .get('/v2/catalog/list')
      .reply(200, { objects: mockCatalog });

    // 2. Run sync script
    await exec('node scripts/sync-square-to-bigquery.js');

    // 3. Verify BigQuery inserts
    const [payments] = await bigquery
      .dataset('commerce')
      .table('square_payments')
      .query('SELECT COUNT(*) as count FROM square_payments WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 MINUTE)');

    expect(payments[0].count).toBe(100);

    // 4. Verify API cache refresh
    const response = await axios.get('http://localhost:3005/api/bigquery/dashboard');
    expect(response.data.metrics.todayRevenue).toBeGreaterThan(0);
  });

  it('should gracefully degrade to mock data on Square API failure', async () => {
    // 1. Mock Square API error
    nock('https://connect.squareup.com')
      .get('/v2/payments')
      .reply(500, { error: 'Internal Server Error' });

    // 2. Request dashboard data
    const response = await axios.get('http://localhost:3005/api/bigquery/dashboard');

    // 3. Verify fallback to mock data
    expect(response.data.mode).toBe('mock');
    expect(response.data.metrics.todayRevenue).toBe(0);
  });
});
```

**2. Membership Lifecycle Test:**

```javascript
describe('Membership Lifecycle', () => {
  it('should create GOLD membership with KAJA payment', async () => {
    const customer = {
      customerId: 'test-customer-123',
      email: 'test@example.com'
    };

    const paymentMethod = {
      type: 'credit_card',
      token: 'tok_visa_test'
    };

    // 1. Subscribe
    const subscribeRes = await axios.post('http://localhost:3005/api/memberships/subscribe', {
      ...customer,
      tier: 'GOLD',
      paymentMethod
    });

    expect(subscribeRes.data.success).toBe(true);
    expect(subscribeRes.data.membership.tier).toBe('GOLD');
    expect(subscribeRes.data.membership.price).toBe(197.00);

    // 2. Verify discount calculation
    const discountRes = await axios.get(`http://localhost:3005/api/memberships/discount/${customer.customerId}?subtotal=100.00`);

    expect(discountRes.data.discountAmount).toBe(30.00); // 30% of 100
    expect(discountRes.data.finalTotal).toBe(70.00);

    // 3. Verify BigQuery record
    const [memberships] = await bigquery
      .dataset('commerce')
      .table('memberships')
      .query(`SELECT * FROM memberships WHERE customer_id = '${customer.customerId}'`);

    expect(memberships[0].tier).toBe('GOLD');
    expect(memberships[0].status).toBe('active');

    // 4. Cancel membership
    const cancelRes = await axios.put(`http://localhost:3005/api/memberships/${customer.customerId}/cancel`, {
      reason: 'Test cancellation'
    });

    expect(cancelRes.data.success).toBe(true);
    expect(cancelRes.data.membership.status).toBe('cancelled');
  });

  it('should prevent duplicate active memberships', async () => {
    const customer = {
      customerId: 'test-customer-456',
      email: 'test2@example.com',
      tier: 'SILVER',
      paymentMethod: { token: 'tok_visa_test' }
    };

    // 1. First subscription succeeds
    const firstRes = await axios.post('http://localhost:3005/api/memberships/subscribe', customer);
    expect(firstRes.data.success).toBe(true);

    // 2. Second subscription fails
    await expect(
      axios.post('http://localhost:3005/api/memberships/subscribe', customer)
    ).rejects.toThrow('Customer already has an active membership');
  });
});
```

**3. Age Verification Test:**

```javascript
describe('Age Verification', () => {
  it('should verify customer over 21', async () => {
    const verification = {
      customerId: 'test-customer-789',
      fullName: 'John Doe',
      dateOfBirth: '1990-01-01', // 35 years old
      state: 'TX',
      idNumberLast4: '1234'
    };

    const response = await axios.post('http://localhost:3005/api/age-verification/verify', verification);

    expect(response.data.verified).toBe(true);
    expect(response.data.age).toBe(35);
    expect(response.data.verificationId).toMatch(/^av_/);

    // Verify cached in Redis
    const cached = await redis.get(`age_verification:${verification.customerId}`);
    expect(cached).not.toBeNull();
  });

  it('should reject customer under 21', async () => {
    const verification = {
      customerId: 'test-customer-minor',
      fullName: 'Jane Smith',
      dateOfBirth: '2010-01-01', // 15 years old
      state: 'CA',
      idNumberLast4: '5678'
    };

    const response = await axios.post('http://localhost:3005/api/age-verification/verify', verification);

    expect(response.data.verified).toBe(false);
    expect(response.data.reason).toContain('Must be at least 21 years old');
  });

  it('should use cached verification for returning customers', async () => {
    const customerId = 'test-customer-cached';

    // 1. First verification (cache miss)
    const firstRes = await axios.post('http://localhost:3005/api/age-verification/verify', {
      customerId,
      fullName: 'Alice Johnson',
      dateOfBirth: '1985-05-15',
      state: 'NY',
      idNumberLast4: '9999'
    });

    expect(firstRes.data.method).toBe('full_verification');

    // 2. Second verification (cache hit)
    const secondRes = await axios.post('http://localhost:3005/api/age-verification/verify', {
      customerId,
      fullName: 'Alice Johnson',
      dateOfBirth: '1985-05-15',
      state: 'NY',
      idNumberLast4: '9999'
    });

    expect(secondRes.data.method).toBe('cache');
    expect(secondRes.data.verificationId).toBe(firstRes.data.verificationId);
  });
});
```

**4. Payment Gateway Error Handling Test:**

```javascript
describe('Payment Gateway Error Handling', () => {
  it('should retry on network timeout', async () => {
    // Mock 2 timeouts, then success
    nock('https://apitest.authorize.net')
      .post('/xml/v1/request.api')
      .times(2)
      .replyWithError({ code: 'ETIMEDOUT' });

    nock('https://apitest.authorize.net')
      .post('/xml/v1/request.api')
      .reply(200, { transactionResponse: { responseCode: '1' } });

    const result = await kajaGateway.chargeCard(50.00, { token: 'tok_test' }, 'Test charge');

    expect(result.status).toBe('success');
    expect(result.amount).toBe(50.00);
  });

  it('should not retry on card decline', async () => {
    nock('https://apitest.authorize.net')
      .post('/xml/v1/request.api')
      .reply(200, { transactionResponse: { responseCode: '2', responseReasonText: 'Declined' } });

    await expect(
      kajaGateway.chargeCard(100.00, { token: 'tok_declined' }, 'Test charge')
    ).rejects.toThrow('Payment declined');

    // Verify only 1 attempt (no retries)
    expect(nock.pendingMocks()).toHaveLength(0);
  });
});
```

**5. Load Test - Concurrent Checkouts:**

```javascript
describe('Load Test: Concurrent Checkouts', () => {
  it('should handle 100 concurrent checkouts without race conditions', async () => {
    const customers = Array.from({ length: 100 }, (_, i) => ({
      customerId: `load-test-${i}`,
      email: `load-test-${i}@example.com`
    }));

    // Simulate 100 customers checking out simultaneously
    const checkouts = customers.map(customer =>
      axios.post('http://localhost:3005/api/checkout', {
        ...customer,
        cart: [{ productId: 'test-product-1', quantity: 1, price: 50.00 }],
        paymentMethod: { token: 'tok_visa_test' }
      })
    );

    const results = await Promise.allSettled(checkouts);

    // All should succeed
    const successful = results.filter(r => r.status === 'fulfilled');
    expect(successful.length).toBe(100);

    // Verify no duplicate orders
    const orderIds = new Set(successful.map(r => r.value.data.orderId));
    expect(orderIds.size).toBe(100); // All unique

    // Verify all payments recorded in BigQuery
    const [payments] = await bigquery
      .dataset('commerce')
      .table('square_payments')
      .query(`SELECT COUNT(*) as count FROM square_payments WHERE customer_id LIKE 'load-test-%'`);

    expect(payments[0].count).toBe(100);
  });
});
```

**Test Coverage Goals:**

| Component | Current Coverage | Target Coverage |
|-----------|-----------------|----------------|
| Membership API | 0% (no tests) | 80% |
| Age Verification | 65% (age_verification.test.js exists) | 90% |
| Raffle System | 55% (raffle.test.js exists) | 85% |
| Payment Gateway | 0% (mock only) | 70% |
| BigQuery Sync | 0% (no tests) | 75% |
| Memory Learning | 80% (learning-engine.test.js exists) | 90% |

---
