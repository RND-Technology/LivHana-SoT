# LivHana Raffle System - Quick Reference

Fast reference guide for common raffle operations and API calls.

---

## Quick Start

### Start the Service

```bash
cd backend/integration-service
npm install
npm run dev
```

Service runs on: `http://localhost:3005`

---

## Common API Calls

### Public Endpoints (No Auth Required)

#### List All Active Raffles

```bash
curl http://localhost:3005/api/raffles
```

#### Get Raffle Details

```bash
curl http://localhost:3005/api/raffles/RAFFLE_123
```

#### Get Raffle Progress

```bash
curl http://localhost:3005/api/raffles/RAFFLE_123/progress
```

---

### Customer Endpoints (Auth Required)

#### Purchase Tickets

```bash
curl -X POST http://localhost:3005/api/raffles/RAFFLE_123/purchase \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST_123",
    "customerEmail": "customer@example.com",
    "customerName": "John Doe",
    "numTickets": 10,
    "paymentMethod": {
      "type": "credit_card",
      "token": "tok_visa_1234"
    }
  }'
```

#### Get My Tickets

```bash
curl http://localhost:3005/api/raffles/RAFFLE_123/tickets/CUST_123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Admin Endpoints (Admin Auth Required)

#### Create New Raffle

```bash
curl -X POST http://localhost:3005/api/raffles \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Blue Dream $250K Q1 2026",
    "description": "Win $250,000 cash!",
    "prize": "$250,000 Cash Prize",
    "ticketPrice": 50,
    "maxTickets": 5000,
    "drawDate": "2026-03-31T23:59:59Z"
  }'
```

#### Update Raffle

```bash
curl -X PUT http://localhost:3005/api/raffles/RAFFLE_123 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

#### Conduct Drawing

```bash
curl -X POST http://localhost:3005/api/raffles/RAFFLE_123/draw \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Get Statistics

```bash
curl http://localhost:3005/api/raffles/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Cancel Raffle (with Refunds)

```bash
curl -X DELETE http://localhost:3005/api/raffles/RAFFLE_123/cancel \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Technical issues"
  }'
```

---

## JavaScript/Node.js Examples

### Purchase Tickets

```javascript
const axios = require('axios');

async function purchaseTickets(raffleId, numTickets, authToken) {
  const response = await axios.post(
    `http://localhost:3005/api/raffles/${raffleId}/purchase`,
    {
      customerId: 'CUST_123',
      customerEmail: 'customer@example.com',
      customerName: 'John Doe',
      numTickets,
      paymentMethod: {
        type: 'credit_card',
        token: 'tok_visa_1234'
      }
    },
    {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  );

  console.log('Purchase successful!');
  console.log('Transaction ID:', response.data.transaction.id);
  console.log('Ticket Numbers:', response.data.tickets.map(t => t.ticketNumber));
}

purchaseTickets('RAFFLE_123', 10, 'your_jwt_token');
```

### Conduct Drawing

```javascript
async function conductDrawing(raffleId, adminToken) {
  const response = await axios.post(
    `http://localhost:3005/api/raffles/${raffleId}/draw`,
    {},
    {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    }
  );

  const { drawing } = response.data;

  console.log('Winner:', drawing.winner.customerName);
  console.log('Winning Ticket:', drawing.winner.ticketNumber);
  console.log('Runner-Ups:', drawing.runnerUps.length);
  console.log('Audit Hash:', drawing.auditTrail.auditHash);
}

conductDrawing('RAFFLE_123', 'admin_jwt_token');
```

---

## Python Examples

### Fetch Raffle Stats

```python
import requests

def get_raffle_stats(admin_token):
    headers = {'Authorization': f'Bearer {admin_token}'}
    response = requests.get(
        'http://localhost:3005/api/raffles/stats',
        headers=headers
    )

    stats = response.json()['stats']
    print(f"Total Raffles: {stats['totalRaffles']}")
    print(f"Total Revenue: ${stats['totalRevenue']}")
    print(f"Tickets Sold: {stats['totalTicketsSold']}")

