## Example Usage

```ts
const locationId = 'location_id4';

const key = 'key0';

const body: UpsertLocationCustomAttributeRequest = {
  customAttribute: {
  },
};

try {
  const { result, ...httpResponse } = await locationCustomAttributesApi.upsertLocationCustomAttribute(
  locationId,
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
