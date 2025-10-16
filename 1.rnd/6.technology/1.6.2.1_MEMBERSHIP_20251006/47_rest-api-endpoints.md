## REST API Endpoints

All endpoints require JWT authentication:

1. **POST /api/memberships/subscribe** - Create new subscription
2. **GET /api/memberships/:customerId** - Get current membership
3. **PUT /api/memberships/:customerId/upgrade** - Upgrade tier
4. **PUT /api/memberships/:customerId/cancel** - Cancel subscription
5. **GET /api/memberships/stats** - Admin dashboard (admin role required)
6. **GET /api/memberships/discount/:customerId** - Calculate checkout discount
