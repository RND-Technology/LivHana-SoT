### 3.2 KAJA/Authorize.Net Integration

```javascript
class KAJAAuthorizeNetProcessor {
  constructor() {
    this.apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
    this.transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
    this.sandbox = process.env.NODE_ENV !== 'production';
    this.apiUrl = this.sandbox 
      ? 'https://apitest.authorize.net/xml/v1/request.api'
      : 'https://api.authorize.net/xml/v1/request.api';
  }

  async processCannabisPayment(payment: CannabisPayment) {
    // 1. Pre-payment validation
    await this.validateCannabisCompliance(payment);
    
    // 2. Create Authorize.Net transaction
    const transactionRequest = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: this.apiLoginId,
          transactionKey: this.transactionKey
        },
        transactionRequest: {
          transactionType: 'authCaptureTransaction',
          amount: payment.total_amount,
          payment: {
            creditCard: payment.card_data
          },
          order: {
            invoiceNumber: payment.invoice_number,
            description: `Cannabis Order - Texas DSHS #690`
          },
          userFields: [
            { name: 'cannabis_license', value: 'Texas-DSHS-690' },
            { name: 'age_verified', value: payment.age_verified.toString() },
            { name: 'thc_compliant', value: 'true' }
          ]
        }
      }
    };
    
    // 3. Process payment with retry logic
    return await this.executeWithRetry(transactionRequest);
  }
}
```
