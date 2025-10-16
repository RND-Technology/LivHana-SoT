## Example Usage

```ts
const customerId = 'customer_id8';

const groupId = 'group_id0';

try {
  const { result, ...httpResponse } = await customersApi.removeGroupFromCustomer(
  customerId,
  groupId
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

# Add Group to Customer

Adds a group membership to a customer.

The customer is identified by the `customer_id` value
and the customer group is identified by the `group_id` value.

```ts
async addGroupToCustomer(
  customerId: string,
  groupId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<AddGroupToCustomerResponse>>
```
