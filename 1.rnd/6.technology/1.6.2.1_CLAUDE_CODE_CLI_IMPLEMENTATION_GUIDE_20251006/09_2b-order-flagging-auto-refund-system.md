### 2B: Order Flagging & Auto-Refund System

**Claude Code Prompt:**

```
You are building an automated order flagging and refund system for post-purchase verification.

BUSINESS LOGIC:
- Orders accepted immediately (low friction checkout)
- Post-purchase: Check if customer has Veriff approval + membership agreement
- If missing: Email customer with 72-hour countdown to complete verification
- If not completed: Auto-refund to original payment method
- Email sequence: 3 reminders (24h, 48h, 72h) then auto-refund

DATABASE SCHEMA:

**Table: order_verification_flags**
```sql
CREATE TABLE order_verification_flags (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  flag_type VARCHAR(50) NOT NULL, -- 'veriff_needed', 'membership_needed'
  flag_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'refunded'
  auto_refund_date TIMESTAMP NOT NULL,
  reminder_emails_sent INT DEFAULT 0,
  last_reminder_sent TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
```

API ENDPOINTS:

**1. Flag Order for Verification**

```
POST /api/v1/order/flag-verification
Body:
{
  "order_id": "R&D123456",
  "customer_email": "customer@example.com",
  "flags": ["veriff_needed", "membership_needed"],
  "auto_refund_hours": 72
}

Response:
{
  "success": true,
  "order_id": "R&D123456",
  "auto_refund_date": "2024-09-18T14:32:00Z",
  "email_sequence_triggered": true
}
```

**2. Complete Verification**

```
POST /api/v1/order/complete-verification
Body:
{
  "order_id": "R&D123456",
  "verification_type": "veriff" | "membership"
}

Response:
{
  "success": true,
  "order_id": "R&D123456",
  "remaining_flags": ["membership_needed"],
  "order_status": "partially_verified" | "fully_verified",
  "ship_now": false | true
}
```

**3. Process Auto-Refunds (CRON JOB)**

```
POST /api/v1/order/process-auto-refunds
Headers: X-CRON-Key: [internal key]

Response:
{
  "orders_processed": 5,
  "refunds_initiated": 3,
  "orders_completed_just_in_time": 2,
  "total_refund_amount": "$375.00",
  "refund_details": [
    {
      "order_id": "R&D123456",
      "amount": "$125.00",
      "status": "refund_initiated"
    },
    ...
  ]
}
```

AUTOMATION REQUIREMENTS:

**CRON Jobs (run every hour):**

1. Check for orders approaching auto-refund deadline
2. Send reminder emails at 24h, 48h, 72h marks
3. Process auto-refunds for expired orders
4. Update order status in Square
5. Log all actions for audit trail

**Email Trigger Integration:**

- SendGrid API integration
- Dynamic email templates with countdown timers
- Personalization tokens (order_id, items, total, deadline)
- Unsubscribe handling (legal requirement)

**Square Refund Integration:**

- Use Square Refunds API
- Refund to original payment method
- Full refund (order total + shipping)
- Reason code: "VERIFICATION_NOT_COMPLETED"
- Update inventory (return items to stock)

EDGE CASES TO HANDLE:

- Customer completes verification seconds before auto-refund
- Duplicate verification attempts (idempotency)
- Partial refunds (if customer wants to cancel part of order)
- Manual override (admin can extend deadline or force refund)
- Payment method expired (handle refund failure gracefully)

ERROR HANDLING:

- Square API down: Queue refund for retry (max 3 attempts)
- Email send failure: Log and retry (max 5 attempts)
- Database deadlock: Retry with exponential backoff
- Customer dispute: Flag for manual review

MONITORING & ALERTS:

- Slack webhook for refunds >$200
- Daily summary email to admin (refund totals, verification completion rate)
- Sentry alerts for any API errors
- Datadog metrics: refund rate, avg time to verification, email open rates

DELIVERABLES:

1. Flask API endpoints (order_verification_blueprint.py)
2. CRON job script (auto_refund_processor.py)
3. Square refund integration (square_refunds.py)
4. SendGrid email trigger (email_automation.py)
5. Database migrations (Alembic)
6. Unit tests + integration tests
7. Monitoring dashboard config (Datadog)
8. Admin panel mockup (for manual overrides)

Build a robust, fault-tolerant system that handles edge cases gracefully and provides visibility into all operations. Include comprehensive logging and error tracking.

```

**Expected Output:** Complete order verification automation system

---
