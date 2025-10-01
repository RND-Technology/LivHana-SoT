# LivHana Membership System API Documentation

## Overview

The LivHana Membership System provides a three-tier subscription model with recurring billing, automatic discounts, and comprehensive analytics. The system integrates with the KAJA payment gateway (Authorize.Net) for cannabis-compliant payment processing and stores data in BigQuery for analytics.

## Membership Tiers

### Bronze - $47/month
- **Discount:** 10% on all products
- **Benefits:**
  - 10% discount on all products
  - Monthly newsletter
  - Member-only promotions
- **Break-even:** Customer needs to spend $470/month to break even

### Silver - $97/month
- **Discount:** 20% on all products
- **Benefits:**
  - 20% discount on all products
  - Access to exclusive strains
  - Monthly gift with purchase
  - Priority customer support
  - Early access to new products
- **Break-even:** Customer needs to spend $485/month to break even

### Gold - $197/month
- **Discount:** 30% on all products
- **Benefits:**
  - 30% discount on all products
  - VIP event invitations
  - Monthly raffle entries
  - Exclusive limited edition strains
  - Concierge service
  - Premium gift box monthly
  - Private consultation sessions
- **Break-even:** Customer needs to spend $657/month to break even

## Authentication

All API endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

The token must be signed with the `JWT_SECRET` and include the following claims:
- `aud`: JWT_AUDIENCE
- `iss`: JWT_ISSUER

## API Endpoints

### 1. Create Subscription

Create a new membership subscription for a customer.

**Endpoint:** `POST /api/memberships/subscribe`

**Request Body:**
```json
{
  "customerId": "CUST_12345",
  "email": "customer@example.com",
  "tier": "SILVER",
  "paymentMethod": {
    "id": "pm_12345",
    "type": "card",
    "last4": "4242"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "membership": {
    "id": "MEM_1696800000000_abc123",
    "customer_id": "CUST_12345",
    "email": "customer@example.com",
    "tier": "SILVER",
    "status": "active",
    "price": 97.00,
    "discount_percent": 20,
    "subscription_id": "SUB_SILVER_1696800000000_def456",
    "payment_method_id": "PM_xyz789",
    "start_date": "2025-10-01T12:00:00.000Z",
    "next_billing_date": "2025-11-01T12:00:00.000Z",
    "cancel_date": null,
    "created_at": "2025-10-01T12:00:00.000Z",
    "updated_at": "2025-10-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or customer already has active membership
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Payment processing or database error

---

### 2. Get Current Membership

Retrieve the current membership details for a customer.

**Endpoint:** `GET /api/memberships/:customerId`

**Example:** `GET /api/memberships/CUST_12345`

**Response (200 OK):**
```json
{
  "success": true,
  "membership": {
    "id": "MEM_1696800000000_abc123",
    "customer_id": "CUST_12345",
    "email": "customer@example.com",
    "tier": "SILVER",
    "status": "active",
    "price": 97.00,
    "discount_percent": 20,
    "subscription_id": "SUB_SILVER_1696800000000_def456",
    "payment_method_id": "PM_xyz789",
    "start_date": "2025-10-01T12:00:00.000Z",
    "next_billing_date": "2025-11-01T12:00:00.000Z",
    "cancel_date": null,
    "created_at": "2025-10-01T12:00:00.000Z",
    "updated_at": "2025-10-01T12:00:00.000Z",
    "benefits": [
      "20% discount on all products",
      "Access to exclusive strains",
      "Monthly gift with purchase",
      "Priority customer support",
      "Early access to new products"
    ]
  }
}
```

**Error Responses:**
- `404 Not Found`: No membership found for customer
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Database error

---

### 3. Upgrade Membership

Upgrade a customer's membership to a higher tier with prorated billing.

**Endpoint:** `PUT /api/memberships/:customerId/upgrade`

**Request Body:**
```json
{
  "newTier": "GOLD"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "membership": {
    "id": "MEM_1696800000000_abc123",
    "customer_id": "CUST_12345",
    "email": "customer@example.com",
    "tier": "GOLD",
    "status": "active",
    "price": 197.00,
    "discount_percent": 30,
    "subscription_id": "SUB_SILVER_1696800000000_def456",
    "payment_method_id": "PM_xyz789",
    "start_date": "2025-10-01T12:00:00.000Z",
    "next_billing_date": "2025-11-01T12:00:00.000Z",
    "cancel_date": null,
    "created_at": "2025-10-01T12:00:00.000Z",
    "updated_at": "2025-10-01T15:30:00.000Z"
  },
  "proratedCharge": 100.00
}
```

**Error Responses:**
- `400 Bad Request`: Missing newTier, invalid tier, or not an upgrade
- `404 Not Found`: No active membership found
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Payment processing error

**Notes:**
- The prorated amount is charged immediately
- Proration = (New Tier Price - Current Tier Price)
- Full new tier price will be charged on next billing date

---

### 4. Cancel Subscription

Cancel a customer's membership. Subscription remains active until end of current billing period.

**Endpoint:** `PUT /api/memberships/:customerId/cancel`

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Membership cancelled successfully",
  "membership": {
    "id": "MEM_1696800000000_abc123",
    "customer_id": "CUST_12345",
    "email": "customer@example.com",
    "tier": "SILVER",
    "status": "cancelled",
    "price": 97.00,
    "discount_percent": 20,
    "subscription_id": "SUB_SILVER_1696800000000_def456",
    "payment_method_id": "PM_xyz789",
    "start_date": "2025-10-01T12:00:00.000Z",
    "next_billing_date": "2025-11-01T12:00:00.000Z",
    "cancel_date": "2025-10-15T10:00:00.000Z",
    "created_at": "2025-10-01T12:00:00.000Z",
    "updated_at": "2025-10-15T10:00:00.000Z",
    "cancel_reason": "Customer requested cancellation"
  }
}
```

