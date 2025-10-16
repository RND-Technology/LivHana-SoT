### Backend Services (7 total)

| Service | Port | Status | Auth | Queue | External APIs |
|---------|------|--------|------|-------|---------------|
| voice-service | 4001 | 🟢 Active | 🔴 DISABLED | ✅ BullMQ | ElevenLabs |
| reasoning-gateway | 4002 | 🟢 Active | 🔴 DISABLED | ✅ BullMQ | DeepSeek |
| integration-service | 3005 | 🟢 Active | ⚠️ Partial | ✅ Bull | Square, BigQuery |
| payment-service | 3003 | 🟡 Dormant | ❓ Unknown | ✅ Bull | Square |
| product-service | 3004 | 🟡 Dormant | ❓ Unknown | ❌ None | None |
| cannabis-service | 3006 | 🟡 Dormant | ❓ Unknown | ❌ None | None |
| common | N/A | 📚 Lib | ✅ Provides | ✅ Provides | N/A |
