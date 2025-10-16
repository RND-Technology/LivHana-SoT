### 4. Customer Account

```javascript
// Show verification status in customer account
const status = await getVerificationStatus(customerId);
if (status.expired) {
  showReverificationPrompt();
}
```

---
