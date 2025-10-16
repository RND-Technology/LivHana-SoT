## Example Usage

```ts
const merchantId = 'merchant_id0';

const key = 'key0';

const body: UpsertMerchantCustomAttributeRequest = {
  customAttribute: {
  },
};

try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.upsertMerchantCustomAttribute(
  merchantId,
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
