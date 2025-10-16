### 8. **CORS WILDCARD IN PRODUCTION** - SEVERITY: LOW

**Location:** Multiple services use `origin: '*'`
**Issue:**

```javascript
app.use(cors({ origin: allowedOrigins ?? '*', credentials: true }));
```

**Remediation:** Enforce strict ALLOWED_ORIGINS whitelist

---
