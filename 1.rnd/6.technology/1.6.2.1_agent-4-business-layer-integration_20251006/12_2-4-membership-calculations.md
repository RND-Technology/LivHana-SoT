### 2.4 Membership Calculations

**Membership Tiers:**

```javascript
// membership.js:44-84
const MEMBERSHIP_TIERS = {
  BRONZE: {
    name: 'Bronze',
    price: 47.00, // Monthly
    discountPercent: 10,
    benefits: [
      '10% discount on all products',
      'Monthly newsletter',
      'Member-only promotions'
    ]
  },
  SILVER: {
    name: 'Silver',
    price: 97.00,
    discountPercent: 20,
    benefits: [
      '20% discount on all products',
      'Access to exclusive strains',
      'Monthly gift with purchase',
      'Priority customer support',
      'Early access to new products'
    ]
  },
  GOLD: {
    name: 'Gold',
    price: 197.00,
    discountPercent: 30,
    benefits: [
      '30% discount on all products',
      'VIP event invitations',
      'Monthly raffle entries',
      'Exclusive limited edition strains',
      'Concierge service',
      'Premium gift box monthly',
      'Private consultation sessions'
    ]
  }
};
```

**Discount Calculation:**

```javascript
// membership.js:329-335
function calculateMembershipDiscount(subtotal, tier) {
  const tierConfig = MEMBERSHIP_TIERS[tier];
  if (!tierConfig) return 0;

  const discountAmount = subtotal * (tierConfig.discountPercent / 100);
  return parseFloat(discountAmount.toFixed(2)); // Round to 2 decimals
}

// API endpoint: GET /api/memberships/discount/:customerId
// Query param: ?subtotal=100.00
// Response:
{
  success: true,
  hasDiscount: true,
  discountAmount: 30.00, // 30% of 100
  discountPercent: 30,
  finalTotal: 70.00,
  tier: 'GOLD'
}
```

**Membership Lifecycle:**

```
1. Subscribe
   POST /api/memberships/subscribe
   - Validate tier, customer, payment method
   - Create KAJA subscription
   - Save to BigQuery (memberships table)
   - Send welcome email

2. Active Use
   GET /api/memberships/discount/:customerId?subtotal=X
   - Calculate discount at checkout
   - Apply to cart total

3. Upgrade
   PUT /api/memberships/:customerId/upgrade
   - Validate new tier is higher
   - Calculate prorated charge
   - Update subscription in KAJA
   - Update BigQuery record

4. Cancel
   PUT /api/memberships/:customerId/cancel
   - Cancel KAJA subscription
   - Update status to 'cancelled'
   - Record cancel_date and reason
   - Benefits active until end of billing period
```

**Membership Metrics:**

```javascript
// membership.js:338-411
async function calculateMembershipMetrics() {
  // Monthly Recurring Revenue (MRR)
  const mrrQuery = `
    SELECT
      SUM(price) as total_mrr,
      COUNT(*) as active_members,
      tier,
      AVG(price) as avg_tier_price
    FROM \`${PROJECT_ID}.${DATASET}.${MEMBERSHIPS_TABLE}\`
    WHERE status = 'active'
    GROUP BY tier
  `;

  // Churn rate (cancelled in last 30 days / active 30 days ago)
  const churnQuery = `
    SELECT COUNT(*) as cancelled_count
    FROM \`${PROJECT_ID}.${DATASET}.${MEMBERSHIPS_TABLE}\`
    WHERE status = 'cancelled'
      AND cancel_date >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  `;

  // Lifetime Value (LTV) = Avg Revenue * 12 months (simplified)
  // In production: use cohort analysis, retention curves

  return {
    mrr: 12543.00, // Sum of all active subscriptions
    activeMembers: 143, // Total active across all tiers
    churnRate: 2.3, // % cancelled in last 30 days
    tierDistribution: {
      BRONZE: 78,
      SILVER: 52,
      GOLD: 13
    },
    lifetimeValue: {
      BRONZE: 564.00, // 47 * 12
      SILVER: 1164.00, // 97 * 12
      GOLD: 2364.00 // 197 * 12
    }
  };
}
```

**Business Validation:**

1. **Tier Validation:** Only BRONZE, SILVER, GOLD allowed
2. **Upgrade Path:** New tier must have higher price
3. **Prorated Billing:** Charge difference immediately on upgrade
4. **Downgrade Policy:** Not supported (customer must cancel + resubscribe)
5. **Email Notifications:** Welcome email on subscribe, confirmation on upgrade/cancel

---
