## Example Usage

```ts
const customerId = 'customer_id8';

try {
  const { result, ...httpResponse } = await customersApi.deleteCustomer(customerId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Customer

Returns details for a single customer.

```ts
async retrieveCustomer(
  customerId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveCustomerResponse>>
```
