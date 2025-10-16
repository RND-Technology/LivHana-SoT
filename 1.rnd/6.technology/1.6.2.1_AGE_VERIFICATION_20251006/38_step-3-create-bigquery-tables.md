## Step 3: Create BigQuery Tables

The system will auto-create tables on first run, but you can create them manually:

```sql
-- Table: age_verifications
CREATE TABLE IF NOT EXISTS `your-project.commerce.age_verifications` (
  verification_id STRING NOT NULL,
  customer_id STRING NOT NULL,
  customer_id_hash STRING NOT NULL,
  full_name STRING NOT NULL,
  date_of_birth DATE NOT NULL,
  age INT64 NOT NULL,
  state STRING NOT NULL,
  verified BOOL NOT NULL,
  verification_method STRING NOT NULL,
  verified_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  metadata STRING,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(created_at)
CLUSTER BY customer_id_hash, state;

-- Table: age_verification_attempts (audit log)
CREATE TABLE IF NOT EXISTS `your-project.commerce.age_verification_attempts` (
  attempt_id STRING NOT NULL,
  verification_id STRING,
  customer_id STRING NOT NULL,
  customer_id_hash STRING NOT NULL,
  verified BOOL NOT NULL,
  method STRING NOT NULL,
  reason STRING,
  failed_field STRING,
  ip_address STRING,
  user_agent STRING,
  created_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(created_at)
CLUSTER BY customer_id_hash, created_at;
```

**Retention Policy (TX DSHS CHP #690 compliance):**

```sql
-- Set 7-year retention
ALTER TABLE `your-project.commerce.age_verifications`
SET OPTIONS (
  partition_expiration_days = 2555  -- 7 years
);

ALTER TABLE `your-project.commerce.age_verification_attempts`
SET OPTIONS (
  partition_expiration_days = 2555  -- 7 years
);
```

---
