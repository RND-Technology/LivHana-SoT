# LivHana Membership System - Example Usage

## Quick Start Examples

### 1. Customer Subscribes to Silver Membership

**Frontend Flow:**
1. Customer selects Silver tier ($97/month)
2. Customer enters payment method
3. Frontend calls subscribe endpoint

```javascript
// Example: Customer checkout flow
const subscribeToMembership = async () => {
  const response = await fetch('/api/memberships/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({
      customerId: 'CUST_12345',
      email: 'jane.doe@example.com',
      tier: 'SILVER',
      paymentMethod: {
        id: 'pm_card_mastercard',
        type: 'card',
        last4: '5555'
      }
    })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Membership created:', result.membership);
    // Show success message
    // Redirect to membership dashboard
  } else {
    console.error('Subscription failed:', result.error);
    // Show error to user
  }
};
```

**Response:**
```json
{
  "success": true,
  "membership": {
    "id": "MEM_1696800000000_abc123",
    "customer_id": "CUST_12345",
    "email": "jane.doe@example.com",
    "tier": "SILVER",
    "status": "active",
    "price": 97.00,
    "discount_percent": 20,
    "subscription_id": "SUB_SILVER_1696800000000_def456",
    "start_date": "2025-10-01T12:00:00.000Z",
    "next_billing_date": "2025-11-01T12:00:00.000Z"
  }
}
```

---

### 2. Apply Membership Discount at Checkout

**Checkout Flow:**
1. Customer adds items to cart
2. System checks for membership
3. Discount automatically applied

```javascript
// Example: Calculate discount during checkout
const processCheckout = async (cartItems, customerId) => {
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  console.log('Cart subtotal:', subtotal); // $250.00

  // Get membership discount
  const discountResponse = await fetch(
    `/api/memberships/discount/${customerId}?subtotal=${subtotal}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      }
    }
  );

  const discount = await discountResponse.json();

  if (discount.hasDiscount) {
    console.log(`${discount.tier} member discount: -$${discount.discountAmount}`);
    console.log(`Final total: $${discount.finalTotal}`);

    // Display to user:
    // Subtotal: $250.00
    // Silver Member Discount (20%): -$50.00
    // Total: $200.00
    // You saved $50.00!
  }

  return {
    subtotal,
    discount: discount.discountAmount,
    total: discount.finalTotal,
    membershipTier: discount.tier
  };
};
```

**Example Cart Calculation:**

| Item | Price | Quantity | Subtotal |
|------|-------|----------|----------|
| Premium Flower | $45.00 | 2 | $90.00 |
| CBD Tincture | $60.00 | 1 | $60.00 |
| Edibles Pack | $50.00 | 2 | $100.00 |
| **Subtotal** | | | **$250.00** |
| **Silver Member Discount (20%)** | | | **-$50.00** |
| **Final Total** | | | **$200.00** |

---

### 3. Display Membership in User Profile

**Profile Page:**

```javascript
// Example: Fetch and display membership
const MembershipCard = ({ customerId }) => {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const response = await fetch(`/api/memberships/${customerId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });

        if (response.status === 404) {
          setMembership(null); // No membership
        } else {
          const data = await response.json();
          setMembership(data.membership);
        }
      } catch (error) {
        console.error('Failed to load membership:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [customerId]);

  if (loading) return <div>Loading...</div>;

  if (!membership) {
    return (
      <div className="no-membership">
        <h3>Not a member yet?</h3>
        <p>Join our membership program and save up to 30%!</p>
        <button onClick={() => showMembershipPlans()}>
          View Membership Plans
        </button>
      </div>
    );
  }

  return (
    <div className="membership-card">
      <h2>{membership.tier} Member</h2>
      <p className="discount">{membership.discount_percent}% OFF all orders</p>
      <p className="price">${membership.price}/month</p>
      <p className="next-billing">
        Next billing: {new Date(membership.next_billing_date).toLocaleDateString()}
      </p>

      <div className="benefits">
        <h3>Your Benefits:</h3>
        <ul>
          {membership.benefits.map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      </div>

      <div className="actions">
        <button onClick={() => upgradeMembership()}>
          Upgrade Tier
        </button>
        <button onClick={() => cancelMembership()}>
          Cancel Membership
        </button>
      </div>
    </div>
  );
};
```

---

### 4. Upgrade from Bronze to Gold

**Upgrade Flow:**

```javascript
// Example: Upgrade membership tier
const upgradeMembership = async (customerId, newTier) => {
  // Confirm with user
  const tierConfig = {
    'BRONZE': { price: 47, discount: 10 },
    'SILVER': { price: 97, discount: 20 },
    'GOLD': { price: 197, discount: 30 }
  };

  const currentTier = 'BRONZE';
  const proratedCharge = tierConfig[newTier].price - tierConfig[currentTier].price;

  const confirmed = confirm(
    `Upgrade to ${newTier} membership?\n` +
    `You will be charged $${proratedCharge} today for the upgrade.\n` +
    `Starting next month, you'll be charged $${tierConfig[newTier].price}/month.`
  );

  if (!confirmed) return;

  // Process upgrade
  const response = await fetch(`/api/memberships/${customerId}/upgrade`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({
      newTier: newTier
    })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Upgraded to', result.membership.tier);
    console.log('Prorated charge:', result.proratedCharge);
    // Show success message
    // Refresh membership display
  } else {
    console.error('Upgrade failed:', result.error);
  }
};
```

**Timeline Example:**
- Oct 1: Customer subscribes to Bronze ($47/month)
- Oct 15: Customer upgrades to Gold
  - Immediate charge: $150 (proration: $197 - $47)
  - New discount: 30% (was 10%)
- Nov 1: Regular Gold billing begins ($197/month)

---

### 5. Admin Dashboard - View Membership Stats

**Admin Panel:**

```javascript
// Example: Admin dashboard component
const MembershipDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/memberships/stats', {
        headers: {
          'Authorization': `Bearer ${adminJwtToken}` // Must have admin role
        }
      });

      const data = await response.json();
      setStats(data.stats);
    };

    fetchStats();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="membership-dashboard">
      <h1>Membership Analytics</h1>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Monthly Recurring Revenue</h3>
          <p className="big-number">${stats.monthlyRecurringRevenue.toLocaleString()}</p>
        </div>

        <div className="metric-card">
          <h3>Active Members</h3>
          <p className="big-number">{stats.activeMembers}</p>
        </div>

        <div className="metric-card">
          <h3>Churn Rate</h3>
          <p className="big-number">{stats.churnRate}</p>
        </div>
      </div>

      <div className="tier-distribution">
        <h2>Members by Tier</h2>
        <ul>
          <li>Bronze: {stats.tierDistribution.BRONZE}</li>
          <li>Silver: {stats.tierDistribution.SILVER}</li>
          <li>Gold: {stats.tierDistribution.GOLD}</li>
        </ul>
      </div>

      <div className="lifetime-value">
        <h2>Lifetime Value by Tier</h2>
        <ul>
          <li>Bronze: ${stats.lifetimeValueByTier.BRONZE}</li>
          <li>Silver: ${stats.lifetimeValueByTier.SILVER}</li>
          <li>Gold: ${stats.lifetimeValueByTier.GOLD}</li>
        </ul>
      </div>

      <p className="timestamp">
        Last updated: {new Date(stats.generatedAt).toLocaleString()}
      </p>
    </div>
  );
};
```

**Example Output:**
```
Membership Analytics

