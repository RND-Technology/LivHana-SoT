### JWT Token Generation

A valid development token has been generated and embedded in the frontend:

**Location**: `frontend/vibe-cockpit/src/utils/auth.js`

**Token Details**:

- **Payload**:

  ```json
  {
    "sub": "dev-user-local",
    "id": "dev-user-id",
    "role": "admin",
    "roles": ["admin", "user"],
    "name": "Local Dev User",
    "email": "dev@livhana.local",
    "aud": "livhana-local",
    "iss": "livhana-local",
    "exp": 1759961602  // 7 days from generation
  }
  ```

**Regenerate Token**:

```bash
cd backend/reasoning-gateway
node scripts/generate-dev-token.js
```
