### JWT_SECRET Generation Command

**You asked for this - here it is:**

```bash
# Generate a cryptographically secure 64-byte JWT secret
openssl rand -base64 64 | tr -d '\n'
```

**Output from earlier:**

```
2MAb9PH5+yOuZV2Cj+zXqRuQ9KA98C6P24csGc2SNbYaeHYbJdiSm5YaBDavWjbIwhJhX0iccZgrmK4h3tnIEg==
```

**Use this for:**

- `JWT_SECRET` in all backend services (MUST be same across all)
- Store in 1Password: `op item edit JWT_SECRET password="<value>"`
- Update `.env.runtime` files

---
