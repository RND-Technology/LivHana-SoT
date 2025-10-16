#### Token Management

```javascript
const { createTokenManager } = require('../../common/auth/token-manager');

// Initialize token manager
const tokenManager = await createTokenManager({
  jwtSecret: process.env.JWT_SECRET,
  logger
});

// Generate token pair
const tokens = await tokenManager.generateTokenPair({
  userId: user.id,
  email: user.email,
  role: user.role,
  permissions: user.permissions
});

// Refresh access token
const newAccessToken = await tokenManager.refreshAccessToken(refreshToken);

// Revoke token (logout)
await tokenManager.revokeAccessToken(accessToken);

// Logout from all devices
await tokenManager.revokeAllUserTokens(userId);
```
