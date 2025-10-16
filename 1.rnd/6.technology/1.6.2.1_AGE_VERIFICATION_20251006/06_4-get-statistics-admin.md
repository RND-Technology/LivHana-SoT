### 4. Get Statistics (Admin)

Get age verification statistics for the admin dashboard.

**Endpoint:** `GET /api/age-verification/statistics?days=30`

**Query Parameters:**

- `days`: Number of days to include in statistics (integer, optional, default: 30)

**Success Response (200):**

```json
{
  "success": true,
  "statistics": {
    "totalAttempts": 1247,
    "successfulVerifications": 1089,
    "failedVerifications": 158,
    "successRate": "87.33",
    "period": "30 days"
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---
