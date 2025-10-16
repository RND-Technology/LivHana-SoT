### 3. **MISMATCHED JWT SECRETS** - SEVERITY: HIGH

**Issue:** Different JWT_SECRET values across services

| Service | JWT_SECRET (first 20 chars) |
|---------|----------------------------|
| voice-service | `gdvl2Puzc6JuUijONska...` |
| reasoning-gateway | `tS1Z++Tz/+BOksxftGEQ...` |

**Impact:** Tokens issued by one service cannot be validated by another
**Effect:** Cross-service authentication will fail

**Remediation:** Standardize to single shared secret via 1Password

---
