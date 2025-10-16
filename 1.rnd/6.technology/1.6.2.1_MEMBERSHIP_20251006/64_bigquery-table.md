### BigQuery Table

The system automatically creates the `commerce.memberships` table on first use.

**Manual creation (optional):**

```sql
CREATE TABLE `your-project.commerce.memberships` (
  id STRING NOT NULL,
  customer_id STRING NOT NULL,
  email STRING NOT NULL,
  tier STRING NOT NULL,
  status STRING NOT NULL,
  price FLOAT64 NOT NULL,
  discount_percent INT64 NOT NULL,
  subscription_id STRING,
  payment_method_id STRING,
  start_date TIMESTAMP NOT NULL,
  next_billing_date TIMESTAMP NOT NULL,
  cancel_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Recommended indexes
CREATE INDEX idx_customer_id ON `your-project.commerce.memberships`(customer_id);
CREATE INDEX idx_status ON `your-project.commerce.memberships`(status);
```
