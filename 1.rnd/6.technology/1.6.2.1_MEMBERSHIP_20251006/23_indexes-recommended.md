### Indexes (Recommended)

```sql
-- Query by customer_id (most common operation)
CREATE INDEX idx_customer_id ON `commerce.memberships`(customer_id);

-- Query active memberships
CREATE INDEX idx_status ON `commerce.memberships`(status);

-- Analytics queries by tier
CREATE INDEX idx_tier ON `commerce.memberships`(tier);
```
