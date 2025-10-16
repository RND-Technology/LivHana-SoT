## Example Usage

```ts
const customerId = 'customer_id8';

const cardId = 'card_id4';

try {
  const { result, ...httpResponse } = await customersApi.deleteCustomerCard(
  customerId,
  cardId
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

# Remove Group From Customer

Removes a group membership from a customer.

The customer is identified by the `customer_id` value
and the customer group is identified by the `group_id` value.

```ts
async removeGroupFromCustomer(
  customerId: string,
  groupId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RemoveGroupFromCustomerResponse>>
```
