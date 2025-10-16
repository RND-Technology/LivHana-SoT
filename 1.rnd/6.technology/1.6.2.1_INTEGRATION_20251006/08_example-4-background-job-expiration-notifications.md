## Example 4: Background Job - Expiration Notifications

```javascript
// backend/jobs/verification-expiration-notifications.js
const { BigQuery } = require('@google-cloud/bigquery');
const { sendEmail } = require('../email-service');

const bigquery = new BigQuery();

async function checkExpiringVerifications() {
  // Find verifications expiring in 30 days
  const query = `
    SELECT
      v.customer_id,
      v.verification_id,
      v.expires_at,
      c.email,
      c.full_name
    FROM \`project.commerce.age_verifications\` v
    JOIN \`project.commerce.customers\` c
      ON v.customer_id = c.customer_id
    WHERE v.verified = true
      AND v.expires_at BETWEEN CURRENT_TIMESTAMP()
        AND TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      AND v.expiration_email_sent = false
  `;

  const [rows] = await bigquery.query({ query });

  for (const customer of rows) {
    try {
      await sendEmail({
        to: customer.email,
        subject: 'Age Verification Expiring Soon',
        template: 'age-verification-expiring',
        data: {
          name: customer.full_name,
          expiresAt: new Date(customer.expires_at).toLocaleDateString(),
          reverifyUrl: `https://yoursite.com/age-verification?customerId=${customer.customer_id}`
        }
      });

      // Mark email as sent
      await bigquery.query({
        query: `
          UPDATE \`project.commerce.age_verifications\`
          SET expiration_email_sent = true
          WHERE verification_id = @verificationId
        `,
        params: { verificationId: customer.verification_id }
      });

      console.log(`Expiration email sent to ${customer.email}`);
    } catch (error) {
      console.error(`Failed to send expiration email to ${customer.email}:`, error);
    }
  }
}

// Run daily
setInterval(checkExpiringVerifications, 24 * 60 * 60 * 1000);
```

---
