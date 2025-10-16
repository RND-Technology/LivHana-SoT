### 3A: SendGrid Template Creation & API Integration

**Claude Code Prompt:**

```

You are setting up automated email campaigns for a cannabis e-commerce Texas Takeover launch.

EMAIL SEQUENCES REQUIRED:

**1. Launch Campaign (4 emails over 7 days)**

- Email 1: "The Takeover Begins" (Day 1)
- Email 2: "Social Proof + Urgency" (Day 3)
- Email 3: "Referral Activation" (Day 5)
- Email 4: "Last Chance + Subscription Tease" (Day 7)

**2. Verification Reminder (4 emails over 72 hours)**

- Email 1: Immediate (15 min after order)
- Email 2: 24 hours later
- Email 3: 48 hours later
- Email 4: 72 hours (auto-refund notice)

**3. Review Request (7 days post-delivery)**

- Email 1: "How's your [Strain Name]? Review = Free Weed"

**4. Abandoned Cart (3 emails over 48 hours)**

- Email 1: 1 hour after abandonment
- Email 2: 24 hours later (with 10% discount)
- Email 3: 48 hours later (final chance)

TECHNICAL SETUP:

**SendGrid Account Configuration:**

- Domain authentication (SPF, DKIM, DMARC)
- Dedicated IP address (if volume >100K emails/month, else shared)
- Suppression groups: Bounces, Spam Reports, Unsubscribes, Marketing Emails
- Subuser accounts (if multiple senders needed)

**API Integration (Python SDK):**

```python
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))

# Dynamic template send
message = Mail(
    from_email=Email('noreply@reggieanddro.com', 'Reggie & Dro'),
    to_emails=To('customer@example.com'),
)
message.template_id = 'd-xxxxxxxxxxxxx'  # Dynamic template ID
message.dynamic_template_data = {
    'first_name': 'John',
    'order_id': 'R&D123456',
    'order_total': '$75.00',
    'loyalty_points': 150,
    'loyalty_value': '$15.00',
    ...
}

response = sg.send(message)
```

**Dynamic Template Requirements:**

- HTML + plain-text versions (for deliverability)
- Mobile-responsive (70%+ of opens on mobile)
- Personalization tokens (name, order details, points, etc.)
- UTM parameters on all links (track attribution)
- Unsubscribe link (CAN-SPAM compliance)
- Physical address in footer (required by law)

**Automation Triggers:**

**1. Order Created Webhook**

```
POST https://reggieanddro.com/api/webhooks/order-created
Body: { order_id, customer_email, items, total, verification_status }
Action: Trigger appropriate email (verification needed or order confirmation)
```

**2. Delivery Confirmed Webhook**

```
POST https://reggieanddro.com/api/webhooks/delivery-confirmed
Body: { order_id, customer_email, delivery_date }
Action: Schedule review request email for 7 days later
```

**3. Cart Abandoned Event**

```
POST https://reggieanddro.com/api/webhooks/cart-abandoned
Body: { cart_id, customer_email, items, cart_total }
Action: Trigger abandoned cart sequence
```

PERSONALIZATION DATA SOURCES:

- Customer profile (name, email, loyalty points) → PostgreSQL
- Order details (items, total, status) → Square API
- Product data (strain names, prices) → Square Catalog API
- Referral stats (count, earnings) → Custom referral table

A/B TESTING FRAMEWORK:

- Subject line tests (minimum 2 variants per campaign)
- Send time optimization (9-11 AM vs 2-4 PM vs 7-9 PM)
- CTA button text ("Shop Now" vs "Browse Strains" vs "Build Your Stash")
- Discount amount (10% vs 15% vs $10 flat)
- Email length (short vs long-form)

Success Criteria:

- Open rate >25%
- Click rate >3%
- Conversion rate >1%
- Unsubscribe rate <0.5%

COMPLIANCE CHECKLIST:

- ✓ CAN-SPAM compliant (unsubscribe, physical address, truthful subject lines)
- ✓ GDPR compliant (if any EU customers, though unlikely for Texas hemp)
- ✓ Cannabis marketing rules (no health claims, age-restricted audience)
- ✓ Opt-in confirmed (double opt-in preferred, single opt-in minimum)

MONITORING & OPTIMIZATION:

- Daily dashboard: Opens, clicks, conversions, unsubscribes
- Weekly report: Campaign performance, A/B test results, recommendations
- Real-time alerts: Spam rate >0.1%, bounce rate >2%
- Automated pause: If spam rate >0.5% (to protect sender reputation)

DELIVERABLES:

1. SendGrid account setup guide (with screenshots)
2. HTML email templates (all 11 emails, HTML + plain-text)
3. Python email automation script (send_email.py with all sequences)
4. Webhook handlers (Flask blueprint for all triggers)
5. A/B testing framework (test_config.yaml + results tracking)
6. Analytics dashboard (Metabase or custom with Chart.js)
7. Suppression list management (handle unsubscribes, bounces)
8. Documentation (setup guide, testing checklist, troubleshooting)

Create a production-ready email automation system with comprehensive testing and monitoring. Include detailed comments explaining compliance requirements and best practices.

```

**Expected Output:** Complete email automation system with SendGrid integration

---
