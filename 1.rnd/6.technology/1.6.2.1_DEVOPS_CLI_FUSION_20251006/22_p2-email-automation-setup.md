### **P2: Email Automation Setup**

1. Configure SendGrid domain auth (DNS records)
2. Create 11 dynamic templates
3. Implement email sending functions in backend
4. Set up CRON jobs (Cloud Scheduler):
   - Verification reminders: Check every hour for pending orders
   - Review requests: Check daily for delivered orders >7 days old
   - Abandoned cart: Check every 30min for carts >1hr old

**Evidence:** CRON job logs + test email deliveries in `.evidence/2025-10-03/email-automation/`

---
