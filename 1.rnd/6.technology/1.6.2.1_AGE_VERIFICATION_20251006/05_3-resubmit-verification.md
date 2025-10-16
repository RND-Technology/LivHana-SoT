### 3. Resubmit Verification

Resubmit verification for a customer (clears cache and performs new verification).

**Endpoint:** `POST /api/age-verification/resubmit`

**Request Body:**

```json
{
  "customerId": "unique-customer-id",
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-15",
  "idNumberLast4": "1234",
  "state": "TX"
}
```

**Response:** Same as `/verify` endpoint

**Use Case:** When customer data changes or they need to reverify

---
