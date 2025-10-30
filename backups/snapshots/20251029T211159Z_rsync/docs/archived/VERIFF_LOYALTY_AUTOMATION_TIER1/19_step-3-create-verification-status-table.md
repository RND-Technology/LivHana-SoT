### Step 3: Create Verification Status Table

```sql
-- Run in BigQuery console
CREATE TABLE `livhana-422923.commerce.verification_status` (
  customer_id STRING NOT NULL,
  session_id STRING NOT NULL,
  status STRING NOT NULL,
  verified_at TIMESTAMP,
  person_first_name STRING,
  person_last_name STRING,
  person_date_of_birth DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()
);

CREATE INDEX idx_customer_id ON `livhana-422923.commerce.verification_status`(customer_id);
CREATE INDEX idx_status ON `livhana-422923.commerce.verification_status`(status);
```
