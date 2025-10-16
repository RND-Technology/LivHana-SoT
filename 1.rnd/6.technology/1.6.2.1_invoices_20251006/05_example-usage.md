## Example Usage

```ts
const locationId = 'location_id4';

try {
  const { result, ...httpResponse } = await invoicesApi.listInvoices(locationId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Invoice

Creates a draft [invoice](../../doc/models/invoice.md)
for an order created using the Orders API.

A draft invoice remains in your account and no action is taken.
You must publish the invoice before Square can process it (send it to the customer's email address or charge the customer’s card on file).

```ts
async createInvoice(
  body: CreateInvoiceRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateInvoiceResponse>>
```
