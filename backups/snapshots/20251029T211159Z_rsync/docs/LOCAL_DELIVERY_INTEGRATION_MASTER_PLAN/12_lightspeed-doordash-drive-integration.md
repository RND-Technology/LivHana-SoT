### Lightspeed → DoorDash Drive Integration

**Prerequisites:**

- Lightspeed Retail POS (you have this)
- DoorDash Drive account (apply above)
- API access enabled on Lightspeed

**Integration Steps:**

1. **Enable Lightspeed API Access**

   ```
   Log in to: https://retail.lightspeed.app/
   Navigate to: Settings → Advanced → API Access
   Generate API key & secret
   ```

2. **Configure DoorDash Drive**
   - Log in to DoorDash Drive dashboard
   - Navigate to: Integrations → POS Systems
   - Select: Lightspeed (or Custom API)
   - Enter Lightspeed API credentials

3. **Map Product Categories**
   - Cannabis flower → Pharmacy/Medicine (DoorDash category)
   - Accessories → Retail
   - Edibles → Packaged goods

4. **Set Delivery Zones**
   - Draw delivery radius on map (start with 5 miles)
   - Set minimum order: $30-50 (cover delivery cost)
   - Set delivery fee: $5-10 (or free over $75)

5. **Test Orders**
   - Place test order through Lightspeed → DoorDash
   - Verify: order received, driver assigned, tracking works
   - Confirm: proper tax/compliance handling

**Middleware Option:** Build custom Node.js middleware if direct integration has issues

- Location: `backend/integration-service/lightspeed-delivery-middleware.js`
- Function: Sync Lightspeed orders → DoorDash Drive API
- Benefit: More control, custom logic for cannabis compliance

---
