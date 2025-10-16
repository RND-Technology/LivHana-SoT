### 3. Authentication

Authenticate each Gmail account:

```bash
# Authenticate Jessen's account
node gmail_auth.js --account=jesseniesen

# Authenticate R&D account
node gmail_auth.js --account=high
```

This will:

1. Open your browser for Google OAuth consent
2. Save the access token locally
3. Store refresh token for automatic renewal

**Security Note:** Token files contain sensitive credentials. Keep them secure and add to `.gitignore`.
