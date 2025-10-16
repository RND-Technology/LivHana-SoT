## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Integration Service                       │
│                    (Port 3005)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ JWT Auth
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Membership Router                         │
│  • Subscribe        • Get Membership    • Upgrade           │
│  • Cancel           • Stats (Admin)     • Discount          │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌──────────────┐  ┌─────────────┐  ┌──────────┐
    │ KAJA Gateway │  │  BigQuery   │  │  Email   │
    │(Authorize.Net)│  │  Storage    │  │ Service  │
    └──────────────┘  └─────────────┘  └──────────┘
         │                   │
         │                   │
         ▼                   ▼
    Recurring           commerce.memberships
    Billing             Table
```
