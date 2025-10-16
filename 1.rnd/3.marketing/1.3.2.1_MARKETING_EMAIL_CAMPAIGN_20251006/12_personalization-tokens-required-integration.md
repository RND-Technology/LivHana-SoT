## PERSONALIZATION TOKENS • REQUIRED INTEGRATION

**Standard (Built-in to SendGrid/Mailchimp):**

- `{{first_name}}`, `{{last_name}}`, `{{email_address}}`
- `{{unsubscribe_url}}`, `{{preferences_url}}`
- `{{company_name}}`, `{{company_address}}`

**Custom (Require API Integration):**

- `{{order_id}}`, `{{order_total}}`, `{{order_items}}` (array)
- `{{strain_name}}` (product name)
- `{{loyalty_points}}`, `{{loyalty_value}}` (current balance)
- `{{referral_count}}`, `{{referral_earnings}}`
- `{{cart_total}}`, `{{cart_items}}` (array)
- `{{verification_token}}`, `{{verification_needed}}`, `{{auto_refund_datetime}}`
- `{{payment_method}}` (last 4 of card)

**Action Required:** Build API endpoint to supply dynamic tokens

- Endpoint: `POST /api/v1/email/personalization-data`
- Input: `{ "email": "customer@email.com", "template_type": "launch_1" }`
- Output: JSON with all custom tokens for that customer

**Reference:** Lines 705-731 of source doc

---
