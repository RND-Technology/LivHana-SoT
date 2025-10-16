### 3. Local Development (1Password)

```bash
# Install 1Password CLI
brew install 1password-cli

# Sign in
eval $(op signin)

# Verify access
op read "op://LivHana-Ops-Keys/JWT_SECRET/password"
```

---
