## Example Usage

```ts
const customerId = 'customer_id8';

const body: CreateCustomerCardRequest = {
  cardNonce: 'YOUR_CARD_NONCE',
  billingAddress: {
    addressLine1: '500 Electric Ave',
    addressLine2: 'Suite 600',
    locality: 'New York',
    administrativeDistrictLevel1: 'NY',
    postalCode: '10003',
    country: 'US',
  },
  cardholderName: 'Amelia Earhart',
};

try {
  const { result, ...httpResponse } = await customersApi.createCustomerCard(
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

# Delete Customer Card

**This endpoint is deprecated.**

Removes a card on file from a customer.

```ts
async deleteCustomerCard(
  customerId: string,
  cardId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteCustomerCardResponse>>
```
