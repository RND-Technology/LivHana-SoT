### Automated (Run Tonight)

```bash
# 1. Install dependencies
cd backend/common && npm install
cd backend/payment-service && npm install  # Stripe removed

# 2. Run fallacy scan
node automation/validators/fallacy_scanner.js --fix

# 3. Run data validator
node automation/validators/data_validator.js --update-docs

# 4. Run dependency scanner
node automation/validators/dependency_scanner.js

# 5. Set up pre-commit hook
npx husky install
chmod +x .husky/pre-commit

# 6. Update CURRENT_STATUS.md (already done)

# 7. Generate JWT_SECRET
openssl rand -base64 64

# 8. Store secrets in 1Password
op item create --category=password --title="JWT_SECRET" ...
```

---
