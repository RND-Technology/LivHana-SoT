### 6.1 API Endpoints

```typescript
// Cannabis payment processing endpoints
interface PaymentAPI {
  // Create payment intent
  POST /api/payments/cannabis/intent: {
    amount: number;
    products: CannabisProduct[];
    customer: VerifiedCustomer;
    compliance_check: boolean;
  }
  
  // Process payment
  POST /api/payments/cannabis/process: {
    payment_intent_id: string;
    payment_method: PaymentMethod;
    idempotency_key: string;
  }
  
  // Verify payment status
  GET /api/payments/cannabis/:id/status: PaymentStatus;
  
  // Handle webhooks
  POST /api/webhooks/authorize-net: AuthorizeNetWebhook;
  
  // Refund processing
  POST /api/payments/cannabis/:id/refund: RefundRequest;
}
```
