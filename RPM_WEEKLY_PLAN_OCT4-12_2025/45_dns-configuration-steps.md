#### **DNS Configuration Steps:**

1. **Log in to GoDaddy DNS Manager**
   - Domain: reggieanddro.com
   - Navigate to: DNS > Manage DNS

2. **Update Records:**
   - **A Record:**
     - Name: @
     - Value: [Lightspeed IP from Leanne]
     - TTL: 600 (10 minutes)

   - **CNAME Record:**
     - Name: www
     - Value: reggieanddro.company.site
     - TTL: 600

3. **Verify SSL Provisioning:**
   - Lightspeed auto-generates SSL certificate
   - Allow 5-10 minutes for provisioning
   - Test: <https://reggieanddro.com> (should load without certificate warning)

4. **Test Checkout Flow:**
   - Place test order
   - Verify Authorize.net processes payment
   - Check Lightspeed order creation
   - Confirm email notifications sent
