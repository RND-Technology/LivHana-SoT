## Example Usage

```ts
const invoiceId = 'invoice_id0';

const request: CreateInvoiceAttachmentRequest = {
  idempotencyKey: 'ae5e84f9-4742-4fc1-ba12-a3ce3748f1c3',
  description: 'Service contract',
};

try {
  const { result, ...httpResponse } = await invoicesApi.createInvoiceAttachment(
  invoiceId,
  request
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

# Delete Invoice Attachment

Removes an attachment from an invoice and permanently deletes the file. Attachments can be removed only
from invoices in the `DRAFT`, `SCHEDULED`, `UNPAID`, or `PARTIALLY_PAID` state.

```ts
async deleteInvoiceAttachment(
  invoiceId: string,
  attachmentId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteInvoiceAttachmentResponse>>
```
