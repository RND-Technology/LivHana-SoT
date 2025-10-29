### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LIGHTSPEED STORE                              │
│                                                                   │
│  Customer Places Order → Order Created (Status: PENDING)         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               WEBHOOK: Order Created Event                        │
│                                                                   │
│  Triggered by: Lightspeed webhook to Integration Service         │
│  Endpoint: POST /api/webhooks/lightspeed/order-created          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│        VERIFICATION GATE ORCHESTRATOR                            │
│                                                                   │
│  Step 1: Check [PURGED_FALLACY] approval status                           │
│  Step 2: Check membership agreement signed                       │
│  Step 3: Decide: Approve, Hold, or Auto-Refund                  │
└────────────────┬────────────────┬─────────────────┬──────────────┘
                 │                 │                 │
         ✅ APPROVED       ⚠️ PENDING         ❌ REJECTED
                 │                 │                 │
                 ▼                 ▼                 ▼
    ┌────────────────┐  ┌──────────────────┐  ┌──────────────┐
    │  Update Order  │  │ Start 72-Hour    │  │ Auto-Refund  │
    │ Status: READY  │  │ Email Countdown  │  │   Order      │
    │  → Fulfill     │  │  (3 reminder     │  │              │
    │                │  │   emails)        │  │              │
    └────────┬───────┘  └────────┬─────────┘  └──────────────┘
             │                   │
             │                   │ (If verified within 72h)
             │                   └─────────────┐
             ▼                                 ▼
    ┌────────────────────────────────────────────────────────┐
    │         LOYALTY ENROLLMENT AUTOMATION                   │
    │                                                          │
    │  1. Check if customer already in LS Loyalty             │
    │  2. If not: Create loyalty account via LS API           │
    │  3. Add tier (Member/Silver/Gold based on membership)   │
    │  4. Grant welcome points/free grams                     │
    └──────────────────────────────────────────────────────────┘
```

---