┌─────────────────────────────────┐
│ Monthly Recurring Revenue       │
│ $1,349.00                       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Active Members                  │
│ 17                              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Churn Rate                      │
│ 5.26%                           │
└─────────────────────────────────┘

Members by Tier:
• Bronze: 10 members
• Silver: 5 members
• Gold: 2 members

Lifetime Value by Tier:
• Bronze: $564.00
• Silver: $1,164.00
• Gold: $2,364.00
```

---

### 6. Cancel Membership

**Cancellation Flow:**

```javascript
// Example: Cancel membership with feedback
const cancelMembership = async (customerId) => {
  // Collect cancellation reason
  const reason = prompt('We\'re sorry to see you go. Can you tell us why?');

  if (!reason) return; // User cancelled

  const confirmed = confirm(
    'Are you sure you want to cancel your membership?\n' +
    'You will keep your benefits until the end of your current billing period.'
  );

  if (!confirmed) return;

  // Process cancellation
  const response = await fetch(`/api/memberships/${customerId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({
      reason: reason
    })
  });

  const result = await response.json();

  if (result.success) {
    const endDate = new Date(result.membership.next_billing_date);
    alert(
      'Membership cancelled.\n' +
      `You will keep your benefits until ${endDate.toLocaleDateString()}.\n` +
      'No further charges will be made.'
    );
  } else {
    console.error('Cancellation failed:', result.error);
  }
};
```

---

### 7. Backend Integration - Order Processing

**Automatic Discount Application:**

```javascript
// Example: Backend order processing with membership discount
const { calculateMembershipDiscount } = require('./membership');

async function processOrder(customerId, orderItems) {
  // Calculate order subtotal
  const subtotal = orderItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Get customer membership
  const membership = await getMembershipByCustomerId(customerId);

  // Calculate discount
  let discount = 0;
  let membershipTier = null;

  if (membership && membership.status === 'active') {
    discount = calculateMembershipDiscount(subtotal, membership.tier);
    membershipTier = membership.tier;
  }

  // Calculate final total
  const total = subtotal - discount;

  // Create order record
  const order = {
    id: generateOrderId(),
    customerId,
    items: orderItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    membershipDiscount: parseFloat(discount.toFixed(2)),
    membershipTier,
    total: parseFloat(total.toFixed(2)),
    createdAt: new Date().toISOString()
  };

  // Save order to database
  await saveOrder(order);

  return order;
}

// Example usage
const order = await processOrder('CUST_12345', [
  { id: 'PROD_1', name: 'Premium Flower', price: 45.00, quantity: 2 },
  { id: 'PROD_2', name: 'CBD Tincture', price: 60.00, quantity: 1 }
]);

console.log(order);
// {
//   id: 'ORD_12345',
//   customerId: 'CUST_12345',
//   subtotal: 150.00,
//   membershipDiscount: 30.00,  // 20% off Silver tier
//   membershipTier: 'SILVER',
//   total: 120.00
// }
```

---

## Common Use Cases

### Use Case 1: High-Volume Customer

**Scenario:** Customer spends $500/month on products

**Without Membership:**
- Monthly spend: $500
- Annual spend: $6,000

**With Bronze ($47/month, 10% off):**
- Product cost: $500 × 0.90 = $450
- Membership: $47
- Total: $497/month
- Annual total: $5,964
- **Savings: $36/year**

**With Silver ($97/month, 20% off):**
- Product cost: $500 × 0.80 = $400
- Membership: $97
- Total: $497/month
- Annual total: $5,964
- **Savings: $36/year**

**With Gold ($197/month, 30% off):**
- Product cost: $500 × 0.70 = $350
- Membership: $197
- Total: $547/month
- Annual total: $6,564
- **Cost increase: $564/year** (but gets VIP benefits)

**Best choice:** Silver or Bronze depending on benefit preference

---

### Use Case 2: VIP Customer

**Scenario:** Customer spends $800/month, values exclusive access

**With Gold ($197/month, 30% off):**
- Product cost: $800 × 0.70 = $560
- Membership: $197
- Total: $757/month
- Annual total: $9,084

**Without Membership:**
- Annual spend: $9,600

**Annual savings: $516 + VIP benefits**

---

### Use Case 3: Occasional Customer

**Scenario:** Customer spends $100/month on products

**Without Membership:**
- Monthly spend: $100
- Annual spend: $1,200

**With Bronze ($47/month, 10% off):**
- Product cost: $100 × 0.90 = $90
- Membership: $47
- Total: $137/month
- Annual total: $1,644
- **Not worth it - costs $444 more**

**Recommendation:** Wait until spending $470/month before joining

---

## Error Handling Examples

### Example 1: Customer Already Has Membership

```javascript
const response = await fetch('/api/memberships/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    customerId: 'CUST_12345',
    email: 'jane@example.com',
    tier: 'SILVER',
    paymentMethod: { id: 'pm_123' }
  })
});

// Response: 400 Bad Request
{
  "success": false,
  "error": "Customer already has an active membership"
}
```

### Example 2: Invalid Tier

```javascript
const response = await fetch('/api/memberships/subscribe', {
  method: 'POST',
  // ...
  body: JSON.stringify({
    tier: 'PLATINUM' // Invalid
  })
});

// Response: 400 Bad Request
{
  "success": false,
  "error": "Invalid membership tier. Must be one of: BRONZE, SILVER, GOLD"
}
```

### Example 3: Payment Failure

```javascript
// When KAJA gateway rejects payment
{
  "success": false,
  "error": "Payment processing failed: Card declined"
}
```

---

## Testing the API

### Using cURL

```bash
# 1. Subscribe to membership
curl -X POST http://localhost:3005/api/memberships/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerId": "CUST_TEST_001",
    "email": "test@example.com",
    "tier": "SILVER",
    "paymentMethod": {
      "id": "pm_test_card",
      "type": "card",
      "last4": "4242"
    }
  }'

# 2. Get membership
curl http://localhost:3005/api/memberships/CUST_TEST_001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Calculate discount
curl "http://localhost:3005/api/memberships/discount/CUST_TEST_001?subtotal=200.00" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Upgrade membership
curl -X PUT http://localhost:3005/api/memberships/CUST_TEST_001/upgrade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"newTier": "GOLD"}'

# 5. Get stats (admin only)
curl http://localhost:3005/api/memberships/stats \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# 6. Cancel membership
curl -X PUT http://localhost:3005/api/memberships/CUST_TEST_001/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"reason": "Testing cancellation"}'
```

### Using Postman

Import this collection:

```json
{
  "info": {
    "name": "LivHana Membership API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Subscribe to Membership",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/memberships/subscribe",
        "header": [
          {"key": "Authorization", "value": "Bearer {{jwtToken}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"customerId\": \"CUST_TEST_001\",\n  \"email\": \"test@example.com\",\n  \"tier\": \"SILVER\",\n  \"paymentMethod\": {\n    \"id\": \"pm_test_card\",\n    \"type\": \"card\",\n    \"last4\": \"4242\"\n  }\n}"
        }
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:3005"},
    {"key": "jwtToken", "value": "YOUR_JWT_TOKEN_HERE"}
  ]
}
```

---

## Next Steps

1. **Test the API** with your JWT tokens
2. **Configure environment variables** from `.env.membership.example`
3. **Set up KAJA payment gateway** with real Authorize.Net credentials
4. **Create BigQuery table** for production data
5. **Implement email templates** for welcome and notification emails
6. **Build frontend UI** for membership management
7. **Set up monitoring** for MRR, churn, and payment failures

## Need Help?

- API Documentation: See `MEMBERSHIP_API.md`
- Run Tests: `npm test src/membership.test.js`
- Check Logs: Look for `membership-service` logger output

<!-- Last verified: 2025-10-02 -->
