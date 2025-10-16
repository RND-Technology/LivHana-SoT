### 2. Order Processing

```javascript
// In order creation endpoint
const verification = await getVerificationStatus(customerId);
if (!verification.verified) {
  throw new Error('Age verification required');
}
// Process order...
```
