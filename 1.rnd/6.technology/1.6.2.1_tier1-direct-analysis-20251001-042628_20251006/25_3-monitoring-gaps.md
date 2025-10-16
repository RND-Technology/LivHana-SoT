### **3. Monitoring Gaps:**

**Missing:** Distributed tracing for request flow

**ADD:** OpenTelemetry instrumentation:

```javascript
const { trace } = require('@opentelemetry/api');

router.post('/api/memberships/subscribe', async (req, res) => {
  const span = trace.getTracer('membership-service').startSpan('subscribe');
  
  try {
    span.setAttribute('customer_id', req.body.customerId);
    span.setAttribute('tier', req.body.tier);
    
    const result = await createSubscription(req.body);
    
    span.setAttribute('subscription_id', result.subscription_id);
    span.setStatus({ code: SpanStatusCode.OK });
    
    res.json(result);
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  } finally {
    span.end();
  }
});
```

---
