### SQUARE API INTEGRATION ROADMAP

**Goal:** Seamless sync between LightSpeed webstore, Square POS, and verification database

**Required API Endpoints:**

1. **Customer Database Query**

```python
# Check existing verification status
POST /api/v1/customer/check-verification
{
  "email": "customer@email.com",
  "phone": "+1234567890"
}

Response:
{
  "veriff_approved": true/false,
  "veriff_date": "2024-XX-XX",
  "membership_signed": true/false,
  "membership_date": "2024-XX-XX",
  "email_optin": true/false,
  "optin_date": "2024-XX-XX"
}
```

2. **Order Flagging System**

```python
# Flag order for post-purchase verification
POST /api/v1/order/flag-verification
{
  "order_id": "R&D123456",
  "email": "customer@email.com",
  "flags": ["veriff_needed", "membership_needed"],
  "auto_refund_date": "2024-XX-XX 23:59:59"
}
```

3. **Automated Email Triggers**

```python
# Trigger verification email sequence
POST /api/v1/email/trigger-sequence
{
  "order_id": "R&D123456",
  "email": "customer@email.com",
  "sequence_type": "verification_required",
  "countdown_hours": 72
}
```

4. **Inventory Sync**

```python
# Real-time inventory between Square and LightSpeed
GET /api/v1/inventory/sync
{
  "product_id": "SKU123",
  "quantity_available": 42,
  "last_sync": "2024-XX-XX 12:34:56"
}
```
