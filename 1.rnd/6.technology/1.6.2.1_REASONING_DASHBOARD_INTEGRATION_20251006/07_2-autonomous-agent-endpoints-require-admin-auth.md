### 2. Autonomous Agent Endpoints (Require Admin Auth)

All autonomous endpoints require:

- JWT token with `role: "admin"` or `roles: ["admin"]`
- Bearer token authentication
- Audience: `livhana-local`
- Issuer: `livhana-local`
