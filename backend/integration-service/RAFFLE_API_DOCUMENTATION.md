# LivHana Raffle System API Documentation

## Blue Dream $250K Quarterly Raffle

Complete API documentation for the LivHana raffle system, including raffle management, ticket sales, drawings, and compliance features.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Public Endpoints](#public-endpoints)
4. [Customer Endpoints](#customer-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Data Models](#data-models)
7. [Integration Examples](#integration-examples)
8. [Compliance Features](#compliance-features)
9. [Error Handling](#error-handling)

---

## Overview

The LivHana Raffle System provides a complete solution for managing quarterly raffles with:

- **Multiple active raffles** support
- **Cryptographically secure** random drawing
- **KAJA payment gateway** integration
- **Gold member bonus entries** (5 per raffle)
- **Age verification** compliance (21+)
- **TX gambling law** compliance
- **7-year record retention**
- **Email notifications**
- **BigQuery** data storage

### Base URL

```
https://api.livhana.com/api/raffles
```

### Blue Dream Raffle Specs

- **Prize**: $250,000 Cash
- **Ticket Price**: $50 per ticket
- **Max Tickets**: 5,000
- **Target Revenue**: $250,000
- **Timeline**: Q4 2025
- **Drawing**: Cryptographically secure random selection

---

## Authentication

All endpoints (except public listing endpoints) require JWT authentication.

### Headers

```http
Authorization: Bearer <jwt_token>
```

### JWT Claims

```json
{
  "sub": "customer_id",
  "email": "customer@example.com",
  "role": "customer|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Public Endpoints

### GET /api/raffles

List all active raffles.

**Authentication**: Optional (public endpoint)

**Query Parameters**: None

**Response**:

```json
{
  "success": true,
  "raffles": [
    {
      "id": "RAFFLE_123",
      "name": "Blue Dream $250K Q4 2025",
      "description": "Win $250,000 cash in our quarterly raffle!",
      "prize": "$250,000 Cash Prize",
      "ticketPrice": 50,
      "maxTickets": 5000,
      "ticketsSold": 2500,
      "ticketsRemaining": 2500,
      "status": "active",
      "drawDate": "2025-12-31T23:59:59Z",
      "totalRevenue": 125000,
      "createdAt": "2025-10-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

### GET /api/raffles/:raffleId

Get detailed information about a specific raffle.

**Authentication**: Optional (public endpoint)

**Response**:

```json
{
  "success": true,
  "raffle": {
    "id": "RAFFLE_123",
    "name": "Blue Dream $250K Q4 2025",
    "description": "Win $250,000 cash in our quarterly raffle!",
    "prize": "$250,000 Cash Prize",
    "ticketPrice": 50,
    "maxTickets": 5000,
    "ticketsSold": 2500,
    "ticketsRemaining": 2500,
    "status": "active",
    "drawDate": "2025-12-31T23:59:59Z",
    "totalRevenue": 125000,
    "winner": null,
    "runnerUps": [],
    "createdAt": "2025-10-01T00:00:00Z"
  }
}
```

### GET /api/raffles/:raffleId/progress

Get real-time raffle progress including tickets sold and countdown timer.

**Authentication**: Optional (public endpoint)

**Response**:

```json
{
  "success": true,
  "progress": {
    "raffleId": "RAFFLE_123",
    "ticketsSold": 2500,
    "maxTickets": 5000,
    "ticketsRemaining": 2500,
    "percentSold": "50.00",
    "status": "active",
    "drawDate": "2025-12-31T23:59:59Z",
    "timeRemaining": {
      "days": 45,
      "hours": 12,
      "minutes": 30
    },
    "totalRevenue": 125000
  }
}
```

---

## Customer Endpoints

### POST /api/raffles/:raffleId/purchase

Purchase raffle tickets.

**Authentication**: Required

**Request Body**:

```json
{
  "customerId": "CUST_123",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "numTickets": 10,
  "paymentMethod": {
    "type": "credit_card",
    "token": "tok_visa_1234"
  }
}
```

**Validation Rules**:

- `numTickets`: 1-100 (per TX gambling law)
- Age verification required (21+)
- Gold members receive 5 bonus entries per raffle
- Payment processed through KAJA gateway

**Response**:

```json
{
  "success": true,
  "transaction": {
    "id": "TXN_123",
    "raffleId": "RAFFLE_123",
    "numTickets": 10,
    "ticketNumbers": [2501, 2502, 2503, 2504, 2505, 2506, 2507, 2508, 2509, 2510, 2511, 2512, 2513, 2514, 2515],
    "bonusEntries": 5,
    "amount": 500,
    "paymentStatus": "completed",
    "timestamp": "2025-10-01T12:00:00Z"
  },
  "tickets": [
    { "ticketNumber": 2501, "isBonusEntry": false },
    { "ticketNumber": 2502, "isBonusEntry": false },
    { "ticketNumber": 2503, "isBonusEntry": false },
    { "ticketNumber": 2504, "isBonusEntry": false },
    { "ticketNumber": 2505, "isBonusEntry": false },
    { "ticketNumber": 2506, "isBonusEntry": false },
    { "ticketNumber": 2507, "isBonusEntry": false },
    { "ticketNumber": 2508, "isBonusEntry": false },
    { "ticketNumber": 2509, "isBonusEntry": false },
    { "ticketNumber": 2510, "isBonusEntry": false },
    { "ticketNumber": 2511, "isBonusEntry": true },
    { "ticketNumber": 2512, "isBonusEntry": true },
    { "ticketNumber": 2513, "isBonusEntry": true },
    { "ticketNumber": 2514, "isBonusEntry": true },
    { "ticketNumber": 2515, "isBonusEntry": true }
  ]
}
```

**Error Responses**:

```json
{
  "success": false,
  "error": "Age verification required. Customers must be 21+ to purchase raffle tickets.",
  "requiresAgeVerification": true
}
```

```json
{
  "success": false,
  "error": "Only 1500 tickets remaining"
}
```

```json
{
  "success": false,
  "error": "Raffle is not active. Current status: sold_out"
}
```

### GET /api/raffles/:raffleId/tickets/:customerId

Get all tickets owned by a customer for a specific raffle.

**Authentication**: Required (customer or admin)

**Authorization**: Customer can only view their own tickets, admins can view all

**Response**:

```json
{
  "success": true,
  "tickets": [
    {
      "id": "TICKET_RAFFLE_123_2501",
      "ticketNumber": 2501,
      "isBonusEntry": false,
      "purchaseDate": "2025-10-01T12:00:00Z",
      "isWinner": false,
      "isRunnerUp": false,
      "runnerUpRank": null
    }
  ],
  "count": 15,
  "paidTickets": 10,
  "bonusTickets": 5
}
```

---

## Admin Endpoints

### POST /api/raffles

Create a new raffle.

**Authentication**: Required (admin only)

**Request Body**:

```json
{
  "name": "Blue Dream $250K Q1 2026",
  "description": "Quarterly $250K cash raffle",
  "prize": "$250,000 Cash Prize",
  "ticketPrice": 50,
  "maxTickets": 5000,
  "drawDate": "2026-03-31T23:59:59Z"
}
```

**Validation Rules**:

- `ticketPrice` must be > 0
- `maxTickets` must be > 0
- `drawDate` must be in the future

**Response**:

```json
{
  "success": true,
  "raffle": {
    "id": "RAFFLE_456",
    "name": "Blue Dream $250K Q1 2026",
    "description": "Quarterly $250K cash raffle",
    "prize": "$250,000 Cash Prize",
    "ticket_price": 50,
    "max_tickets": 5000,
    "tickets_sold": 0,
    "status": "draft",
    "draw_date": "2026-03-31T23:59:59Z",
    "total_revenue": 0,
    "created_at": "2025-10-01T12:00:00Z",
    "updated_at": "2025-10-01T12:00:00Z",
    "created_by": "admin_user_123"
  }
}
```

### PUT /api/raffles/:raffleId

Update raffle details.

**Authentication**: Required (admin only)

**Request Body**:

```json
{
  "name": "Blue Dream $300K Q1 2026",
  "description": "Updated description",
  "status": "active"
}
```

**Restrictions**:

- Cannot modify `ticket_price` or `max_tickets` after tickets have been sold
- Cannot update raffles with status `drawn` or `completed`

**Response**:

```json
{
  "success": true,
  "raffle": {
    "id": "RAFFLE_456",
    "name": "Blue Dream $300K Q1 2026",
    "description": "Updated description",
    "status": "active",
    "updated_at": "2025-10-01T13:00:00Z"
  }
}
```

### POST /api/raffles/:raffleId/draw

Conduct the raffle drawing with cryptographically secure random selection.

**Authentication**: Required (admin only)

**Process**:

1. Validates raffle status (must be active or sold_out)
2. Generates cryptographically secure random seed
3. Selects winner using secure algorithm
4. Selects top 10 runner-ups
5. Creates tamper-proof audit trail
6. Sends winner and runner-up notifications
7. Updates raffle status to `drawn`

**Response**:

```json
{
  "success": true,
  "drawing": {
    "raffleId": "RAFFLE_123",
    "winner": {
      "customerId": "CUST_789",
      "customerEmail": "winner@example.com",
      "customerName": "Jane Smith",
      "ticketNumber": 3452
    },
    "runnerUps": [
      {
        "rank": 1,
        "customerId": "CUST_456",
        "customerEmail": "runner1@example.com",
        "customerName": "Bob Johnson",
        "ticketNumber": 1024
      }
    ],
    "drawTimestamp": "2025-12-31T23:59:59Z",
    "auditTrail": {
      "raffleId": "RAFFLE_123",
      "drawTimestamp": "2025-12-31T23:59:59Z",
      "seed": "a1b2c3d4...",
      "seedHash": "sha256_hash...",
      "winner": {
        "ticketNumber": 3452,
        "customerId": "CUST_789"
      },
      "runnerUps": [...],
      "algorithmVersion": "1.0.0",
      "nodeVersion": "v18.0.0",
      "auditHash": "tamper_proof_hash..."
    }
  }
}
```

### GET /api/raffles/stats

Get comprehensive raffle statistics (admin dashboard).

**Authentication**: Required (admin only)

**Response**:

```json
{
  "success": true,
  "stats": {
    "totalRaffles": 12,
    "activeRaffles": 2,
    "totalRevenue": "1250000.00",
    "totalTicketsSold": 25000,
    "avgTicketPrice": "50.00",
    "byStatus": [
      {
        "status": "completed",
        "count": 8,
        "revenue": "1000000.00",
        "ticketsSold": 20000
      },
      {
        "status": "active",
        "count": 2,
        "revenue": "125000.00",
        "ticketsSold": 2500
      },
      {
        "status": "drawn",
        "count": 1,
        "revenue": "125000.00",
        "ticketsSold": 2500
      }
    ],
    "generatedAt": "2025-10-01T12:00:00Z"
  }
}
```

### DELETE /api/raffles/:raffleId/cancel

Cancel a raffle and process refunds for all ticket purchases.

**Authentication**: Required (admin only)

**Request Body**:

```json
{
  "reason": "Technical issues with drawing system"
}
```

**Process**:

1. Validates raffle can be cancelled (not drawn/completed)
2. Retrieves all paid transactions
3. Processes batch refunds through KAJA gateway
4. Updates raffle status to `cancelled`
5. Sends cancellation emails to all customers

**Response**:

```json
{
  "success": true,
  "message": "Raffle cancelled successfully",
  "refunds": {
    "total": 250,
    "successful": 248,
    "failed": 2,
    "details": [
      {
        "transactionId": "TXN_123",
        "refund": {
          "refundId": "RAFFLE_REFUND_123",
          "amount": 500,
          "status": "success"
        },
        "success": true
      }
    ]
  }
}
```

---

## Data Models

### Raffle

```typescript
interface Raffle {
  id: string;                      // Unique raffle ID
  name: string;                    // Raffle name
  description?: string;            // Optional description
  prize: string;                   // Prize description
  ticket_price: number;            // Price per ticket ($)
  max_tickets: number;             // Maximum tickets available
  tickets_sold: number;            // Current tickets sold
  status: RaffleStatus;            // Current status
  draw_date: string;               // ISO 8601 draw date
  winner_id?: string;              // Winner customer ID
  winner_ticket_number?: number;   // Winning ticket number
  runner_ups?: RunnerUp[];         // Runner-up details
  draw_timestamp?: string;         // ISO 8601 draw time
  draw_seed?: string;              // Cryptographic seed
  total_revenue: number;           // Total revenue ($)
  created_at: string;              // ISO 8601 creation time
  updated_at: string;              // ISO 8601 update time
  created_by: string;              // Admin user ID
}

type RaffleStatus =
  | 'draft'      // Created but not active
  | 'active'     // Accepting ticket purchases
  | 'sold_out'   // All tickets sold
  | 'drawn'      // Winner selected
  | 'completed'  // Prize awarded, raffle complete
  | 'cancelled'; // Cancelled with refunds
```

### Ticket

```typescript
interface Ticket {
  id: string;                    // Unique ticket ID
  raffle_id: string;             // Raffle ID
  customer_id: string;           // Customer ID
  customer_email: string;        // Customer email
  customer_name: string;         // Customer name
  ticket_number: number;         // Sequential ticket number
  is_bonus_entry: boolean;       // Gold member bonus entry
  transaction_id?: string;       // Purchase transaction ID
  purchase_date: string;         // ISO 8601 purchase time
  is_winner: boolean;            // Is winning ticket
  is_runner_up: boolean;         // Is runner-up ticket
  runner_up_rank?: number;       // Runner-up rank (1-10)
  age_verified: boolean;         // Age verification status
  age_verification_date?: string;// ISO 8601 verification time
  created_at: string;            // ISO 8601 creation time
}
```

### Transaction

```typescript
interface Transaction {
  id: string;                    // Unique transaction ID
  raffle_id: string;             // Raffle ID
  customer_id: string;           // Customer ID
  customer_email: string;        // Customer email
  num_tickets: number;           // Number of tickets purchased
  ticket_numbers: number[];      // Allocated ticket numbers
  amount: number;                // Payment amount ($)
  payment_method: string;        // Payment method type
  payment_status: string;        // Payment status
  payment_gateway_id: string;    // KAJA transaction ID
  payment_gateway_response: any; // Gateway response data
  refund_id?: string;            // Refund ID if refunded
  refund_date?: string;          // ISO 8601 refund time
  ip_address?: string;           // Customer IP address
  user_agent?: string;           // Customer user agent
  created_at: string;            // ISO 8601 creation time
  updated_at: string;            // ISO 8601 update time
}
```

---

## Integration Examples

### React Component - Raffle Purchase Flow

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RafflePurchase = ({ raffleId, customerId, authToken }) => {
  const [raffle, setRaffle] = useState(null);
  const [numTickets, setNumTickets] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRaffleDetails();
  }, [raffleId]);

  const fetchRaffleDetails = async () => {
    try {
      const response = await axios.get(
        `https://api.livhana.com/api/raffles/${raffleId}`
      );
      setRaffle(response.data.raffle);
    } catch (err) {
      setError('Failed to load raffle details');
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `https://api.livhana.com/api/raffles/${raffleId}/purchase`,
        {
          customerId,
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

      alert(`Success! You purchased ${response.data.transaction.numTickets} tickets.`);
      if (response.data.transaction.bonusEntries > 0) {
        alert(`Gold Member Bonus: ${response.data.transaction.bonusEntries} extra entries!`);
      }

      fetchRaffleDetails(); // Refresh raffle data
    } catch (err) {
      if (err.response?.data?.requiresAgeVerification) {
        setError('Age verification required. Please verify you are 21+.');
      } else {
        setError(err.response?.data?.error || 'Purchase failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!raffle) return <div>Loading...</div>;

  return (
    <div className="raffle-purchase">
      <h2>{raffle.name}</h2>
      <p className="prize">{raffle.prize}</p>

      <div className="progress">
        <div className="progress-bar" style={{
          width: `${(raffle.ticketsSold / raffle.maxTickets) * 100}%`
        }} />
        <p>{raffle.ticketsRemaining} tickets remaining</p>
      </div>

      <div className="purchase-form">
        <label>
          Number of Tickets (${raffle.ticketPrice} each):
          <input
            type="number"
            min="1"
            max="100"
            value={numTickets}
            onChange={(e) => setNumTickets(parseInt(e.target.value))}
          />
        </label>

        <p className="total">
          Total: ${numTickets * raffle.ticketPrice}
        </p>

        <button
          onClick={handlePurchase}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Purchase Tickets'}
        </button>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default RafflePurchase;
```

### React Component - Raffle Progress Widget

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RaffleProgress = ({ raffleId }) => {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [raffleId]);

  const fetchProgress = async () => {
    try {
      const response = await axios.get(
        `https://api.livhana.com/api/raffles/${raffleId}/progress`
      );
      setProgress(response.data.progress);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  if (!progress) return <div>Loading...</div>;

  const percentSold = parseFloat(progress.percentSold);

  return (
    <div className="raffle-progress-widget">
      <h3>Raffle Progress</h3>

      <div className="progress-circle">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#eee" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#4caf50"
            strokeWidth="10"
            strokeDasharray={`${percentSold * 2.827} 282.7`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="progress-text">
          <strong>{percentSold.toFixed(1)}%</strong>
          <span>Sold</span>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <strong>{progress.ticketsSold.toLocaleString()}</strong>
          <span>Tickets Sold</span>
        </div>
        <div className="stat">
          <strong>{progress.ticketsRemaining.toLocaleString()}</strong>
          <span>Remaining</span>
        </div>
      </div>

      {progress.timeRemaining && (
        <div className="countdown">
          <h4>Time Remaining</h4>
          <div className="time-units">
            <div>
              <strong>{progress.timeRemaining.days}</strong>
              <span>Days</span>
            </div>
            <div>
              <strong>{progress.timeRemaining.hours}</strong>
              <span>Hours</span>
            </div>
            <div>
              <strong>{progress.timeRemaining.minutes}</strong>
              <span>Minutes</span>
            </div>
          </div>
        </div>
      )}

      <div className="revenue">
        Revenue: ${progress.totalRevenue.toLocaleString()}
      </div>
    </div>
  );
};

export default RaffleProgress;
```

### Node.js - Admin Drawing Script

```javascript
const axios = require('axios');

async function conductRaffleDrawing(raffleId, adminToken) {
  try {
    console.log(`Conducting drawing for raffle: ${raffleId}`);

    // Conduct drawing
    const response = await axios.post(
      `https://api.livhana.com/api/raffles/${raffleId}/draw`,
      {},
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    const { drawing } = response.data;

    console.log('\n========== RAFFLE DRAWING RESULTS ==========');
    console.log(`Raffle ID: ${drawing.raffleId}`);
    console.log(`Draw Time: ${drawing.drawTimestamp}`);
    console.log('\nWINNER:');
    console.log(`  Customer: ${drawing.winner.customerName}`);
    console.log(`  Email: ${drawing.winner.customerEmail}`);
    console.log(`  Ticket #: ${drawing.winner.ticketNumber}`);

    console.log('\nRUNNER-UPS:');
    drawing.runnerUps.forEach(runnerUp => {
      console.log(`  ${runnerUp.rank}. ${runnerUp.customerName} - Ticket #${runnerUp.ticketNumber}`);
    });

    console.log('\nAUDIT TRAIL:');
    console.log(`  Seed Hash: ${drawing.auditTrail.seedHash}`);
    console.log(`  Audit Hash: ${drawing.auditTrail.auditHash}`);
    console.log(`  Algorithm: v${drawing.auditTrail.algorithmVersion}`);
    console.log('=============================================\n');

    return drawing;
  } catch (error) {
    console.error('Drawing failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
conductRaffleDrawing('RAFFLE_123', 'admin_jwt_token');
```

### Python - Analytics Script

```python
import requests
import pandas as pd
from datetime import datetime

def fetch_raffle_stats(api_url, admin_token):
    """Fetch comprehensive raffle statistics"""
    headers = {'Authorization': f'Bearer {admin_token}'}

    response = requests.get(
        f'{api_url}/api/raffles/stats',
        headers=headers
    )

    if response.status_code != 200:
        raise Exception(f'Failed to fetch stats: {response.text}')

    return response.json()['stats']

def analyze_raffle_performance(stats):
    """Analyze raffle performance metrics"""

    print("========== RAFFLE PERFORMANCE ANALYSIS ==========")
    print(f"Total Raffles: {stats['totalRaffles']}")
    print(f"Active Raffles: {stats['activeRaffles']}")
    print(f"Total Revenue: ${float(stats['totalRevenue']):,.2f}")
    print(f"Total Tickets Sold: {stats['totalTicketsSold']:,}")
    print(f"Avg Ticket Price: ${float(stats['avgTicketPrice']):.2f}")
    print()

    # Status breakdown
    print("Revenue by Status:")
    df = pd.DataFrame(stats['byStatus'])
    df['revenue'] = df['revenue'].astype(float)

    for _, row in df.iterrows():
        print(f"  {row['status']:12} | Count: {row['count']:3} | "
              f"Revenue: ${row['revenue']:>12,.2f} | "
              f"Tickets: {row['ticketsSold']:>6,}")

    print()

    # Calculate metrics
    avg_revenue_per_raffle = float(stats['totalRevenue']) / stats['totalRaffles']
    avg_tickets_per_raffle = stats['totalTicketsSold'] / stats['totalRaffles']

    print(f"Avg Revenue per Raffle: ${avg_revenue_per_raffle:,.2f}")
    print(f"Avg Tickets per Raffle: {avg_tickets_per_raffle:,.0f}")
    print("================================================")

# Usage
api_url = 'https://api.livhana.com'
admin_token = 'admin_jwt_token'

stats = fetch_raffle_stats(api_url, admin_token)
analyze_raffle_performance(stats)
```

---

## Compliance Features

### Age Verification (21+)

All customers must complete age verification before purchasing raffle tickets. The system integrates with the age verification service to ensure compliance with Texas gambling laws.

**Verification Flow**:

1. Customer attempts to purchase tickets
2. System checks age verification status
3. If not verified, returns error with `requiresAgeVerification: true`
4. Customer completes age verification through separate flow
5. Customer can then purchase tickets

### TX Gambling Law Compliance

- **Minimum Age**: 21 years old
- **Ticket Limits**: 1-100 tickets per purchase
- **Record Retention**: 7 years minimum
- **Transparent Drawing**: Cryptographically secure with audit trail
- **Winner Verification**: Identity verification required for prize claim

### Data Retention

All raffle data is stored in BigQuery with the following retention policies:

- **Raffle Records**: 7 years minimum
- **Ticket Records**: 7 years minimum
- **Transaction Records**: 7 years minimum
- **Audit Trails**: Permanent retention

### Audit Trail

Every drawing includes a tamper-proof audit trail with:

- Cryptographic seed (64-character hex)
- SHA-256 hash of seed
- Winner and runner-up details
- Algorithm version
- Node.js version
- Timestamp
- Complete audit hash

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions or age verification required |
| 404 | Not Found | Raffle or resource not found |
| 500 | Internal Server Error | Server-side error |

### Common Error Messages

**Age Verification**:
```json
{
  "success": false,
  "error": "Age verification required. Customers must be 21+ to purchase raffle tickets.",
  "requiresAgeVerification": true
}
```

**Sold Out**:
```json
{
  "success": false,
  "error": "Only 50 tickets remaining"
}
```

**Invalid Status**:
```json
{
  "success": false,
  "error": "Raffle is not active. Current status: sold_out"
}
```

**Payment Failed**:
```json
{
  "success": false,
  "error": "Payment processing failed",
  "details": {
    "gatewayError": "Card declined"
  }
}
```

**Admin Only**:
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**Already Drawn**:
```json
{
  "success": false,
  "error": "Raffle has already been drawn"
}
```

---

## Testing

### Run Tests

```bash
cd backend/integration-service
npm test src/raffle.test.js
```

### Test Coverage

The test suite includes:

- Raffle status transitions
- Ticket allocation and numbering
- Cryptographic drawing system
- Age verification compliance
- Gold member bonus entries
- Payment calculations
- Refund processing
- Complete lifecycle simulation
- Blue Dream $250K raffle scenario

---

## Support

For technical support or questions:

- **Email**: dev@livhana.com
- **Documentation**: https://docs.livhana.com/raffles
- **Status Page**: https://status.livhana.com

---

## Changelog

### Version 1.0.0 (2025-10-01)

- Initial release
- Blue Dream $250K raffle system
- Cryptographically secure drawing
- KAJA payment integration
- Age verification compliance
- Gold member bonus entries
- Complete API documentation
