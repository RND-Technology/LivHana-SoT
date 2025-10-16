## Example Usage

```ts
const body: BulkDeleteCustomersRequest = {
  customerIds: [
    '8DDA5NZVBZFGAX0V3HPF81HHE0',
    'N18CPRVXR5214XPBBA6BZQWF3C',
    '2GYD7WNXF7BJZW1PMGNXZ3Y8M8'
  ],
};

try {
  const { result, ...httpResponse } = await customersApi.bulkDeleteCustomers(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Retrieve Customers

Retrieves multiple customer profiles.

This endpoint takes a list of customer IDs and returns a map of responses.

```ts
async bulkRetrieveCustomers(
  body: BulkRetrieveCustomersRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkRetrieveCustomersResponse>>
```
