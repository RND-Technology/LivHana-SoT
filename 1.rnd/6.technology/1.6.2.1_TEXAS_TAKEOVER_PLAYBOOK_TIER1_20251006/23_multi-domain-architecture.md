### Multi-Domain Architecture

**Database Schema:**

```sql
CREATE TABLE domain_configs (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) UNIQUE NOT NULL,
  tenant_id UUID NOT NULL,
  theme_config JSONB,
  product_catalog_id INT,
  membership_tiers JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Middleware (Express):**

```javascript
app.use((req, res, next) => {
  const domain = req.hostname;
  req.domainConfig = await getDomainConfig(domain);
  req.tenantId = req.domainConfig.tenant_id;
  next();
});
```

**CORS Configuration:**

```javascript
const allowedOrigins = [
  'https://herbitrage.com',
  'https://reggieanddro.com',
  // ... all 69 domains
];
```
