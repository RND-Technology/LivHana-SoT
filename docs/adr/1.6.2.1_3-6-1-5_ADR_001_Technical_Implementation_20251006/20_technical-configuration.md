### TECHNICAL CONFIGURATION

**Environment Variables (All Projects):**

```env
# Square Integration
SQUARE_ACCESS_TOKEN=your_square_production_token
SQUARE_LOCATION_ID=your_location_id

# Email Configuration
EMAIL_USER=your_smtp_user
EMAIL_PASSWORD=your_smtp_password

# Database Configuration (if using external DB)
DATABASE_URL=your_database_connection_string

# Analytics
GOOGLE_ANALYTICS_ID=your_ga_tracking_id

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key

# Compliance
TEXAS_DSHS_LICENSE=690
BUSINESS_ENTITY_ID=your_business_id
```

**Domain Configuration:**

```yaml
DNS_SETUP:
  reggieanddro.com:
    CNAME: reggie-dro-verification.replit.app
    SSL: Auto-enabled
    
  highnooncartoon.com:
    CNAME: high-noon-cartoon.replit.app
    SSL: Auto-enabled
    
  oneplant solution.com:
    CNAME: one-plant-solution.replit.app
    SSL: Auto-enabled
```
