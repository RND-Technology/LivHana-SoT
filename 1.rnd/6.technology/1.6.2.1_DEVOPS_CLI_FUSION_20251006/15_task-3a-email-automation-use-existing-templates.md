### ✅ **Task 3A: Email Automation → Use Existing Templates**

**Translation:** Templates already created in EMAIL_CAMPAIGN_TEMPLATES.md → Load into SendGrid

**Process:**

1. Provision SendGrid API key (`op item get sendgrid`)
2. Create 11 dynamic templates in SendGrid UI:
   - Launch sequence (4 emails)
   - Verification reminders (4 emails)
   - Review request (1 email)
   - Abandoned cart (3 emails)
3. For each template:
   - Copy HTML from EMAIL_CAMPAIGN_TEMPLATES source doc
   - Add dynamic substitution tags ({{first_name}}, {{order_id}}, etc.)
   - Test template with sample data
   - Screenshot template ID + preview
4. Store template IDs in `.env`:

   ```
   SENDGRID_TEMPLATE_LAUNCH_1=d-xxxxxxxxxxxxx
   SENDGRID_TEMPLATE_LAUNCH_2=d-xxxxxxxxxxxxx
   ...
   ```

**Backend Integration:**

```typescript
// backend/src/services/email.ts
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendLaunchEmail(customer: Customer) {
  const msg = {
    to: customer.email,
    from: 'noreply@reggieanddro.com',
    templateId: process.env.SENDGRID_TEMPLATE_LAUNCH_1,
    dynamicTemplateData: {
      first_name: customer.first_name,
      loyalty_points: customer.loyalty_points,
      // ... other tokens
    },
  };
  await sgMail.send(msg);
}
```

**Evidence:** Test email screenshots + SendGrid delivery stats in `.evidence/2025-10-03/email/test-sends/`

---
