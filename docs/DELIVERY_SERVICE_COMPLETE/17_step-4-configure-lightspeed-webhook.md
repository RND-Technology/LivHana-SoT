### Step 4: Configure LightSpeed Webhook

1. Login to LightSpeed POS dashboard
2. Navigate to: **Settings → Webhooks**
3. Add new webhook:
   - **URL:** `https://[service-url]/api/v1/delivery/lightspeed/webhook`
   - **Events:** `order.completed`
   - **Secret:** (configured in JWT_SECRET)

---