get_raffle_stats('admin_jwt_token')
```

### Monitor Raffle Progress

```python
import requests
import time

def monitor_raffle(raffle_id):
    while True:
        response = requests.get(
            f'http://localhost:3005/api/raffles/{raffle_id}/progress'
        )

        progress = response.json()['progress']
        print(f"Tickets Sold: {progress['ticketsSold']}/{progress['maxTickets']}")
        print(f"Revenue: ${progress['totalRevenue']}")
        print(f"Status: {progress['status']}")
        print('---')

        time.sleep(30)  # Check every 30 seconds

monitor_raffle('RAFFLE_123')
```

---

## React Hooks

### useRaffle Hook

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useRaffle(raffleId) {
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRaffle();
  }, [raffleId]);

  const fetchRaffle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/raffles/${raffleId}`
      );
      setRaffle(response.data.raffle);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => fetchRaffle();

  return { raffle, loading, error, refresh };
}

// Usage
function RaffleComponent({ raffleId }) {
  const { raffle, loading, error, refresh } = useRaffle(raffleId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{raffle.name}</h1>
      <p>{raffle.prize}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### useTicketPurchase Hook

```javascript
import { useState } from 'react';
import axios from 'axios';

export function useTicketPurchase(raffleId, authToken) {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);

  const purchaseTickets = async (numTickets, customer, paymentMethod) => {
    setPurchasing(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/raffles/${raffleId}/purchase`,
        {
          customerId: customer.id,
          customerEmail: customer.email,
          customerName: customer.name,
          numTickets,
          paymentMethod
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setPurchasing(false);
    }
  };

  return { purchaseTickets, purchasing, error };
}

