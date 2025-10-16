## Example Usage

```ts
const id = 'id0';

const body: UpdatePaymentLinkRequest = {
  paymentLink: {
    version: 1,
    checkoutOptions: {
      askForShippingAddress: true,
    },
  },
};

try {
  const { result, ...httpResponse } = await checkoutApi.updatePaymentLink(
  id,
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
