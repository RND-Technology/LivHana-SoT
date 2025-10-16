## Example Usage

```ts
const customerId = 'customer_id8';

try {
  const { result, ...httpResponse } = await customersApi.retrieveCustomer(customerId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Customer

Updates a customer profile. This endpoint supports sparse updates, so only new or changed fields are required in the request.
To add or update a field, specify the new value. To remove a field, specify `null`.

To update a customer profile that was created by merging existing profiles, you must use the ID of the newly created profile.

You cannot use this endpoint to change cards on file. To make changes, use the [Cards API](../../doc/api/cards.md) or [Gift Cards API](../../doc/api/gift-cards.md).

```ts
async updateCustomer(
  customerId: string,
  body: UpdateCustomerRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateCustomerResponse>>
```
