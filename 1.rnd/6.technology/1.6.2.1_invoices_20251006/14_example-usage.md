## Example Usage

```ts
const invoiceId = 'invoice_id0';

try {
  const { result, ...httpResponse } = await invoicesApi.deleteInvoice(invoiceId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Get Invoice

Retrieves an invoice by invoice ID.

```ts
async getInvoice(
  invoiceId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<GetInvoiceResponse>>
```
