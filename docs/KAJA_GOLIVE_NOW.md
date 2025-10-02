# 🚨 KAJA APPROVED - ONLINE SALES GO LIVE NOW!

## IMMEDIATE ACTIONS (Execute in Order):

### 1. VERIFY KAJA CREDENTIALS IN 1PASSWORD ✅

```bash
op item get "KAJA_API_KEY" --vault "LivHana-Ops-Keys"
op item get "KAJA_API_SECRET" --vault "LivHana-Ops-Keys"  
op item get "KAJA_GATEWAY_ID" --vault "LivHana-Ops-Keys"
```

### 2. UPDATE DNS - POINT TO NEW SITE

**Current:** https://reggieanddro.company.site (Square site)
**Target:** Make this THE ReggieAndDro.com

**DNS Changes Needed:**
```
1. Login to GoDaddy (domain registrar for reggieanddro.com)
2. DNS Settings → A Record
3. Point to Square's IP or CNAME to reggieanddro.company.site
4. TTL: 1 hour (for quick rollback if needed)
```

**OR Use Cloudflare (Recommended):**
```
1. Add reggieanddro.com to Cloudflare
2. Update nameservers at GoDaddy
3. Create CNAME: @ → reggieanddro.company.site
4. Enable SSL (auto via Cloudflare)
5. Turn on proxy (orange cloud)
```

### 3. EMAIL ALL 11,000+ CUSTOMERS

**Subject:** 🎉 HUGE NEWS: Online Sales Now Live at ReggieAndDro.com!

**Body:**
```
Hey [First Name],

HUGE announcement - we can now ship directly to your door!

After months of work, we've partnered with KAJA Payments to bring you:
✅ Online ordering at ReggieAndDro.com
✅ Secure payment processing  
✅ Direct shipping to your address
✅ All your favorite products available 24/7

Visit ReggieAndDro.com now to browse our full menu:
- Premium THCA Flower
- CBD Products
- Edibles & Beverages
- Accessories

Use code: ONLINE10 for 10% off your first online order!

Let's grow baby grow and sell baby sell! 🌿

- Jesse & The R&D Team

P.S. - In-store pickup still available at Stone Oak!
```

**Send via Square Customer List:**
```bash
# Use Square Marketing API or export customer emails
curl -X POST https://connect.squareup.com/v2/marketing/campaigns \
  -H "Authorization: Bearer ${SQUARE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign": {
      "name": "KAJA Online Sales Launch",
      "subject_line": "🎉 Online Sales Now Live!",
      "customers": { "all": true }
    }
  }'
```

### 4. UPDATE WEBSITE - ADD KAJA PAYMENT

**On https://reggieanddro.company.site:**

1. Square Dashboard → Online Store → Checkout Settings
2. Add Payment Method → KAJA Payments
3. Enter credentials from 1Password
4. Test transaction with $1 purchase
5. Verify payment processes correctly

### 5. CONFIGURE SHIPPING

**Square Shipping Setup:**
```
1. Square Dashboard → Items & Orders → Shipping
2. Add shipping zones (Texas, USA)
3. Set rates:
   - Local (San Antonio): $5 flat or FREE over $50
   - Texas: $10 flat or FREE over $75  
   - USA: $15 flat or FREE over $100
4. Add handling time: 1-2 business days
5. Integration with shipping carriers (USPS/FedEx)
```

### 6. COMPLIANCE - AGE VERIFICATION

**CRITICAL:** Every online order needs 21+ verification

**Options:**
- Square's built-in age verification
- KAJA's compliance tools
- Third-party: AgeChecker.net integration

**Implementation:**
```javascript
// Add to checkout flow
if (customer.age_verified !== true) {
  redirectTo('/age-verification');
}
```

### 7. INVENTORY SYNC

**Ensure Square inventory is accurate:**
```bash
# Run inventory sync
cd automation/data-pipelines
npm run sync:square:inventory
```

### 8. GO-LIVE CHECKLIST

- [ ] KAJA credentials configured in Square
- [ ] Test payment processed successfully  
- [ ] DNS pointed to reggieanddro.company.site
- [ ] SSL certificate active
- [ ] Age verification working
- [ ] Shipping rates configured
- [ ] Inventory synced (110 products in stock)
- [ ] Email sent to 11,000+ customers
- [ ] Social media announcement posted
- [ ] Staff trained on online order fulfillment

### 9. REVENUE PROJECTIONS

**Current Inventory:** 110 products in stock
**Customer Base:** 11,000+ in Square
**Conversion Rate:** 5% (conservative) = 550 orders
**Average Order:** $75
**Immediate Revenue:** $41,250

**Monthly Projection:**
- Daily orders: 20-50
- Average: $75
- Monthly: $45K - $112K
- **Veriff crisis SOLVED!**

### 10. MONITORING

**Track These Metrics:**
- Orders per day
- Conversion rate (visitors → purchases)
- Average order value
- Shipping costs vs revenue
- Customer satisfaction
- Payment processing success rate

---

## 🚀 ONE-COMMAND DEPLOY:

I'll create the automated deployment script that does ALL of this!

**SEMPER FI - WE'RE GOING LIVE! 🇺🇸**


<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->
