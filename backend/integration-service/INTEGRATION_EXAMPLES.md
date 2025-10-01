# Age Verification - Integration Examples

Complete integration examples for the age verification system in various scenarios.

---

## Example 1: Checkout Flow (Frontend + Backend)

### Frontend: Check Verification Before Checkout

```javascript
// checkout.js - React/Vue/vanilla JS
import { useState, useEffect } from 'react';

function CheckoutPage({ customerId, cartItems }) {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAgeVerification();
  }, [customerId]);

  async function checkAgeVerification() {
    try {
      const response = await fetch(
        `/api/age-verification/status/${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      setVerificationStatus(data);
      setLoading(false);

      if (!data.verified || data.expired) {
        // Redirect to age verification page
        window.location.href = `/age-verification?return=/checkout`;
      }
    } catch (error) {
      console.error('Failed to check verification:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Checking age verification...</div>;
  }

  if (!verificationStatus?.verified || verificationStatus?.expired) {
    return (
      <div className="verification-required">
        <h2>Age Verification Required</h2>
        <p>To complete your purchase, please verify your age.</p>
        <button onClick={() => window.location.href = '/age-verification'}>
          Verify Age
        </button>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      {/* Checkout form */}
    </div>
  );
}
```

### Frontend: Age Verification Form

```javascript
// age-verification-form.js
function AgeVerificationForm({ customerId, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    idNumberLast4: '',
    state: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/age-verification/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success && data.verified) {
        // Success!
        onSuccess(data);
      } else if (response.status === 429) {
        // Rate limited
        setError(
          `Too many attempts. Please try again after ${new Date(data.resetAt).toLocaleString()}`
        );
      } else {
        // Verification failed
        setError(data.reason || 'Verification failed. Please check your information.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Unable to verify age. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="age-verification-form">
      <h2>Age Verification</h2>
      <p>We need to verify that you are 21 or older to purchase our products.</p>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="form-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="John Doe"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          type="date"
          id="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="idNumberLast4">Last 4 Digits of ID</label>
        <input
          type="text"
          id="idNumberLast4"
          value={formData.idNumberLast4}
          onChange={(e) => setFormData({ ...formData, idNumberLast4: e.target.value })}
          placeholder="1234"
          maxLength="4"
          pattern="[0-9]{4}"
          required
        />
        <small>Enter the last 4 digits of your driver's license or state ID</small>
      </div>

      <div className="form-group">
        <label htmlFor="state">State</label>
        <select
          id="state"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          required
        >
          <option value="">Select your state...</option>
          <option value="TX">Texas</option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
          {/* Add all 50 states + DC */}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="submit-button"
      >
        {submitting ? 'Verifying...' : 'Verify Age'}
      </button>

      <div className="privacy-notice">
        <small>
          Your information is encrypted and stored securely. We only collect the minimum
          information required for age verification in compliance with state regulations.
        </small>
      </div>
    </form>
  );
}
```

### Backend: Order Processing Middleware

```javascript
// backend/order-service/middleware/age-verification.js
const axios = require('axios');

const INTEGRATION_SERVICE_URL = process.env.INTEGRATION_SERVICE_URL || 'http://localhost:3005';

async function requireAgeVerification(req, res, next) {
  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({
      error: 'Customer ID required'
    });
  }

  try {
    // Check age verification status
    const response = await axios.get(
      `${INTEGRATION_SERVICE_URL}/api/age-verification/status/${customerId}`,
      {
        headers: {
          'Authorization': req.headers.authorization
        }
      }
    );

    const verification = response.data;

    if (!verification.verified || verification.expired) {
      return res.status(403).json({
        error: 'Age verification required',
        message: 'Please complete age verification before placing an order',
        requiresVerification: true,
        verificationUrl: '/age-verification'
      });
    }

    // Verification passed - add to request for logging
    req.ageVerification = {
      verificationId: verification.verificationId,
      verifiedAt: verification.verifiedAt,
      age: verification.age
    };

    next();
  } catch (error) {
    if (error.response?.status === 404) {
      // Customer not verified
      return res.status(403).json({
        error: 'Age verification required',
        message: 'Please complete age verification before placing an order',
        requiresVerification: true
      });
    }

    console.error('Age verification check failed:', error);
    return res.status(500).json({
      error: 'Unable to verify age',
      message: 'Please try again later'
    });
  }
}

module.exports = { requireAgeVerification };
```

### Backend: Order Creation Endpoint

```javascript
// backend/order-service/routes/orders.js
const express = require('express');
const { requireAgeVerification } = require('../middleware/age-verification');
const { authMiddleware } = require('../../common/auth/middleware');

const router = express.Router();

router.post('/api/orders',
  authMiddleware({ logger }),
  requireAgeVerification,
  async (req, res) => {
    const { customerId, items, shippingAddress } = req.body;

    try {
      // Create order
      const order = await createOrder({
        customerId,
        items,
        shippingAddress,
        ageVerificationId: req.ageVerification.verificationId,
        verifiedAge: req.ageVerification.age
      });

      // Log successful order with verification
      logger.info({
        orderId: order.id,
        customerId,
        verificationId: req.ageVerification.verificationId,
        age: req.ageVerification.age
      }, 'Order created with age verification');

      res.json({
        success: true,
        order
      });
    } catch (error) {
      logger.error({ error: error.message }, 'Order creation failed');
      res.status(500).json({
        error: 'Failed to create order'
      });
    }
  }
);

module.exports = router;
```

---

## Example 2: Admin Dashboard Integration

```javascript
// admin-dashboard.js
import { useState, useEffect } from 'react';

function AgeVerificationDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30); // days

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  async function loadStatistics() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/age-verification/statistics?days=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminJwt')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      setStats(data.statistics);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="verification-dashboard">
      <h2>Age Verification Statistics</h2>

      <div className="time-range-selector">
        <button onClick={() => setTimeRange(7)} className={timeRange === 7 ? 'active' : ''}>
          7 Days
        </button>
        <button onClick={() => setTimeRange(30)} className={timeRange === 30 ? 'active' : ''}>
          30 Days
        </button>
        <button onClick={() => setTimeRange(90)} className={timeRange === 90 ? 'active' : ''}>
          90 Days
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Attempts</h3>
            <div className="stat-value">{stats.totalAttempts.toLocaleString()}</div>
          </div>

          <div className="stat-card">
            <h3>Successful Verifications</h3>
            <div className="stat-value">{stats.successfulVerifications.toLocaleString()}</div>
          </div>

          <div className="stat-card">
            <h3>Failed Verifications</h3>
            <div className="stat-value">{stats.failedVerifications.toLocaleString()}</div>
          </div>

          <div className="stat-card success-rate">
            <h3>Success Rate</h3>
            <div className="stat-value">{stats.successRate}%</div>
            {parseFloat(stats.successRate) < 95 && (
              <div className="warning">Below target (95%)</div>
            )}
          </div>
        </div>
      )}

      <div className="period-info">
        <small>Statistics for the last {stats?.period}</small>
      </div>
    </div>
  );
}
```

---

## Example 3: Customer Account Page

```javascript
// customer-account.js
function CustomerAccount({ customerId }) {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerificationStatus();
  }, [customerId]);

  async function loadVerificationStatus() {
    try {
      const response = await fetch(
        `/api/age-verification/status/${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 404) {
        // Not verified yet
        setVerification({ verified: false });
      } else {
        const data = await response.json();
        setVerification(data);
      }
    } catch (error) {
      console.error('Failed to load verification status:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account-page">
      <h2>My Account</h2>

      <section className="age-verification-section">
        <h3>Age Verification</h3>

        {!verification?.verified && (
          <div className="verification-pending">
            <p>You need to verify your age to make purchases.</p>
            <button onClick={() => window.location.href = '/age-verification'}>
              Verify Age Now
            </button>
          </div>
        )}

        {verification?.verified && !verification?.expired && (
          <div className="verification-active">
            <span className="status-badge verified">✓ Verified</span>
            <p>Your age has been verified.</p>
            <small>
              Verified on: {new Date(verification.verifiedAt).toLocaleDateString()}
              <br />
              Expires: {new Date(verification.expiresAt).toLocaleDateString()}
            </small>
          </div>
        )}

        {verification?.verified && verification?.expired && (
          <div className="verification-expired">
            <span className="status-badge expired">⚠ Expired</span>
            <p>Your age verification has expired. Please reverify to continue shopping.</p>
            <button onClick={() => window.location.href = '/age-verification'}>
              Reverify Age
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
```

---

## Example 4: Background Job - Expiration Notifications

```javascript
// backend/jobs/verification-expiration-notifications.js
const { BigQuery } = require('@google-cloud/bigquery');
const { sendEmail } = require('../email-service');

const bigquery = new BigQuery();

async function checkExpiringVerifications() {
  // Find verifications expiring in 30 days
  const query = `
    SELECT
      v.customer_id,
      v.verification_id,
      v.expires_at,
      c.email,
      c.full_name
    FROM \`project.commerce.age_verifications\` v
    JOIN \`project.commerce.customers\` c
      ON v.customer_id = c.customer_id
    WHERE v.verified = true
      AND v.expires_at BETWEEN CURRENT_TIMESTAMP()
        AND TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      AND v.expiration_email_sent = false
  `;

  const [rows] = await bigquery.query({ query });

  for (const customer of rows) {
    try {
      await sendEmail({
        to: customer.email,
        subject: 'Age Verification Expiring Soon',
        template: 'age-verification-expiring',
        data: {
          name: customer.full_name,
          expiresAt: new Date(customer.expires_at).toLocaleDateString(),
          reverifyUrl: `https://yoursite.com/age-verification?customerId=${customer.customer_id}`
        }
      });

      // Mark email as sent
      await bigquery.query({
        query: `
          UPDATE \`project.commerce.age_verifications\`
          SET expiration_email_sent = true
          WHERE verification_id = @verificationId
        `,
        params: { verificationId: customer.verification_id }
      });

      console.log(`Expiration email sent to ${customer.email}`);
    } catch (error) {
      console.error(`Failed to send expiration email to ${customer.email}:`, error);
    }
  }
}

// Run daily
setInterval(checkExpiringVerifications, 24 * 60 * 60 * 1000);
```

---

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

## Example 6: Monitoring & Alerts

```javascript
// monitoring/age-verification-metrics.js
const { BigQuery } = require('@google-cloud/bigquery');
const { sendAlert } = require('../alerting');

const bigquery = new BigQuery();

async function checkMetrics() {
  // Check success rate (last hour)
  const successRateQuery = `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN verified = true THEN 1 ELSE 0 END) as successful
    FROM \`project.commerce.age_verification_attempts\`
    WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
  `;

  const [rows] = await bigquery.query({ query: successRateQuery });
  const { total, successful } = rows[0];
  const successRate = total > 0 ? (successful / total) * 100 : 100;

  // Alert if success rate drops below 90%
  if (successRate < 90 && total > 10) {
    await sendAlert({
      severity: 'critical',
      title: 'Age Verification Success Rate Low',
      message: `Success rate is ${successRate.toFixed(2)}% (${successful}/${total}) in the last hour`,
      tags: ['age-verification', 'performance']
    });
  }

  // Check processing times
  const processingTimeQuery = `
    SELECT
      APPROX_QUANTILES(processing_time, 100)[OFFSET(95)] as p95_time
    FROM \`project.commerce.age_verification_attempts\`
    WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
      AND processing_time IS NOT NULL
  `;

  const [timeRows] = await bigquery.query({ query: processingTimeQuery });
  const p95Time = timeRows[0]?.p95_time;

  // Alert if p95 processing time > 500ms
  if (p95Time > 500) {
    await sendAlert({
      severity: 'warning',
      title: 'Age Verification Slow Response',
      message: `P95 processing time is ${p95Time}ms in the last hour`,
      tags: ['age-verification', 'performance']
    });
  }

  console.log(`Metrics check complete - Success: ${successRate.toFixed(2)}%, P95: ${p95Time}ms`);
}

// Run every 15 minutes
setInterval(checkMetrics, 15 * 60 * 1000);
```

---

## CSS Styling Examples

```css
/* age-verification.css */

.age-verification-form {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-button:hover {
  background: #0056b3;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.privacy-notice {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.verified {
  background: #d4edda;
  color: #155724;
}

.status-badge.expired {
  background: #fff3cd;
  color: #856404;
}

.verification-dashboard .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
}

.stat-card .stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stat-card.success-rate .stat-value {
  color: #28a745;
}

.stat-card .warning {
  margin-top: 0.5rem;
  color: #dc3545;
  font-size: 0.875rem;
}
```

---

These integration examples show how to use the age verification system in real-world scenarios. Each example is production-ready and can be adapted to your specific needs.
