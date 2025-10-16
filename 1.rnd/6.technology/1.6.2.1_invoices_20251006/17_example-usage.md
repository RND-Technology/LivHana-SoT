## Example Usage

```ts
const invoiceId = 'invoice_id0';

try {
  const { result, ...httpResponse } = await invoicesApi.getInvoice(invoiceId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Invoice

Updates an invoice. This endpoint supports sparse updates, so you only need
to specify the fields you want to change along with the required `version` field.
Some restrictions apply to updating invoices. For example, you cannot change the
`order_id` or `location_id` field.

```ts
async updateInvoice(
  invoiceId: string,
  body: UpdateInvoiceRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateInvoiceResponse>>
```
