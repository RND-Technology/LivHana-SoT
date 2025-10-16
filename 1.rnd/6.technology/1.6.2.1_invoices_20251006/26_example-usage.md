## Example Usage

```ts
const invoiceId = 'invoice_id0';

const attachmentId = 'attachment_id6';

try {
  const { result, ...httpResponse } = await invoicesApi.deleteInvoiceAttachment(
  invoiceId,
  attachmentId
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

# Cancel Invoice

Cancels an invoice. The seller cannot collect payments for
the canceled invoice.

You cannot cancel an invoice in the `DRAFT` state or in a terminal state: `PAID`, `REFUNDED`, `CANCELED`, or `FAILED`.

```ts
async cancelInvoice(
  invoiceId: string,
  body: CancelInvoiceRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CancelInvoiceResponse>>
```