// Usage
function PurchaseButton({ raffleId, authToken, customer }) {
  const { purchaseTickets, purchasing, error } = useTicketPurchase(
    raffleId,
    authToken
  );

  const handlePurchase = async () => {
    try {
      const result = await purchaseTickets(10, customer, {
        type: 'credit_card',
        token: 'tok_visa_1234'
      });
      alert(`Success! Purchased ${result.transaction.numTickets} tickets`);
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  return (
    <>
      <button onClick={handlePurchase} disabled={purchasing}>
        {purchasing ? 'Processing...' : 'Buy 10 Tickets'}
      </button>
      {error && <div className="error">{error}</div>}
    </>
  );
}
```

---

## Testing Commands

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test src/raffle.test.js
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

---

## Database Queries

### BigQuery - Get Raffle Revenue

```sql
SELECT
  id,
  name,
  total_revenue,
  tickets_sold,
  status
FROM `livhana-production.commerce.raffles`
ORDER BY total_revenue DESC
LIMIT 10;
```

### BigQuery - Get Customer Ticket Count

```sql
SELECT
  customer_id,
  customer_email,
  COUNT(*) as total_tickets,
  SUM(CASE WHEN is_bonus_entry THEN 1 ELSE 0 END) as bonus_tickets,
  COUNT(DISTINCT raffle_id) as raffles_entered
FROM `livhana-production.commerce.raffle_tickets`
GROUP BY customer_id, customer_email
ORDER BY total_tickets DESC
LIMIT 100;
```

### BigQuery - Get Transaction History

```sql
SELECT
  t.id,
  t.customer_email,
  t.num_tickets,
  t.amount,
  t.payment_status,
  t.created_at,
  r.name as raffle_name
FROM `livhana-production.commerce.raffle_transactions` t
JOIN `livhana-production.commerce.raffles` r ON t.raffle_id = r.id
WHERE t.customer_id = 'CUST_123'
ORDER BY t.created_at DESC;
```

---

## Environment Variables Quick Reference

```bash
# Essential
PORT=3005
JWT_SECRET=your_secret
GCP_PROJECT_ID=livhana-production
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json

# Payment
AUTHORIZE_NET_API_LOGIN_ID=your_api_login
AUTHORIZE_NET_TRANSACTION_KEY=your_transaction_key
AUTHORIZE_NET_SANDBOX=false

# Services
EMAIL_SERVICE_URL=http://localhost:3007/api/email/send
AGE_VERIFICATION_SERVICE_URL=http://localhost:3005/api/age-verification/status
```

---

## Raffle Status Flow

```
draft → active → sold_out → drawn → completed
   ↓      ↓         ↓
cancelled ← cancelled ← cancelled
```

---

## Error Codes Quick Reference

| Code | Error | Fix |
|------|-------|-----|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Provide valid JWT token |
| 403 | Forbidden | Verify age or admin access |
| 404 | Not Found | Check raffle ID exists |
| 500 | Server Error | Check server logs |

---

## Gold Member Benefits

- **5 bonus entries** per raffle
- Automatic with GOLD membership tier
- No additional charge for bonus entries
- Appears as separate tickets in system

---

## Compliance Requirements

- **Age**: 21+ (TX law)
- **Verification**: Required before purchase
- **Ticket Limits**: 1-100 per purchase
- **Record Retention**: 7 years minimum
- **Audit Trail**: Every drawing

---

## Key Files

```
backend/integration-service/
├── src/
│   ├── raffle.js                      # Main raffle system
│   ├── raffle.test.js                 # Comprehensive tests
│   └── index.js                        # Service entry point
├── RAFFLE_API_DOCUMENTATION.md         # Complete API docs
├── RAFFLE_FRONTEND_EXAMPLES.md         # React components
├── RAFFLE_DEPLOYMENT_GUIDE.md          # Deployment guide
└── RAFFLE_QUICK_REFERENCE.md           # This file
```

---

## Support Contacts

- **API Issues**: dev@livhana.com
- **Payment Issues**: finance@livhana.com
- **Age Verification**: compliance@livhana.com
- **Emergency**: 1-800-LIVHANA

---

## Useful Links

- **API Documentation**: `/backend/integration-service/RAFFLE_API_DOCUMENTATION.md`
- **Frontend Examples**: `/backend/integration-service/RAFFLE_FRONTEND_EXAMPLES.md`
- **Deployment Guide**: `/backend/integration-service/RAFFLE_DEPLOYMENT_GUIDE.md`
- **Test Suite**: `/backend/integration-service/src/raffle.test.js`

---

## Blue Dream $250K Raffle Specs

```
Name:     Blue Dream $250K Quarterly Raffle
Prize:    $250,000 Cash
Ticket:   $50 each
Max:      5,000 tickets
Target:   $250,000 revenue
Timeline: Q4 2025
Drawing:  Cryptographically secure
Bonus:    5 entries for Gold members
```

---

## Quick Troubleshooting

### Service won't start
```bash
# Check port availability
lsof -i :3005

# Check environment variables
node -e "require('dotenv').config(); console.log(process.env)"

# Check logs
tail -f logs/integration-service.log
```

### BigQuery errors
```bash
# Test connection
node -e "const {BigQuery} = require('@google-cloud/bigquery'); const bq = new BigQuery(); bq.getDatasets().then(console.log)"

# Verify credentials
cat $GOOGLE_APPLICATION_CREDENTIALS
```

### Payment failures
```bash
# Check Authorize.Net credentials
curl -X POST https://apitest.authorize.net/xml/v1/request.api \
  -H "Content-Type: application/json" \
  -d '{"getTestCredentials": true}'
```

---

## Performance Tips

1. **Enable caching**: Set `BQ_CACHE_TTL_MS=30000`
2. **Use pagination**: Limit large queries
3. **Add indexes**: On frequently queried fields
4. **Scale horizontally**: Add more instances
5. **Monitor metrics**: Track response times

---

## Security Tips

1. **Rotate JWT secrets** monthly
2. **Use HTTPS** everywhere
3. **Rate limit** endpoints
4. **Validate inputs** strictly
5. **Audit logs** regularly

---

**Version**: 1.0.0
**Last Updated**: 2025-10-01
**Author**: LivHana Dev Team

<!-- Last verified: 2025-10-02 -->
