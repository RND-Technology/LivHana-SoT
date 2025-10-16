### ALLOWED_ORIGINS Explained

**What it is:** A security whitelist of domains that can make API requests to your backend

**Why it matters:**

- Prevents unauthorized domains from calling your APIs
- Protects against CSRF (Cross-Site Request Forgery) attacks
- Required for CORS (Cross-Origin Resource Sharing)

**Current Config:**

```javascript
// backend/integration-service/src/index.js
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') ||
  ['http://localhost:5173', 'http://localhost:3000'];
```

**What you need:**

```javascript
const allowedOrigins = [
  'https://herbitrage.com',
  'https://reggieanddro.com',
  'https://highnooncartoon.com',
  'https://oneplantsolution.com',
  'https://livhana.ai',
  'http://localhost:5173',  // dev frontend
  'http://localhost:3000',  // dev alternate
  // ADD ALL 69 DOMAINS HERE FOR EMPIRE-EMPIRE
];
```

**How to generate the full list:**

```bash
# Create CORS whitelist from all 69 domains
cat > /tmp/domains.txt <<EOF
herbitrage.com
reggieanddro.com
highnooncartoon.com
oneplantsolution.com
livhana.ai
cannabisretailai.com
freeweedtexas.com
# ... all 69 domains
EOF

# Generate ALLOWED_ORIGINS string
awk '{print "  \"https://" $0 "\","}' /tmp/domains.txt
```
