<!--
Optimized: 2025-10-03
RPM: 3.6.0.6.ops-technology-ship-status-documentation
Session: Dual-AI Collaboration - Sonnet Docs Sweep
-->

# Identity Platform — 21+ Addendum (UNF-3)

**Purpose:** Enforce 21+ gating across cockpit and store using Google Identity Platform (Firebase Auth-compatible), with verifiable claims and OIDC propagation to APIs.

## 0) Outcomes

- Only users **age ≥ 21** can access cockpit/store actions.
- Tokens carry `age_verified: true` (custom claim) and optional `dob`.
- Cockpit (Next.js) performs edge-gate; API (Cloud Run) verifies OIDC token for each request.

## 1) Enable & Configure Identity Platform

1. Enable APIs (idempotent):

   ```bash
   gcloud services enable identitytoolkit.googleapis.com iam.googleapis.com
   ```

2. In Console → **Identity Platform**:
   - Add **Email/Password** provider (baseline).
   - (Optional) Add Google/Apple OIDC providers if desired.
3. Create a **service account** for admin operations (setting custom claims):
   - `idp-admin@<PROJECT_ID>.iam.gserviceaccount.com`
   - Grant `roles/iam.serviceAccountTokenCreator` and `roles/identitytoolkit.admin`

## 2) Age Verification Flow

- **Sign-up form** collects DoB (YYYY-MM-DD) and explicit 21+ attestation.
- Backend verifies age (>= 21). If valid, it sets custom claims:

  ```js
  // functions/claims.ts (Cloud Run or Cloud Functions)
  import { initializeApp, applicationDefault } from 'firebase-admin/app';
  import { getAuth } from 'firebase-admin/auth';
  initializeApp({ credential: applicationDefault() });

  export async function setAgeVerified(uid, dobISO) {
    const dob = new Date(dobISO);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25*24*60*60*1000));
    if (age < 21) throw new Error('UNDER_21');
    await getAuth().setCustomUserClaims(uid, { age_verified: true, dob: dobISO });
    return { ok: true };
  }
  ```

- If you integrate 3rd-party KYC later (e.g., ID check), use its success callback to call `setAgeVerified`.

## 3) Cockpit (Next.js) Edge Gate (middleware.ts)

```ts
// apps/cockpit/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const PUBLIC_PATHS = ['/', '/healthz', '/public', '/privacy', '/terms'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const idToken = req.cookies.get('id_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!idToken) return NextResponse.redirect(new URL('/public/age-gate', req.url));

  try {
    // Verify JWT (Identity Platform uses Google certs)
    const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'));
    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${process.env.NEXT_PUBLIC_GCP_PROJECT}`,
      audience: process.env.NEXT_PUBLIC_GCP_PROJECT
    });

    if (!payload.age_verified) {
      return NextResponse.redirect(new URL('/public/age-gate', req.url));
    }

    // Forward token to backend
    const res = NextResponse.next();
    res.headers.set('x-id-token', idToken);
    return res;
  } catch {
    return NextResponse.redirect(new URL('/public/age-gate', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
```

## 4) API Verification (Cloud Run, Node)

```ts
// apps/api/src/auth.ts
import * as jose from 'jose';

export async function verifyIdToken(idToken: string, projectId: string) {
  const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'));
  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId
  });
  if (!payload.age_verified) throw new Error('UNDER_21');
  return payload;
}
```

Usage in handlers:

```ts
const idToken = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-id-token'];
const user = await verifyIdToken(idToken!, process.env.GCP_PROJECT!);
```

## 5) Age-Gate Page (cockpit)

- `/public/age-gate` form: DoB (YYYY-MM-DD) + consent checkbox.
- On submit: call `/api/auth/verify-age`:

```ts
// apps/cockpit/app/api/auth/verify-age/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { dobISO, idToken } = await req.json();
  // Call admin API to set claim
  const r = await fetch(process.env.ADMIN_API_URL + '/claims/age-verify', {
    method: 'POST',
    headers: { 'authorization': `Bearer ${idToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ dobISO })
  });
  if (!r.ok) return NextResponse.json({ ok: false }, { status: 400 });
  return NextResponse.json({ ok: true });
}
```

## 6) Secrets & Env

- Cockpit: `NEXT_PUBLIC_GCP_PROJECT`, `ADMIN_API_URL`
- API: `GCP_PROJECT`
- Both: served behind HTTPS; no PII in logs.

## 7) Acceptance

- Under-21 cannot pass middleware.
- Valid 21+ user receives `age_verified: true` and can hit API with OIDC token.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->
