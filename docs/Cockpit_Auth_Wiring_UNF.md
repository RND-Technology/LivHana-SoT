
# Cockpit Auth Wiring — Next.js + API OIDC (UNF-5)

## Overview

Edge middleware enforces 21+, forwards OIDC ID token to API. API verifies token and `age_verified` claim.

## Next.js wiring

**`apps/cockpit/middleware.ts`** — (see UNF-3 for full code)

- Checks `id_token` cookie or `Authorization: Bearer`.
- Verifies JWT issuer/audience; requires `age_verified: true`.
- Forwards token via `x-id-token` header.

**`apps/cockpit/app/api/auth/verify-age/route.ts`**

- Exchanges DOB + ID token for claim assignment via admin API.

**API calls**

```ts
// Example fetch with token from client
await fetch('/api/roi', {
  headers: { 'authorization': `Bearer ${idToken}` }
});
```

## API verification

**`apps/api/src/auth.ts`** — (see UNF-3) verifies Google securetoken JWTs.

**Handler example**

```ts
app.get('/api/roi', async (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-id-token'];
  const user = await verifyIdToken(token!, process.env.GCP_PROJECT!);
  // fetch BigQuery metrics...
  res.json({ revenue: 0, cost: 0, roi: 0 });
});
```

## Env & Secrets

- Cockpit: `NEXT_PUBLIC_GCP_PROJECT`, `ADMIN_API_URL`
- API: `GCP_PROJECT`
- Secret Manager holds admin service account JSON for claims setter (if not using default ADC on Cloud Run).

## Acceptance

- Unauthorized or under-21 blocked at middleware.
- Authenticated, age-verified requests succeed (`/api/roi`, `/v1/video/kickoff`).
