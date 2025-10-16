### CLAUDE CODE CLI IMPLEMENTATION TASKS

**Task 1: LightSpeed Theme Customization**

```bash
# Prompt for Claude Code CLI Sonnet 4.5:

"Access LightSpeed webstore theme files for reggieanddro.company.site.
Implement the following customizations:

1. Add age-gate modal (JavaScript + HTML as specified)
2. Inject hero section HTML/CSS for 'Texas Takeover' campaign
3. Customize product page template with review widget, terpene profiles, COA expandable
4. Add loyalty points display to header and cart page
5. Implement countdown timer for launch urgency
6. Optimize all images to WebP format, lazy loading
7. Add structured data markup for Google Shopping

Maintain mobile-first responsive design. Test across Chrome, Safari, Firefox.
Commit changes with detailed changelog."
```

**Task 2: Square API Integration**

```bash
# Prompt:

"Build Square API integration layer for Reggie & Dro webstore:

1. Create customer verification check endpoint (query Veriff approval status)
2. Build order flagging system for post-purchase verification
3. Set up automated email trigger via SendGrid/Mailchimp API
4. Implement 72-hour countdown timer with auto-refund logic
5. Create inventory sync between Square and LightSpeed (real-time)
6. Build loyalty points calculation engine (10 points per $1, review bonuses)
7. Add referral tracking system (unique links, credit application)

Language: Python Flask microservice
Database: PostgreSQL (existing structure)
Deploy: Heroku or Google Cloud Run
Authentication: Square OAuth
Error handling: Comprehensive logging, Sentry alerts

Document all endpoints with Swagger/OpenAPI spec."
```

**Task 3: Email Automation Setup**

```bash
# Prompt:

"Set up email automation for Reggie & Dro Texas Takeover campaign:

1. Design 4-email launch sequence (HTML templates provided)
2. Build verification reminder sequence (3 emails over 72 hours)
3. Create review request automation (7 days post-delivery)
4. Set up abandoned cart recovery (3-email sequence)
5. Configure CAN-SPAM compliance (unsubscribe, physical address, opt-in confirmation)
6. Implement dynamic countdown timers in email (live countdown)
7. A/B testing framework (subject lines, send times)

Platform: SendGrid (preferred) or Mailchimp
Segments: Past customers, new customers, abandoned carts, re-engagement
Personalization: Name, order details, points balance, product recommendations

Integrate with Square API for dynamic data pulls."
```
