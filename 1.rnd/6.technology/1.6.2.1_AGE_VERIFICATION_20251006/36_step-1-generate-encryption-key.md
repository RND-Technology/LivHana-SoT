## Step 1: Generate Encryption Key

Generate a secure 32-byte encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').substring(0, 32))"
```

Example output: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Store in 1Password:**

- Item name: `AGE_VERIFICATION_ENCRYPTION_KEY`
- Field: `password`
- Category: `LivHana-Ops-Keys`

---
