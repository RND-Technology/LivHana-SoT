#### Task 1.3: Standardize JWT Configuration

```bash
# Create shared JWT config in backend/common/auth/config.js
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER,
  algorithms: ['HS256']
};
```

---
