### Complete Customer Journey

```
1. Customer places order on reggieanddro.com
   ↓
2. LightSpeed POS processes payment
   ↓
3. Order marked as "delivery" in LightSpeed
   ↓
4. Store marks order as "completed" (ready to ship)
   ↓
5. LightSpeed webhook → POST /api/v1/delivery/lightspeed/webhook
   ↓
6. Delivery service validates zone (35-mile radius)
   ↓
7. Get quotes from DoorDash + Uber
   ↓
8. Select best provider (DoorDash primary, Uber fallback)
   ↓
9. Create delivery with selected provider
   ↓
10. Store delivery record in PostgreSQL
   ↓
11. Send tracking link to customer via SMS/email
   ↓
12. Customer tracks delivery in real-time
   ↓
13. Delivery completed → Update status in database
```

---
