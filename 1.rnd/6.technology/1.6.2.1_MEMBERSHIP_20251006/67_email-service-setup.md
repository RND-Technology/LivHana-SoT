## Email Service Setup

The system integrates with an email service at `EMAIL_SERVICE_URL`.

**Expected email service API:**

```
POST /api/email/send
{
  "to": "customer@example.com",
  "subject": "Welcome to LivHana Silver Membership!",
  "template": "membership_welcome",
  "data": {
    "tier": "Silver",
    "price": 97.00,
    "discount": 20,
    "benefits": [...],
    "membershipId": "MEM_12345",
    "nextBillingDate": "2025-11-01T12:00:00.000Z"
  }
}
```
