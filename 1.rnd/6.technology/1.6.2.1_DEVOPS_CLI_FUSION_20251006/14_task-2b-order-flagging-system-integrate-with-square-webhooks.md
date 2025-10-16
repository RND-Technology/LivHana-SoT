### 🔴 **Task 2B: Order Flagging System → Integrate with Square Webhooks**

**Translation:** Use Square's existing webhook system, not custom polling

**Square Webhook Setup:**

1. Square Developer Console → Applications → [Your App] → Webhooks
2. Subscribe to events:
   - `order.created`
   - `payment.updated`
   - `refund.created`
3. Set webhook URL: `https://backend-api-XXXXX.run.app/webhooks/square`
4. Verify webhook signature (security requirement)

**Backend Implementation:**

```typescript
// backend/src/routes/webhooks.ts
app.post('/webhooks/square', async (req, res) => {
  // Verify Square signature
  const signature = req.headers['x-square-signature'];
  const isValid = verifySquareWebhook(req.body, signature, SQUARE_WEBHOOK_SECRET);
  if (!isValid) return res.status(401).send('Invalid signature');

  const event = req.body;
  if (event.type === 'order.created') {
    // Check customer verification status
    const customer = await checkVerification(event.data.object.customer_id);
    if (!customer.all_verified) {
      // Flag order + trigger email sequence
      await flagOrder(event.data.object.id, customer.email);
      await sendVerificationEmail(customer.email, event.data.object.id);
    }
  }
  res.status(200).send('OK');
});
```

**Evidence:** Webhook test via Square Dashboard + logs in `.evidence/2025-10-03/webhooks/square-order-created.txt`

---
