### 1. APM: New Relic ✅

**Why New Relic**:

- Superior Node.js support with automatic instrumentation
- Built-in AI monitoring for OpenAI/Anthropic calls
- More cost-effective for startups ($50/month vs Datadog $700/month)
- Generous free tier (100 GB data/month)
- All-in-one pricing (no per-feature charges like Datadog)

**Features Implemented**:

- Automatic Node.js instrumentation
- Distributed tracing across services
- AI model call tracking (Claude, GPT-4, DeepSeek)
- Transaction performance monitoring
- Database query tracking
- Custom business metrics
- Real-time alerting

**Configuration Files**:

- `/backend/integration-service/newrelic.js`
- `/backend/reasoning-gateway/newrelic.js`
- `/backend/common/monitoring/newrelic-config.template.js`

**Services Monitored**:

- LivHana-Integration-Service (Port 3005)
- LivHana-Reasoning-Gateway (Port 4002)
- LivHana-Voice-Service (Port 4001)

---
