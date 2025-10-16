### Step 2: Configure Lightspeed Webhook

```bash
# Use Lightspeed API to create webhook for order.created event
curl -X POST https://api.lightspeedapp.com/API/Account/${ACCOUNT_ID}/Webhook.json \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "Webhook": {
      "url": "https://your-domain.com/api/webhooks/lightspeed/order-created",
      "event": "order.created",
      "active": true
    }
  }'
```
