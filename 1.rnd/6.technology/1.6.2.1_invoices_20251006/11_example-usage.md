## Example Usage

```ts
const body: SearchInvoicesRequest = {
  query: {
    filter: {
      locationIds: [
        'ES0RJRZYEC39A'
      ],
      customerIds: [
        'JDKYHBWT1D4F8MFH63DBMEN8Y4'
      ],
    },
    sort: {
      field: 'INVOICE_SORT_DATE',
      order: 'DESC',
    },
  },
};

try {
  const { result, ...httpResponse } = await invoicesApi.searchInvoices(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Invoice

Deletes the specified invoice. When an invoice is deleted, the
associated order status changes to CANCELED. You can only delete a draft
invoice (you cannot delete a published invoice, including one that is scheduled for processing).

```ts
async deleteInvoice(
  invoiceId: string,
  version?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteInvoiceResponse>>
```
