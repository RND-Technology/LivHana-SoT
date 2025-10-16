## Authentication

All API endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

The token must be signed with the `JWT_SECRET` and include the following claims:

- `aud`: JWT_AUDIENCE
- `iss`: JWT_ISSUER