**Error Responses:**
- `404 Not Found`: No active membership found
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Payment gateway error

---

### 5. Get Membership Statistics (Admin Only)

Retrieve comprehensive membership statistics and analytics.

**Endpoint:** `GET /api/memberships/stats`

**Authorization:** Requires admin role in JWT token

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "monthlyRecurringRevenue": 1349.00,
    "activeMembers": 17,
    "churnRate": "5.26%",
    "tierDistribution": {
      "BRONZE": 10,
      "SILVER": 5,
      "GOLD": 2
    },
    "lifetimeValueByTier": {
      "BRONZE": 564.00,
      "SILVER": 1164.00,
      "GOLD": 2364.00
    },
    "generatedAt": "2025-10-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `403 Forbidden`: User does not have admin role
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Database error

**Metrics Explained:**
- **MRR (Monthly Recurring Revenue):** Total monthly revenue from all active subscriptions
- **Active Members:** Count of customers with active subscriptions
- **Churn Rate:** Percentage of members who cancelled in last 30 days
- **Tier Distribution:** Number of active members in each tier
- **Lifetime Value (LTV):** Estimated lifetime value per tier (monthly price × 12 months)

---

### 6. Calculate Discount for Checkout

Calculate the membership discount for a given order subtotal.

**Endpoint:** `GET /api/memberships/discount/:customerId?subtotal=100.00`

**Query Parameters:**
- `subtotal` (required): Order subtotal before discount

**Example:** `GET /api/memberships/discount/CUST_12345?subtotal=150.00`

**Response (200 OK) - With Membership:**
```json
{
  "success": true,
  "hasDiscount": true,
  "discountAmount": 30.00,
  "discountPercent": 20,
  "finalTotal": 120.00,
  "tier": "SILVER"
}
```

**Response (200 OK) - No Membership:**
```json
{
  "success": true,
  "hasDiscount": false,
  "discountAmount": 0,
  "discountPercent": 0,
  "finalTotal": 150.00
}
```

**Error Responses:**
- `400 Bad Request`: Missing subtotal parameter
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Database error

**Usage:**
This endpoint should be called during checkout to:
1. Check if customer has active membership
2. Calculate discount amount
3. Display savings to customer
4. Apply discount to final order total

---

## Integration Guide

### Frontend Integration

#### 1. Subscribe to Membership

```javascript
const subscribeMembership = async (customerId, email, tier, paymentMethod) => {
  const response = await fetch('/api/memberships/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({
      customerId,
      email,
      tier,
      paymentMethod
    })
  });

  const data = await response.json();
  return data;
};
```

#### 2. Get Membership During Checkout

```javascript
const getMembershipDiscount = async (customerId, subtotal) => {
  const response = await fetch(
    `/api/memberships/discount/${customerId}?subtotal=${subtotal}`,
    {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    }
  );

  const data = await response.json();

  if (data.hasDiscount) {
    console.log(`Save $${data.discountAmount} with ${data.tier} membership!`);
  }

  return data;
};
```

#### 3. Display Membership in User Profile

```javascript
const fetchMembership = async (customerId) => {
  const response = await fetch(`/api/memberships/${customerId}`, {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  });

  if (response.status === 404) {
    return null; // No membership
  }

  const data = await response.json();
  return data.membership;
};
```

