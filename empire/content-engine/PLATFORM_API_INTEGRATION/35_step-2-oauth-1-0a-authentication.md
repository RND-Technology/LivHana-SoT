#### Step 2: OAuth 1.0a Authentication

```javascript
// twitter-auth.mjs
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

/**
 * Create OAuth 1.0a instance for X API
 */
export function createTwitterOAuth(apiKey, apiSecret) {
  return new OAuth({
    consumer: {
      key: apiKey,
      secret: apiSecret
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => {
      return crypto
        .createHmac('sha1', key)
        .update(baseString)
        .digest('base64');
    }
  });
}

/**
 * Get OAuth authorization header
 */
export function getTwitterAuthHeader(oauth, url, method, token) {
  const authHeader = oauth.toHeader(
    oauth.authorize(
      { url, method },
      token
    )
  );
  return authHeader.Authorization;
}
```
