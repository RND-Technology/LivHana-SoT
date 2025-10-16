### API Endpoint
```
POST /api/voice-commerce
Body: {
  transcript: "I need more sleep gummies",
  customerId: "12345"
}

Response: {
  success: true,
  message: "Ordered 1x Sleep Gummies. Order ID: ABC123",
  order_id: "ABC123",
  intent: "reorder",
  confidence: 0.95
}
```
