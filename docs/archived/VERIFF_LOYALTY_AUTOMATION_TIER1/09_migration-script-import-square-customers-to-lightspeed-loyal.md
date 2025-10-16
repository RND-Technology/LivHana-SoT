### Migration Script: Import Square Customers to Lightspeed Loyalty

**File: `/automation/scripts/migrate_square_to_lightspeed_loyalty.ts`**

```typescript
import 'dotenv/config';
import axios from 'axios';
import { BigQuery } from '@google-cloud/bigquery';

[REDACTED - SECURITY BREACH]
const LIGHTSPEED_ACCOUNT_ID = process.env.LIGHTSPEED_ACCOUNT_ID;
const LIGHTSPEED_BASE_URL = `https://api.lightspeedapp.com/API/Account/${LIGHTSPEED_ACCOUNT_ID}`;

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = 'commerce';

const bigquery = new BigQuery({ projectId: PROJECT_ID });

// Execute LTV report query
async function fetchSquareLTVReport() {
  const query = `
    -- (Same query as above - square_customer_ltv_report.sql)
    WITH customer_spending AS (
      SELECT
        customer_id,
        customer_email,
        customer_first_name,
        customer_last_name,
        COUNT(DISTINCT payment_id) AS total_orders,
        SUM(amount_cents) / 100.0 AS total_spent_usd,
        MIN(created_at) AS first_order_date,
        MAX(created_at) AS last_order_date
      FROM \`${PROJECT_ID}.${DATASET}.square_payments\`
      WHERE status = 'COMPLETED'
        AND created_at >= '2023-07-01 00:00:00'
      GROUP BY customer_id, customer_email, customer_first_name, customer_last_name
    ),
    customer_tiers AS (
      SELECT
        *,
        CASE
          WHEN total_spent_usd >= 5000 THEN 'PLATINUM'
          WHEN total_spent_usd >= 2500 THEN 'GOLD'
          WHEN total_spent_usd >= 1000 THEN 'SILVER'
          WHEN total_spent_usd >= 500 THEN 'BRONZE'
          ELSE 'MEMBER'
        END AS loyalty_tier,
        CASE
          WHEN total_spent_usd >= 5000 THEN 5000
          WHEN total_spent_usd >= 2500 THEN 2500
          WHEN total_spent_usd >= 1000 THEN 1000
          WHEN total_spent_usd >= 500 THEN 500
          ELSE 100
        END AS grand_fathered_points
      FROM customer_spending
    )
    SELECT * FROM customer_tiers
    ORDER BY total_spent_usd DESC
  `;

  const [rows] = await bigquery.query({ query, location: 'US' });
  return rows;
}

// Find or create Lightspeed customer by email
async function findOrCreateLightspeedCustomer(squareCustomer: any) {
  try {
    // Search for existing customer by email
    const searchResponse = await axios.get(
      `${LIGHTSPEED_BASE_URL}/Customer.json`,
      {
        headers: {
[REDACTED - SECURITY BREACH]
          Accept: 'application/json'
        },
        params: {
          email: squareCustomer.customer_email,
          load_relations: 'CustomerLoyalty'
        }
      }
    );

    const customers = searchResponse.data.Customer;

    if (customers && customers.length > 0) {
      // Customer exists
      return { customerId: customers[0].customerID, existed: true };
    }

    // Create new customer
    const createResponse = await axios.post(
      `${LIGHTSPEED_BASE_URL}/Customer.json`,
      {
        Customer: {
          firstName: squareCustomer.customer_first_name,
          lastName: squareCustomer.customer_last_name,
          email: squareCustomer.customer_email,
          createTime: new Date().toISOString()
        }
      },
      {
        headers: {
[REDACTED - SECURITY BREACH]
          'Content-Type': 'application/json'
        }
      }
    );

    const newCustomer = createResponse.data.Customer;
    return { customerId: newCustomer.customerID, existed: false };
  } catch (error) {
    console.error('Failed to find/create customer', error);
    throw error;
  }
}

// Create or update Lightspeed Loyalty account
async function migrateCustomerLoyalty(customer: any, lightspeedCustomerId: string) {
  try {
    // Check if loyalty account exists
    const checkResponse = await axios.get(
      `${LIGHTSPEED_BASE_URL}/Customer/${lightspeedCustomerId}.json`,
      {
        headers: {
[REDACTED - SECURITY BREACH]
          Accept: 'application/json'
        },
        params: {
          load_relations: 'CustomerLoyalty'
        }
      }
    );

    const existingLoyalty = checkResponse.data.Customer.CustomerLoyalty;

    if (existingLoyalty) {
      // Update existing loyalty account with grand fathered points
      await axios.put(
        `${LIGHTSPEED_BASE_URL}/CustomerLoyalty/${existingLoyalty.loyaltyID}.json`,
        {
          CustomerLoyalty: {
            balance: Number(existingLoyalty.balance || 0) + customer.grand_fathered_points,
            tier: customer.loyalty_tier,
            notes: `Grand Fathered from Square (LTV: $${customer.lifetime_value_usd})`
          }
        },
        {
          headers: {
[REDACTED - SECURITY BREACH]
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Updated loyalty: ${customer.customer_email} (+${customer.grand_fathered_points} pts)`);
    } else {
      // Create new loyalty account
      await axios.post(
        `${LIGHTSPEED_BASE_URL}/CustomerLoyalty.json`,
        {
          CustomerLoyalty: {
            customerID: lightspeedCustomerId,
            balance: customer.grand_fathered_points,
            tier: customer.loyalty_tier,
            status: 'active',
            enrollmentDate: new Date().toISOString(),
            notes: `Grand Fathered from Square (LTV: $${customer.lifetime_value_usd})`
          }
        },
        {
          headers: {
[REDACTED - SECURITY BREACH]
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Created loyalty: ${customer.customer_email} (${customer.grand_fathered_points} pts, ${customer.loyalty_tier})`);
    }
  } catch (error) {
    console.error(`Failed to migrate loyalty for ${customer.customer_email}`, error);
  }
}

// Main migration
async function main() {
  console.log('🚀 Starting Grand Fathered Loyalty Migration...');

  // Fetch Square customer LTV report
  const customers = await fetchSquareLTVReport();
  console.log(`📊 Found ${customers.length} Square customers`);

  let migratedCount = 0;
  let errorCount = 0;

  for (const customer of customers) {
    try {
      // Find or create Lightspeed customer
      const { customerId, existed } = await findOrCreateLightspeedCustomer(customer);

      if (!existed) {
        console.log(`👤 Created new customer: ${customer.customer_email}`);
      }

      // Migrate loyalty points
      await migrateCustomerLoyalty(customer, customerId);

      migratedCount++;

      // Rate limiting (100ms between API calls)
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Failed to migrate ${customer.customer_email}`, error);
      errorCount++;
    }
  }

  console.log('\n📈 Migration Complete');
  console.log(`✅ Migrated: ${migratedCount} customers`);
  console.log(`❌ Errors: ${errorCount} customers`);
}

main().catch(console.error);
```

---
