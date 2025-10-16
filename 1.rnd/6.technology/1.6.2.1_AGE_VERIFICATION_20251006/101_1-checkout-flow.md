### 1. Checkout Flow

```javascript
// Before allowing checkout
const status = await checkAgeVerification(customerId);
if (status.verified && !status.expired) {
  // Allow checkout
} else {
  // Redirect to age verification
}
```
