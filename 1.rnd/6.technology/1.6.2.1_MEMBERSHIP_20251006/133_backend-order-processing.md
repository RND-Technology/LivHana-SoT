### Backend Order Processing

```javascript
const { calculateMembershipDiscount } = require('./membership');

// In order handler
const membership = await getMembershipByCustomerId(customerId);
const discount = membership
  ? calculateMembershipDiscount(subtotal, membership.tier)
  : 0;
```
