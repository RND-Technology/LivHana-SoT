#### Token Structure

**Access Token:**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "user|admin",
  "permissions": ["read:products", "write:cart"],
  "type": "access",
  "iat": 1633024800,
  "exp": 1633025700,
  "iss": "livhana-sot",
  "aud": "livhana-api"
}
```

**Refresh Token:**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "tokenId": "refresh-token-id",
  "sessionId": "session-id",
  "type": "refresh",
  "iat": 1633024800,
  "exp": 1633629600,
  "iss": "livhana-sot",
  "aud": "livhana-api"
}
```
