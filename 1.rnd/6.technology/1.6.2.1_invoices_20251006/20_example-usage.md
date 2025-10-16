## Example Usage

```ts
const invoiceId = 'invoice_id0';

const body: UpdateInvoiceRequest = {
  invoice: {
    version: 1,
    paymentRequests: [
      {
        uid: '2da7964f-f3d2-4f43-81e8-5aa220bf3355',
        tippingEnabled: false,
        reminders: [
          {
          },
          {
          },
          {
          }
        ],
      }
    ],
  },
  idempotencyKey: '4ee82288-0910-499e-ab4c-5d0071dad1be',
};

try {
  const { result, ...httpResponse } = await invoicesApi.updateInvoice(
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

# Create Invoice Attachment

Uploads a file and attaches it to an invoice. This endpoint accepts HTTP multipart/form-data file uploads
with a JSON `request` part and a `file` part. The `file` part must be a `readable stream` that contains a file
in a supported format: GIF, JPEG, PNG, TIFF, BMP, or PDF.

Invoices can have up to 10 attachments with a total file size of 25 MB. Attachments can be added only to invoices
in the `DRAFT`, `SCHEDULED`, `UNPAID`, or `PARTIALLY_PAID` state.

```ts
async createInvoiceAttachment(
  invoiceId: string,
  request?: CreateInvoiceAttachmentRequest,
  imageFile?: FileWrapper,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateInvoiceAttachmentResponse>>
```
