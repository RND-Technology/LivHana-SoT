### **1. Error Handling Pattern:**

```javascript
// ⚠️ INCONSISTENT: Some endpoints swallow errors
try {
  await sendWelcomeEmail(email, tier, membershipDetails);
} catch (error) {
  logger.error('Failed to send welcome email', error);
  // Don't fail the subscription creation if email fails
}
```

**STANDARDIZE:** Circuit breaker pattern for external services:

```javascript
const CircuitBreaker = require('opossum');

const emailCircuitBreaker = new CircuitBreaker(sendEmail, {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});

try {
  await emailCircuitBreaker.fire(emailData);
} catch (error) {
  logger.warn({ error }, 'Email circuit breaker open, queuing for retry');
  await emailQueue.add('retry', { emailData, attemptNumber: 1 });
}
```
