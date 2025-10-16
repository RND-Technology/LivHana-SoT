## Example Usage

```ts
const body: BulkRetrieveCustomersRequest = {
  customerIds: [
    '8DDA5NZVBZFGAX0V3HPF81HHE0',
    'N18CPRVXR5214XPBBA6BZQWF3C',
    '2GYD7WNXF7BJZW1PMGNXZ3Y8M8'
  ],
};

try {
  const { result, ...httpResponse } = await customersApi.bulkRetrieveCustomers(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Update Customers

Updates multiple customer profiles.

This endpoint takes a map of individual update requests and returns a map of responses.

You cannot use this endpoint to change cards on file. To make changes, use the [Cards API](../../doc/api/cards.md) or [Gift Cards API](../../doc/api/gift-cards.md).

```ts
async bulkUpdateCustomers(
  body: BulkUpdateCustomersRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkUpdateCustomersResponse>>
```
