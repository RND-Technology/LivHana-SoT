#### Local Development (.env.local)

```bash
# Local dev uses 1Password references
NODE_ENV=development
AUTO_ROTATE_SECRETS=false

# All secrets as op:// references
JWT_SECRET=op://LivHana-Ops-Keys/JWT_SECRET/password
JWT_AUDIENCE=op://LivHana-Ops-Keys/JWT_AUDIENCE/password
JWT_ISSUER=op://LivHana-Ops-Keys/JWT_ISSUER/password
SQUARE_ACCESS_TOKEN=op://LivHana-Ops-Keys/SQUARE_ACCESS_TOKEN/credential
KAJA_API_KEY=op://LivHana-Ops-Keys/KAJA_API_KEY/credential
```

---
