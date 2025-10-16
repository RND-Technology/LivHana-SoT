## Example Usage

```ts
const invoiceId = 'invoice_id0';

const body: PublishInvoiceRequest = {
  version: 1,
  idempotencyKey: '32da42d0-1997-41b0-826b-f09464fc2c2e',
};

try {
  const { result, ...httpResponse } = await invoicesApi.publishInvoice(
  invoiceId,
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
