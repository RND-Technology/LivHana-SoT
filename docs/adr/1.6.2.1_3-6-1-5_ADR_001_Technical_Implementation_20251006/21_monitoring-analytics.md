### MONITORING & ANALYTICS

**Performance Monitoring:**

```javascript
// Add to all projects for performance tracking
const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.path} - ${duration}ms - ${res.statusCode}`);
    
    // Track slow requests
    if (duration > 2000) {
      console.warn(`SLOW REQUEST: ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};
```

**Revenue Tracking:**

```javascript
// Integrate with all payment endpoints
const trackRevenue = (transactionData) => {
  // Send to analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase', {
      transaction_id: transactionData.orderId,
      value: transactionData.amount,
      currency: 'USD',
      items: transactionData.items
    });
  }
  
  // Log for internal tracking
  console.log('REVENUE_EVENT:', JSON.stringify({
    timestamp: new Date().toISOString(),
    amount: transactionData.amount,
    source: transactionData.source,
    customer: transactionData.customerEmail
  }));
};
```

---
