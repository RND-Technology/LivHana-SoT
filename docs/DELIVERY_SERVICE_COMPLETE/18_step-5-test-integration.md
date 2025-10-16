### Step 5: Test Integration

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe delivery-service \
  --project=reggieanddrodispensary \
  --region=us-central1 \
  --format='value(status.url)')

# Test 1: Health check
curl $SERVICE_URL/health

# Expected:
# {
#   "status": "healthy",
#   "service": "delivery-service",
#   "providers": {
#     "doordash": true,
#     "uber": true,
#     "roadie": false,
#     "goshare": false
#   }
# }

# Test 2: Create manual delivery
curl -X POST $SERVICE_URL/api/v1/delivery/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST-001",
    "pickup": {
      "address": "123 Main St, San Antonio, TX 78201",
      "businessName": "Reggie & Dro",
      "phone": "+12109999999",
      "lat": 29.4241,
      "lng": -98.4936
    },
    "dropoff": {
      "address": "456 Oak Ave, San Antonio, TX 78210",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+12105551234",
      "lat": 29.4000,
      "lng": -98.5000
    },
    "customer": {
      "id": "CUST-001",
      "name": "John Doe",
      "phone": "+12105551234",
      "email": "john@example.com"
    },
    "items": [
      {
        "id": "ITEM-001",
        "name": "Product Name",
        "quantity": 2,
        "price": 50.00
      }
    ],
    "orderTotal": 100.00,
    "deliveryTime": "ASAP"
  }'

# Expected:
# {
#   "success": true,
#   "delivery": {
#     "deliveryId": "TEST-001",
#     "provider": "doordash",
#     "trackingUrl": "https://...",
#     "estimatedDeliveryTime": "2025-10-04T23:30:00Z",
#     "cost": 15.00,
#     "distance": 8.5
#   }
# }
```

---
