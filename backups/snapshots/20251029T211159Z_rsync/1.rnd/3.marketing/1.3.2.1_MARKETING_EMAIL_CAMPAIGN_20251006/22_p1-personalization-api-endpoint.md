### **P1: Personalization API Endpoint**

1. Build `/api/v1/email/personalization-data` endpoint
   - Input: `{ "email": "customer@email.com", "template_type": "launch_1" }`
   - Query customer database for:
     - Order history (order_id, order_total, order_items)
     - Loyalty points (current balance, dollar value)
     - Referrals (count, earnings)
     - Cart contents (if abandoned)
   - Output: JSON with all custom tokens
2. Integrate with SendGrid Dynamic Templates
   - Use SendGrid substitution tags
   - Test with real customer data
3. Set up automated triggers:
   - Verification reminders: 15min, 24hr, 48hr, 72hr post-order
   - Review requests: 7 days post-delivery (via tracking webhook)
   - Abandoned cart: 1hr, 24hr, 48hr post-abandon

**Evidence:** `curl` test outputs + code in `.evidence/2025-10-03/api/`

---
