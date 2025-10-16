### 2. Configure Environment

Copy and configure environment variables:

```bash
cd backend/integration-service
cp .env.membership.example .env
# Edit .env with your actual values
```

Required variables:

- `GCP_PROJECT_ID` - Google Cloud project ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account key
- `AUTHORIZE_NET_API_LOGIN_ID` - KAJA gateway login
- `AUTHORIZE_NET_TRANSACTION_KEY` - KAJA gateway key
- `JWT_SECRET` - JWT signing secret
