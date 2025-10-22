## NON-CRITICAL ITEM 5: CONFIGURE LIGHTSPEED WEBHOOK (5 MIN)

**WHY:** Automatic delivery creation when orders placed
**IMPACT:** Without this, must create deliveries manually
**DEPENDENCY:** Delivery service must be deployed first (Trinity does this)

**EXECUTE (AFTER TRINITY DEPLOYS):**

1. Log in to Lightspeed: <https://retail.lightspeed.app/>
2. Go to: Settings → Integrations → Webhooks
3. Click "Add Webhook"
4. URL: `https://[DEPLOYMENT-URL]/api/delivery/lightspeed/webhook`
   - Trinity will provide URL after deployment
5. Events: Select "order.completed"
6. Click "Save"

**TIME:** 5 minutes
**COMPLETE:** [ ]
**WAIT FOR:** Trinity deployment (item will be marked when ready)

---
