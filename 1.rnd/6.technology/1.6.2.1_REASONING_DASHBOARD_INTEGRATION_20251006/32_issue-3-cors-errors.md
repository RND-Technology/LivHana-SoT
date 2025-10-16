### Issue 3: CORS Errors

**Symptom**: Browser blocks cross-origin requests

**Solution**:

- Reasoning-gateway has CORS enabled with `ALLOWED_ORIGINS` env var
- Current: `http://localhost:5173,http://localhost:3000`
- Add dashboard URL if different

---
