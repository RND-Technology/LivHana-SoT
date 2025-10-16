### **P1: Verify API Access (LightSpeed, Square, SendGrid)**

1. LightSpeed:

   ```bash
   op item get lightspeed --fields label=api_key
   # If empty → Use manual theme editor workflow
   ```

2. Square:

   ```bash
   curl https://connect.squareup.com/v2/customers \
     -H "Authorization: Bearer $(op item get square-reggieanddro --fields label=access_token)"
   # Check scopes in response
   ```

3. SendGrid:

   ```bash
   op item get sendgrid --fields label=api_key
   # If empty → Create new account at sendgrid.com
   ```

**Evidence:** API test outputs in `.evidence/2025-10-03/api-validation/`

---
