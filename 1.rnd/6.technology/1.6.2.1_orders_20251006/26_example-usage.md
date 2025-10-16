## Example Usage

```ts
const orderId = 'order_id6';

const body: PayOrderRequest = {
  idempotencyKey: 'c043a359-7ad9-4136-82a9-c3f1d66dcbff',
  paymentIds: [
    'EnZdNAlWCmfh6Mt5FMNST1o7taB',
    '0LRiVlbXVwe8ozu4KbZxd12mvaB'
  ],
};

try {
  const { result, ...httpResponse } = await ordersApi.payOrder(
  orderId,
  body
);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```
