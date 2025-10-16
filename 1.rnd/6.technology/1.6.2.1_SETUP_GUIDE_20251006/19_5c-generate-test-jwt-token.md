### **5C. Generate Test JWT Token**

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/reasoning-gateway

TOKEN=$(node -e "
const jwt = require('jsonwebtoken');
console.log(jwt.sign(
  { userId: 'jesse-admin', role: 'admin' },
  'local-dev-secret-change-in-production',
  { expiresIn: '24h', audience: 'livhana-local', issuer: 'livhana-local' }
));
")

echo "Token: $TOKEN"
```
