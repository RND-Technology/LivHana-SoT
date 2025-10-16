## Example Usage

```ts
const orderId = 'order_id6';

const customAttributeKey = 'custom_attribute_key2';

const body: UpsertOrderCustomAttributeRequest = {
  customAttribute: {
  },
};

try {
  const { result, ...httpResponse } = await orderCustomAttributesApi.upsertOrderCustomAttribute(
  orderId,
  customAttributeKey,
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
