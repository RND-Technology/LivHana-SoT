### 🔴 **BLOCKER #2: LightSpeed API Access Undefined**

**Claim:** "LightSpeed FTP credentials: [provide]" + "LightSpeed webstore API"
[REDACTED - SECURITY BREACH]
**Evidence:** `.env.master` file read earlier showed only GCP, Square, Veriff keys

**Resolution Required:**

1. Check 1Password for LightSpeed credentials: `op item get lightspeed` OR `op item get reggieanddro`
2. If LightSpeed API doesn't exist → Use manual theme editor (reggieanddro.company.site/admin)
3. Fallback: All "LightSpeed customization" tasks become manual HTML/CSS/JS injection via admin panel

**Validation Check:**

```bash
curl -X GET "https://api.lightspeedapp.com/API/Account/XXXXX/Category.json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

If 401/403 → No API access → Manual workflow required

---
