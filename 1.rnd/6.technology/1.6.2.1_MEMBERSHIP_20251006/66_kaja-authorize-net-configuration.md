### KAJA/Authorize.Net Configuration

1. **Get API credentials:**
   - Log in to Authorize.Net merchant account
   - Navigate to Account → Settings → API Credentials & Keys
   - Generate new Transaction Key
   - Note your API Login ID

2. **Configure sandbox mode:**
   - Set `AUTHORIZE_NET_SANDBOX=true` for testing
   - Set `AUTHORIZE_NET_SANDBOX=false` for production

3. **Test connectivity:**

   ```javascript
   // The KAJA gateway will log connection attempts
   // Check logs for: "Creating KAJA subscription"
   ```
