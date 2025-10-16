## Example Usage

```ts
const customerId = 'customer_id8';

const key = 'key0';

const body: UpsertCustomerCustomAttributeRequest = {
  customAttribute: {
  },
};

try {
  const { result, ...httpResponse } = await customerCustomAttributesApi.upsertCustomerCustomAttribute(
  customerId,
  key,
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
