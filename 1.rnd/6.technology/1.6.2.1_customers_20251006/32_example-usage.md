## Example Usage

```ts
const customerId = 'customer_id8';

const body: UpdateCustomerRequest = {
  emailAddress: 'New.Amelia.Earhart@example.com',
  phoneNumber: 'phone_number2',
  note: 'updated customer note',
  version: BigInt(2),
};

try {
  const { result, ...httpResponse } = await customersApi.updateCustomer(
  customerId,
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

# Create Customer Card

**This endpoint is deprecated.**

Adds a card on file to an existing customer.

As with charges, calls to `CreateCustomerCard` are idempotent. Multiple
calls with the same card nonce return the same card record that was created
with the provided nonce during the _first_ call.

```ts
async createCustomerCard(
  customerId: string,
  body: CreateCustomerCardRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateCustomerCardResponse>>
```
