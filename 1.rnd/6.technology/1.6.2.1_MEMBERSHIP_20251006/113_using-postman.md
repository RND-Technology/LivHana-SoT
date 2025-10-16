### Using Postman

Import this collection:

```json
{
  "info": {
    "name": "LivHana Membership API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Subscribe to Membership",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/memberships/subscribe",
        "header": [
          {"key": "Authorization", "value": "Bearer {{jwtToken}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"customerId\": \"CUST_TEST_001\",\n  \"email\": \"test@example.com\",\n  \"tier\": \"SILVER\",\n  \"paymentMethod\": {\n    \"id\": \"pm_test_card\",\n    \"type\": \"card\",\n    \"last4\": \"4242\"\n  }\n}"
        }
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:3005"},
    {"key": "jwtToken", "value": "YOUR_JWT_TOKEN_HERE"}
  ]
}
```

---
