## PERSONALIZATION TOKENS REFERENCE

**Standard Tokens (Available in All Platforms):**

- `{{first_name}}` - Customer first name
- `{{last_name}}` - Customer last name
- `{{email_address}}` - Customer email
- `{{unsubscribe_url}}` - One-click unsubscribe (required)
- `{{preferences_url}}` - Preference center
- `{{company_name}}` - "Reggie & Dro"
- `{{company_address}}` - Physical address (required)

**Custom Tokens (Require API Integration):**

- `{{order_id}}` - Order number (e.g., "R&D123456")
- `{{order_total}}` - Order total with currency (e.g., "$75.00")
- `{{order_items}}` - Array of order items (requires loop)
- `{{strain_name}}` - Product name
- `{{loyalty_points}}` - Current points balance
- `{{loyalty_value}}` - Dollar value of points
- `{{referral_count}}` - Number of successful referrals
- `{{referral_earnings}}` - Dollar amount earned from referrals
- `{{cart_total}}` - Abandoned cart total
- `{{cart_items}}` - Array of cart items
- `{{verification_token}}` - Unique verification link token
- `{{verification_needed}}` - What verification is required (e.g., "age verification and membership agreement")
- `{{auto_refund_datetime}}` - Formatted date/time of auto-refund
- `{{payment_method}}` - Last 4 of card (e.g., "Visa ending in 1234")

---
