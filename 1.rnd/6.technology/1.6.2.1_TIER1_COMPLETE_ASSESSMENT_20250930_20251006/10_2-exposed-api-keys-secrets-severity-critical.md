### 2. **EXPOSED API KEYS & SECRETS** - SEVERITY: CRITICAL

**Location:**

- `backend/voice-service/.env.runtime`
- `backend/reasoning-gateway/.env.runtime`

**Issue:** Plaintext secrets committed to Git

```bash
# .env.runtime (EXPOSED IN GIT)
ELEVENLABS_API_KEY=a9d8a07c88ac733063857300fec256c85b6d9f98ff7294e2dbc99e5d42c6d499
JWT_SECRET=gdvl2Puzc6JuUijONska2ORN9Sl+hrh+n1lC4f+r3WcGAWU0WvfjkPSl+XjlRGCC
DEEPSEEK_API_KEY=sk-f2667c7b90294919a1798c7e0113e529
```

**Impact:** Compromised credentials if repo is breached
**Cost:** Potential unauthorized API usage ($$$)

**Remediation Required:**

1. Rotate ALL exposed secrets immediately
2. Remove `.env.runtime` from Git history
3. Use 1Password references (like `.env.docker` does)
4. Add `.env.runtime` to `.gitignore`

---
