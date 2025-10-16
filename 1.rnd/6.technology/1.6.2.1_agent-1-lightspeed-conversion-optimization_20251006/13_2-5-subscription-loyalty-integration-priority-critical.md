### 2.5 Subscription & Loyalty Integration (Priority: CRITICAL)

**Current Gap:** Membership system exists but not integrated with LightSpeed sync.

**Missing Features:**

- Automatic loyalty points for purchases
- Subscription discount application at checkout
- Member tier visibility in LightSpeed
- Automatic review request after purchase

**Code Location:** `backend/integration-service/src/membership.js:328-335` (discount calculation exists but not automated)

**CONVERSION IMPACT:**

- Manual discount application = friction = lower conversion
- No automated loyalty = lower LTV
- Missing review generation = no social proof
- Subscription value not visible at checkout

**OPTIMIZATION OPPORTUNITY:**

```javascript
// NEW FILE: backend/integration-service/src/lightspeed-loyalty-sync.js
async function syncPurchaseToLoyalty(transaction) {
  // Auto-apply loyalty points
  if (transaction.customer_id) {
    const points = Math.floor(transaction.amount); // 1 point per $1
    await awardLoyaltyPoints(transaction.customer_id, points, 'PURCHASE');

    // Check for member discount eligibility
    const membership = await getMembershipByCustomerId(transaction.customer_id);
    if (membership && membership.status === 'active') {
      const discount = calculateMembershipDiscount(transaction.amount, membership.tier);
      await applyRetroactiveDiscount(transaction.id, discount);
    }

    // Trigger automated review request (24 hours after delivery)
    await scheduleReviewRequest(transaction.customer_id, transaction.id, '24h');
  }
}
```

**ROI PROJECTION:**

- **Dev Time:** 20 hours
- **Revenue Impact:** +$40K/month from loyalty-driven repeat purchases (Texas Takeover plan: 500 points = free eighth = incentive to spend $500)
- **LTV Increase:** 3x (per membership.js:397 - 12-month LTV calculation)
- **Review Generation:** 100 points per review = incentive = social proof = higher conversion
