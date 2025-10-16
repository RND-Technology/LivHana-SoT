## Example Usage

```ts
const body: CreateInvoiceRequest = {
  invoice: {
    locationId: 'ES0RJRZYEC39A',
    orderId: 'CAISENgvlJ6jLWAzERDzjyHVybY',
    primaryRecipient: {
      customerId: 'JDKYHBWT1D4F8MFH63DBMEN8Y4',
    },
    paymentRequests: [
      {
        requestType: 'BALANCE',
        dueDate: '2030-01-24',
        tippingEnabled: true,
        automaticPaymentSource: 'NONE',
        reminders: [
          {
            relativeScheduledDays: -1,
            message: 'Your invoice is due tomorrow',
          }
        ],
      }
    ],
    deliveryMethod: 'EMAIL',
    invoiceNumber: 'inv-100',
    title: 'Event Planning Services',
    description: 'We appreciate your business!',
    scheduledAt: '2030-01-13T10:00:00Z',
    acceptedPaymentMethods: {
      card: true,
      squareGiftCard: false,
      bankAccount: false,
      buyNowPayLater: false,
      cashAppPay: false,
    },
    customFields: [
      {
        label: 'Event Reference Number',
        value: 'Ref. #1234',
        placement: 'ABOVE_LINE_ITEMS',
      },
      {
        label: 'Terms of Service',
        value: 'The terms of service are...',
        placement: 'BELOW_LINE_ITEMS',
      }
    ],
    saleOrServiceDate: '2030-01-24',
    storePaymentMethodEnabled: false,
  },
  idempotencyKey: 'ce3748f9-5fc1-4762-aa12-aae5e843f1f4',
};

try {
  const { result, ...httpResponse } = await invoicesApi.createInvoice(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Invoices

Searches for invoices from a location specified in
the filter. You can optionally specify customers in the filter for whom to
retrieve invoices. In the current implementation, you can only specify one location and
optionally one customer.

The response is paginated. If truncated, the response includes a `cursor`
that you use in a subsequent request to retrieve the next set of invoices.

```ts
async searchInvoices(
  body: SearchInvoicesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchInvoicesResponse>>
```
