## Example Usage

```ts
const customerId = 'customer_id8';

const groupId = 'group_id0';

try {
  const { result, ...httpResponse } = await customersApi.addGroupToCustomer(
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
