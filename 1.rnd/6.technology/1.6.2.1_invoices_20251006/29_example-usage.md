## Example Usage

```ts
const invoiceId = 'invoice_id0';

const body: CancelInvoiceRequest = {
  version: 0,
};

try {
  const { result, ...httpResponse } = await invoicesApi.cancelInvoice(
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

# Publish Invoice

Publishes the specified draft invoice.

After an invoice is published, Square
follows up based on the invoice configuration. For example, Square
sends the invoice to the customer's email address, charges the customer's card on file, or does
nothing. Square also makes the invoice available on a Square-hosted invoice page.

The invoice `status` also changes from `DRAFT` to a status
based on the invoice configuration. For example, the status changes to `UNPAID` if
Square emails the invoice or `PARTIALLY_PAID` if Square charges a card on file for a portion of the
invoice amount.

In addition to the required `ORDERS_WRITE` and `INVOICES_WRITE` permissions, `CUSTOMERS_READ`
and `PAYMENTS_WRITE` are required when publishing invoices configured for card-on-file payments.

```ts
async publishInvoice(
  invoiceId: string,
  body: PublishInvoiceRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<PublishInvoiceResponse>>
```