### Backend Integration

#### Apply Discount at Checkout

```javascript
const { calculateMembershipDiscount } = require('./membership');

async function processOrder(customerId, items) {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Get membership
  const membership = await getMembershipByCustomerId(customerId);

  let discount = 0;
  if (membership && membership.status === 'active') {
    discount = calculateMembershipDiscount(subtotal, membership.tier);
  }

  const total = subtotal - discount;

  return {
    subtotal,
    discount,
    total,
    membershipTier: membership?.tier
  };
}
```

## Database Schema

### BigQuery Table: `commerce.memberships`

```sql
CREATE TABLE `commerce.memberships` (
  id STRING NOT NULL,
  customer_id STRING NOT NULL,
  email STRING NOT NULL,
  tier STRING NOT NULL,
  status STRING NOT NULL,
  price FLOAT64 NOT NULL,
  discount_percent INT64 NOT NULL,
  subscription_id STRING,
  payment_method_id STRING,
  start_date TIMESTAMP NOT NULL,
  next_billing_date TIMESTAMP NOT NULL,
  cancel_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

### Indexes (Recommended)

```sql
-- Query by customer_id (most common operation)
CREATE INDEX idx_customer_id ON `commerce.memberships`(customer_id);

-- Query active memberships
CREATE INDEX idx_status ON `commerce.memberships`(status);

-- Analytics queries by tier
CREATE INDEX idx_tier ON `commerce.memberships`(tier);
```

## Email Notifications

The system sends automated emails for the following events:

### 1. Welcome Email
- **Trigger:** New subscription created
- **Template:** `membership_welcome`
- **Includes:** Tier benefits, pricing, next billing date

### 2. Upgrade Confirmation (Future Enhancement)
- **Trigger:** Tier upgrade completed
- **Includes:** New benefits, prorated charge amount

### 3. Cancellation Confirmation (Future Enhancement)
- **Trigger:** Subscription cancelled
- **Includes:** Effective end date, access until billing period ends

## Payment Processing

### KAJA Gateway (Authorize.Net)

The system uses Authorize.Net for recurring billing with cannabis compliance:

1. **Subscription Creation:**
   - Customer payment method is tokenized
   - Recurring subscription created with monthly interval
   - First charge processed immediately

2. **Recurring Billing:**
   - Automatic monthly charges on billing date
   - Failed payments trigger retry logic (handled by gateway)
   - Customer notified of payment failures

3. **Proration:**
   - Upgrades charge the difference immediately
   - Full new price charged on next billing cycle

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Testing

Run the test suite:

```bash
cd backend/integration-service
npm test src/membership.test.js
```

### Test Coverage

- Membership tier configurations
- Discount calculations
- Business logic validation
- API response structures
- Payment gateway integration
- BigQuery operations
- Input validation
- Security and authorization
- Date handling
- Metrics calculations

## Monitoring and Alerts

### Key Metrics to Monitor

1. **MRR Growth:** Track monthly recurring revenue trends
2. **Churn Rate:** Alert if churn exceeds 10% monthly
3. **Payment Failures:** Monitor failed recurring payments
4. **Tier Distribution:** Track which tiers are most popular
5. **Upgrade/Downgrade Rate:** Measure tier mobility

### Recommended Alerts

- MRR drops by >5% in a week
- Churn rate exceeds 10% in a month
- Payment failure rate exceeds 5%
- BigQuery writes fail

## Security Considerations

1. **JWT Authentication:** All endpoints require valid JWT
2. **Admin Endpoints:** Stats endpoint restricted to admin role
3. **PCI Compliance:** Payment methods tokenized, no card data stored
4. **Data Encryption:** All data encrypted at rest in BigQuery
5. **Audit Logging:** All membership changes logged with user context

## Future Enhancements

1. **Gift Memberships:** Allow purchasing memberships for others
2. **Annual Plans:** Add annual payment option with discount
3. **Pause Subscription:** Allow temporary pause instead of cancel
4. **Referral Program:** Reward members for referring friends
5. **Tier-Specific Products:** Exclusive products for each tier
6. **Member Dashboard:** Dedicated UI for membership management
7. **Webhook Integration:** Real-time events for membership changes
8. **A/B Testing:** Test different pricing and benefits

## Support

For questions or issues with the membership system:

- **Technical Issues:** Contact backend team
- **Payment Issues:** Contact KAJA/Authorize.Net support
- **BigQuery Issues:** Contact data engineering team
- **Customer Support:** Use admin dashboard to manage subscriptions
