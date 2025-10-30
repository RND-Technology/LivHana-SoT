### **P0: SendGrid Setup (must complete before any email sends)**

1. Provision SendGrid API key
   - Check 1Password: `op item get sendgrid` OR
   - Create new account: sendgrid.com/pricing (free tier = 100 emails/day, paid = $20/mo for 50K emails/month)
2. Configure domain authentication (DKIM + SPF)
   - Add DNS TXT records to Cloudflare/Google Domains
   - Verify authentication in SendGrid dashboard
3. Set up unsubscribe group ("Marketing Emails")
4. Configure sender identity (<noreply@reggieanddro.com>)
5. Test email send to team addresses

**Evidence:** Screenshot SendGrid dashboard + DNS records in `.evidence/2025-10-03/sendgrid/`

---
