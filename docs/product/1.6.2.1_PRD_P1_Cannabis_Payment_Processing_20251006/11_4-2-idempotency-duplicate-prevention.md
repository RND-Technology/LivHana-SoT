### 4.2 Idempotency & Duplicate Prevention

```javascript
class PaymentIdempotency {
  constructor() {
    this.cache = new Redis(process.env.REDIS_URL);
    this.ttl = 86400; // 24 hours
  }
  
  async checkIdempotency(idempotencyKey, paymentData) {
    const existingResult = await this.cache.get(`payment:${idempotencyKey}`);
    
    if (existingResult) {
      const parsed = JSON.parse(existingResult);
      
      // Verify payload matches to prevent key reuse attacks
      if (this.payloadMatches(parsed.original_data, paymentData)) {
        return {
          duplicate: true,
          original_result: parsed.result
        };
      } else {
        throw new Error('Idempotency key reused with different payload');
      }
    }
    
    return { duplicate: false };
  }
  
  async storeResult(idempotencyKey, paymentData, result) {
    const record = {
      original_data: this.hashPayload(paymentData),
      result: result,
      timestamp: new Date().toISOString()
    };
    
    await this.cache.setex(
      `payment:${idempotencyKey}`, 
      this.ttl, 
      JSON.stringify(record)
    );
  }
}
```
