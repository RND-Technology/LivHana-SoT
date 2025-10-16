## API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/memberships/subscribe` | POST | Create subscription | JWT |
| `/api/memberships/:customerId` | GET | Get membership | JWT |
| `/api/memberships/:customerId/upgrade` | PUT | Upgrade tier | JWT |
| `/api/memberships/:customerId/cancel` | PUT | Cancel subscription | JWT |
| `/api/memberships/stats` | GET | Admin stats | JWT + Admin |
| `/api/memberships/discount/:customerId` | GET | Calculate discount | JWT |
